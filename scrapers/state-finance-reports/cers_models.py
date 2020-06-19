"""
Models for data pulled from Montana COPP Campaign Electronic Reporting System

Components
- Interface - List of queries (e.g. all statewide 2020 candidates)
- CandidateList - List of particular types of candidates (e.g. statewide)
- Candidate - Individual candidates
- Report - Individual financial reports (C-5s)

Design philosiphy: Front-load all slow API calls in object initialization.
Should provide more flexibility with avoiding duplicate scraping.

Ref: https://blog.hartleybrody.com/web-scraping-cheat-sheet/

TODO:
- Add logic for fetching/aggregating report financial summaries to catch non-itemized contributions (adapt fetch-finance-summaries.py)
- Build testing suite --> Or just prep an iPython notebook with tests for each individual component?
"""

import requests
import pandas as pd
from io import StringIO

from datetime import date
from datetime import datetime
from dateutil.parser import parse

import os
import json

import re
from bs4 import BeautifulSoup

# Hacky - Alternative reports for places where CERS is choking
# id: filename: filePath (.csv downloaded from CERS on a good day)
MANUAL_CACHES = {
    46348: 'scrapers/state-finance-reports/raw/Cooney-Mike--R/manual-46348-cooney-q42019-contributions.csv',
    45786: 'scrapers/state-finance-reports/raw/Cooney-Mike--R/manual-45786-cooney-q32019-contributions.csv',
    46959: 'scrapers/state-finance-reports/raw/Cooney-Mike--R/manual-46959-cooney-q12020-contributions.csv',
    47635: 'scrapers/state-finance-reports/raw/Cooney-Mike--R/manual-47635-cooney-apr2020-contributions.csv',
    48320: 'scrapers/state-finance-reports/raw/Cooney-Mike--R/manual-48320-cooney-may2020-contributions.csv',
}

class CandidateList:
    """List of candidates from specific search
    - fetchReports - flag to run costly scrape of individual financial reports
    - filterStatuses - if non-false, filter to candidates with statuses in array
    
    """
    def __init__(self,search,
        fetchReports=True, fetchFullReports=True,
        filterStatuses=False, excludeCandidates=[], 
        cachePath='scrapers/state-finance-reports/raw',
        checkCache=True, writeCache=True,

        ):
        candidate_list = self._fetch_candidate_list(search)
        if filterStatuses:
            candidate_list = [c for c in candidate_list if c['candidateStatusDescr'] in filterStatuses]
        if len(excludeCandidates) > 0:
            candidate_list = [c for c in candidate_list if c['candidateId'] not in excludeCandidates]
        self.candidates = [Candidate(c,
            fetchReports=fetchReports,
            fetchFullReports=fetchFullReports,
            cachePath=cachePath,
            checkCache=checkCache,
            writeCache=writeCache
            ) for c in candidate_list]
        if fetchReports and fetchFullReports:
            self.contributions = self._get_contributions()
            self.expenditures = self._get_expenditures()
            print(f'{len(self.candidates)} candidates compiled with {len(self.contributions)} contributions and {len(self.expenditures)} expenditures')

    def _fetch_candidate_list(self, search, raw=False, filterStatuses=False):
        session = requests.Session()
        candidate_search_url = 'https://cers-ext.mt.gov/CampaignTracker/public/searchResults/searchCandidates'
        max_candidates = 1000
        candidate_list_url = f"""
        https://cers-ext.mt.gov/CampaignTracker/public/searchResults/listCandidateResults?sEcho=1&iColumns=9&sColumns=&iDisplayStart=0&iDisplayLength={max_candidates}&mDataProp_0=checked&mDataProp_1=candidateName&mDataProp_2=electionYear&mDataProp_3=candidateStatusDescr&mDataProp_4=c3FiledInd&mDataProp_5=candidateAddress&mDataProp_6=candidateTypeDescr&mDataProp_7=officeTitle&mDataProp_8=resCountyDescr&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=true&sSearch_6=&bRegex_6=false&bSearchable_6=true&sSearch_7=&bRegex_7=false&bSearchable_7=true&sSearch_8=&bRegex_8=false&bSearchable_8=true&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=false&bSortable_5=false&bSortable_6=true&bSortable_7=true&bSortable_8=true&_=1586980078555
        """
    
        session.post(candidate_search_url, search)
        r = session.get(candidate_list_url)
        full = r.json()['aaData']

        if raw:
            return full

        cleaned = list(map(lambda d: {
            'candidateId': d['candidateId'],
            'candidateName': d['candidateName'],
            'candidateLastName': d['personDTO']['lastName'],
            'partyDescr': d['partyDescr'],
            'electionYear': d['electionYear'],
            'resCountyDescr': d['resCountyDescr'],
            'officeTitle': d['officeTitle'],
            'candidateStatusDescr': d['candidateStatusDescr'],
            # More available here - home address, phone, etc.
        }, full))
        return cleaned

    def get_candidate(self, id):
        return [c for c in self.candidates if c.id == id][0]

    def list_candidates(self):
        return [c.data for c in self.candidates]

    def list_reports(self):
        # TODO: Flatten this
        reports_by_candidate = [c.list_reports() for c in self.candidates]
        return reports_by_candidate

    def list_candidates_with_reports(self):
        return [{**c.data, 'reports': c.list_reports()} for c in self.candidates]

    def export(self, base_dir):
        for candidate in self.candidates:
            candidate.export(base_dir)

    def _get_contributions(self):
        if len(self.candidates) == 0:
            # print(f'No candidates on list')
            return pd.DataFrame()
        
        df = pd.DataFrame()
        for candidate in self.candidates:
            df = df.append(candidate.contributions)
        return df
    
    def _get_expenditures(self):
        if len(self.candidates) == 0:
            # print(f'No candidates on list')
            return pd.DataFrame()
        
        df = pd.DataFrame()
        for candidate in self.candidates:
            df = df.append(candidate.expenditures)
        return df

class Candidate:
    """
    Single candidate for given election cycle
    """
    def __init__(self, data, cachePath='scrapers/state-finance-reports/raw', fetchSummary=True, fetchReports=True, fetchFullReports=True, checkCache=True, writeCache=True):
        self.id = data['candidateId']
        self.name = data['candidateName']
        self.slug = self.name.strip().replace(' ','-').replace(',','')
        self.data = data
        self.finance_reports = []

        cachePath = os.path.join(cachePath, self.slug)

        if fetchReports:
            self.raw_reports = self._fetch_candidate_finance_reports()
        if (fetchReports and fetchFullReports):
            print(f'## Fetching {len(self.raw_reports)} finance reports for {self.name} ({self.id})')
            self.finance_reports = [Report(r, cachePath=cachePath, checkCache=checkCache, writeCache=writeCache, fetchFullReports=fetchFullReports) for r in self.raw_reports]
            self.summary = self._get_summary()
            self.contributions = self._get_contributions()
            self.expenditures = self._get_expenditures()
            # self.unitemized_contributions = self._get_unitemized_contributions()
            self.summarized_reports = self._summarize_reports()
            print(f'Found {len(self.contributions)} contributions and {len(self.expenditures)} expenditures in {len(self.finance_reports)} reports')
            self.export(cachePath)
            print('\n')

    def _fetch_candidate_finance_reports(self, raw=False):
        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/publicReportList/retrieveCampaignReports'
        list_max=1000
        get_url = f"""
        https://cers-ext.mt.gov/CampaignTracker/public/publicReportList/listFinanceReports?sEcho=1&iColumns=6&sColumns=&iDisplayStart=0&iDisplayLength={list_max}&mDataProp_0=checked&mDataProp_1=fromDateStr&mDataProp_2=toDateStr&mDataProp_3=formTypeDescr&mDataProp_4=formTypeCode&mDataProp_5=statusDescr&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=true&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=true&_=1549557879524
        """
        post_payload = {
            'candidateId': self.id,
            'searchType': '',
            'searchPage': 'public',
        }
        session = requests.Session()
        session.post(post_url, post_payload)
        r = session.get(get_url)
        full = r.json()['aaData']
        if raw:
            return full
        
        cleaned = list(map(lambda d: {
            'reportId': d['reportId'],
            'fromDateStr': d['fromDateStr'],
            'toDateStr': d['toDateStr'],
            'formTypeCode': d['formTypeCode'],
            'formTypeDescr': d['formTypeDescr'],
            'candidateId': d['candidateDTO']['candidateId'],
            'candidateName': d['candidateDTO']['candidateName'],
            'officeTitle': d['candidateDTO']['officeTitle'],
            'electionYear': d['candidateDTO']['electionYear'],
            'statusDescr': d['statusDescr'],
            "amendedDate": d['amendedDate']
        }, full))
        return cleaned
        
    def list_reports(self):
        return self.raw_reports

    def list_report_summaries(self):
        summaries = [c.summary for c in self.finance_reports]
        summaries_sorted = sorted(summaries, key=lambda i: parse(i['report_end_date']))
        return summaries_sorted

    def export(self, write_dir):
        # write_dir = os.path.join(base_dir, self.slug)
        # make folder if it doesn't exist
        if not os.path.exists(write_dir):
            os.makedirs(write_dir)
        summary_path = os.path.join(os.getcwd(), write_dir, self.slug + '-summary.json')
        contributions_path = os.path.join(os.getcwd(), write_dir, self.slug + '-contributions-itemized.json')
        expenditures_path = os.path.join(os.getcwd(), write_dir, self.slug + '-expenditures-itemized.json')
        summary = {
            'slug': self.slug,
            'candidateName': self.name,
            'scrape_date': date.today().strftime('%Y-%m-%d'),
            'officeTitle': self.data['officeTitle'],
            'partyDescr': self.data['partyDescr'],
            'periods': len(self.finance_reports),
            'receipts': self.summary['contributions']['total'],
            'expenditures': self.summary['expenditures']['total'],
            'balance': self.summary['cash_on_hand']['total'],
            'summary': self.summary,
            # 'unitemized_contributions': self.unitemized_contributions,
            'reports': self.summarized_reports
        }
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=4)
        self.contributions.to_json(contributions_path, orient='records')
        self.expenditures.to_json(expenditures_path, orient='records')
        print(self.slug, 'written to', os.path.join(os.getcwd(), write_dir))


    def _get_summary(self):
        c5_summaries = [r.summary for r in self.finance_reports if r.type == 'C5']
        # c5_summaries = sorted(c5_summaries, key=lambda i: parse(i['report_end_date']))

        c7_summaries = [r.summary for r in self.finance_reports if r.type == 'C7']
        c7e_summaries = [r.summary for r in self.finance_reports if r.type == 'C7E']

        summaries = c5_summaries + c7_summaries + c7e_summaries
        summaries = sorted(summaries, key=lambda i: parse(i['report_end_date']))

        pri_contributions = sum(s['Receipts']['primary'] for s in summaries)
        gen_contributions = sum(s['Receipts']['general'] for s in summaries)
        tot_contributions = sum(s['Receipts']['total'] for s in summaries)

        pri_expenditures = sum(s['Expenditures']['primary'] for s in summaries)
        gen_expenditures = sum(s['Expenditures']['general'] for s in summaries)
        tot_expenditures = sum(s['Expenditures']['total'] for s in summaries)

        return {
            'contributions': {
                'primary': pri_contributions,
                'general': gen_contributions,
                'total': tot_contributions,
            },
            'expenditures': {
                'primary': pri_expenditures,
                'general': gen_expenditures,
                'total': tot_expenditures,
            },
            'cash_on_hand': {
                'primary': pri_contributions - pri_expenditures,
                'general': gen_contributions - gen_expenditures,
                'total': tot_contributions - tot_expenditures,
            },
            'report_counts': {
                'C5': len(c5_summaries),
                'C7': len(c7_summaries),
                'C7E': len(c7e_summaries),
            }
        }

    def _get_contributions(self):
        """
        Return all contributions to candidate across multiple reports
        """
        if len(self.finance_reports) == 0:
            return pd.DataFrame()
        
        df = pd.DataFrame()
        for report in self.finance_reports:
            dfi = report.contributions.copy()
            dfi.insert(0, 'Candidate', self.name)
            dfi.insert(1, 'Reporting Period', f'{report.start_date} to {report.end_date}' )
            dfi.insert(2, 'Report Type', report.type)
            df = df.append(dfi)
        return df
        

    def _get_expenditures(self):
        """
        Return all expenditures made by candidate across multiple reports
        """
        if len(self.finance_reports) == 0:
            return pd.DataFrame()
        
        df = pd.DataFrame()
        for report in self.finance_reports:
            dfi = report.expenditures.copy()
            dfi.insert(0, 'Candidate', self.name)
            dfi.insert(1, 'Reporting Period', f'{report.start_date} to {report.end_date}' )
            dfi.insert(2, 'Report Type', report.type)
            df = df.append(dfi)
        return df

    def _summarize_reports(self):
        """
        Return total + by-report unitemized contributions
        """
        reports = self.finance_reports
        return [{
            'report': r.label,
            'id': r.id,
            'type': r.data['formTypeCode'],
            'start_date': r.start_date,
            'end_date': r.end_date,
            'unitemized_contributions': r.unitemized_contributions,
            'num_contributions': len(r.contributions),
            'num_expenditures': len(r.expenditures),
            'summary': r.summary
        } for r in reports]

class Report:
    def __init__(self, data, cachePath, checkCache=True, writeCache=True, fetchFullReports=True):
        self.id = data['reportId']
        self.data = data
        self.type = data['formTypeCode']
        self.start_date = data['fromDateStr']
        self.end_date = data['toDateStr']
        self.label = f'{self.start_date} to {self.end_date}'

        self.fetchFullReports = fetchFullReports

        self.contributions = pd.DataFrame()
        self.expenditures = pd.DataFrame()
    
        filePath = os.path.join(cachePath, f'{self.type}-{self.id}.json')

        if checkCache and os.path.isfile(filePath):
            self._get_cached_data(filePath)
            # This checks for updates and reroutes for newly amended forms

        elif (self.type == 'C5'):      
            if self.id in MANUAL_CACHES.keys():
                # Files that I'm having a hard time downloading from CERS
                self._get_c5_data_from_manual_cache()
            else:
                self._get_c5_data_from_scrape()   
        elif (self.type == 'C7'):
            self._get_c7_data_from_scrape() 
        elif (self.type == 'C7E'):
            self._get_c7e_data_from_scrape()
        else:
            print('Warning - unhandled report type', self.type, self.id)
            self.expenditures = pd.DataFrame()
            self.contributions = pd.DataFrame()
            self.unitemized_contributions = 0
            self.summary = {
                'report_start_date': self.start_date,
                'report_end_date': self.end_date,
            }

        # Add cache
        if writeCache:
                if not os.path.exists(cachePath): os.makedirs(cachePath)
                self.export(filePath)  
    
    def _get_cached_data(self, file_path):
        print(f'--- From cache, loading {self.type} {self.start_date}-{self.end_date} ({self.id})')
        with open(file_path) as f:
            cache = json.load(f)

        if (('data' in cache) and (cache['data']['amendedDate'] == self.data['amendedDate'])):
            self.summary = cache['summary']
            self.contributions = pd.read_json(cache['contributions'])
            self.expenditures = pd.read_json(cache['expenditures'])
            self.unitemized_contributions = self._calc_unitemized_contributions()

            print(self.contributions[['Entity Name','Amount']])
            print(self.contributions['Amount'].sum())
        else:
            print(f'----- Actually, amendment found on {self.id}')
            if self.id in MANUAL_CACHES.keys():
                if (self.type != 'C5'): print('Wrong report type')
                self._get_c5_data_from_manual_cache()
            elif self.type == 'C5':
                self._get_c5_data_from_scrape()
            elif self.type == 'C7':
                self._get_c7_data_from_scrape()
            elif self.type == 'C7E':
                self._get_c7e_data_from_scrape()
            else:
                print('Bad cache on unhandled report type', self.type)

    def _get_c5_data_from_manual_cache(self):
        file = MANUAL_CACHES[self.id]
        print(f'Fetching manual cache {file}')
        self.summary = self._fetch_report_summary()
        if self.fetchFullReports:
            self.contributions = pd.read_csv(file, sep='|', error_bad_lines=False, warn_bad_lines=True, index_col=False)
            self.expenditures = self._fetch_expenditures_schedule()
            # TODO - move this to cleaning step?
            self.unitemized_contributions = self._calc_unitemized_contributions()

    def _get_c5_data_from_scrape(self):
        print(f'Fetching C5 {self.start_date}-{self.end_date} ({self.id})')
        self.summary = self._fetch_report_summary()
        if self.fetchFullReports:
            self.contributions = self._fetch_contributions_schedule()
            self.expenditures = self._fetch_expenditures_schedule()
            # TODO - move this to cleaning step?
            self.unitemized_contributions = self._calc_unitemized_contributions()

    def _get_c7_data_from_scrape(self):
        print(f'Fetching C7 {self.start_date}-{self.end_date} ({self.id})')

        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/retrieveReport'
        post_payload = {
            'candidateId': self.data['candidateId'],
            'reportId': self.id,
            'searchPage': 'public'
        }
        session = requests.Session()
        session.post(post_url, post_payload)

        # C7 reports contain a bunch of different tables - need to parse each individually
        detail_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/financeRepDetailList'
        candidate_name = self.data['candidateName']

        individual_raw = session.post(detail_url, {'listName': "individual"})
        individual = self._parse_c7_table(individual_raw, candidate_name)
        
        committees_raw = session.post(detail_url, {'listName': "committee"})
        committees = self._parse_c7_table(committees_raw, candidate_name)

        loans_raw = session.post(detail_url, {'listName': "loan"})
        loans = self._parse_c7_table(loans_raw, candidate_name)

        # For time being, just check other categories are null
        candidate_raw = session.post(detail_url, {'listName': "candidate"})
        if (candidate_raw.json() != []): print('## Need to handle C7 candidate self contributions')

        fundraisers_raw = session.post(detail_url, {'listName': "fundraisers"})
        if (fundraisers_raw.json() != []): print('## Need to handle C7 fundraiers')

        refunds_raw = session.post(detail_url, {'listName': "refunds"})
        if (refunds_raw.json() != []): print('## Need to handle C7 refunds')

        payments_raw = session.post(detail_url, {'listName': "payment"})
        if (payments_raw.json() != []): print('## Need to handle C7 payments')

        # print('B',pd.DataFrame(individual).iloc[3])
        contributions = pd.DataFrame(individual + committees + loans)
        expenditures = pd.DataFrame() # Reported w/ C7E

        self.expenditures = expenditures
        self.contributions = contributions
        self.unitemized_contributions = 0
        self.summary = {
            'report_start_date': self.start_date,
            'report_end_date': self.end_date,
            "Receipts": {
                "primary": contributions[contributions['Election Type'] == 'Primary']['Amount'].sum(),
                "general": contributions[contributions['Election Type'] == 'General']['Amount'].sum(),
                "total": contributions['Amount'].sum()
            },
            "Expenditures": {
                "primary": 0,
                "general": 0,
                "total": 0
            },
        }

    def _get_c7e_data_from_scrape(self):
        print(f'Fetching C7E {self.start_date}-{self.end_date} ({self.id})')
        # print(self.data)

        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/retrieveReport'
        post_payload = {
            'candidateId': self.data['candidateId'],
            'reportId': self.id,
            'searchPage': 'public'
        }
        session = requests.Session()
        session.post(post_url, post_payload)

        detail_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/financeRepDetailList'

        expenditures_raw = session.post(detail_url, {'listName': "expendOther"})
        expenditures = self._parse_c7e_table(expenditures_raw)

        # Unhandled for now
        candidate_raw = session.post(detail_url, {'listName': "candidate"})
        if (candidate_raw.json() != []): print('## Need to handle C7E candidate expenditures')

        pettycash_raw = session.post(detail_url, {'listName': "pettyCash"})
        if (pettycash_raw.json() != []): print('## Need to handle C7E petty cash')

        debt_raw = session.post(detail_url, {'listName': "debtLoan"})
        if (debt_raw.json() != []): print('## Need to handle debts --')

        expenditures = pd.DataFrame(expenditures)
        self.expenditures = expenditures
        self.contributions = pd.DataFrame()
        self.unitemized_contributions = 0
        self.summary = {
            'report_start_date': self.start_date,
            'report_end_date': self.end_date,
            'Receipts': {
                "primary": 0,
                "general": 0,
                "total": 0
            },
            'Expenditures': {
                "primary": expenditures[expenditures['Election Type'] == 'Primary']['Amount'].sum(),
                "general": expenditures[expenditures['Election Type'] == 'General']['Amount'].sum(),
                "total": expenditures['Amount'].sum()
            }
        }

    def export(self, filePath):
        output = {
            'data': self.data,
            'summary': self.summary,
            'contributions': self.contributions.to_json(orient='records'),
            'expenditures': self.expenditures.to_json(orient='records'),
            'unitemized_contributions': self.unitemized_contributions,
        }
        with open(filePath, 'w') as f:
            json.dump(output, f, indent=4)
        # print(f'Cached to {filePath}')

    def _fetch_report_summary(self):
        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/retrieveReport'
        post_payload = {
            'candidateId': self.data['candidateId'],
            'reportId': self.id,
            'searchPage': 'public'
        }
        session = requests.Session()
        p = session.post(post_url, post_payload)
        
        # Parse report
        soup = BeautifulSoup(p.text, 'html.parser')
        labels = [
            'previous report',
            'Receipts',
            'Expenditures',
            'Ending Balance',
        ]
        table = soup.find('div', id='summaryAccordionId').find('table')
        parsed = { label: self._parse_html_get_row(table, label) for label in labels }
        parsed['report_start_date'] = self.start_date
        parsed['report_end_date'] = self.end_date
        return parsed

    def _fetch_contributions_schedule(self):
        return self._fetch_c5_schedule('A')

    def _fetch_expenditures_schedule(self):
        return self._fetch_c5_schedule('B')

    def _fetch_c5_schedule(self, schedule):
        report_id = self.id
        candidate_name = self.data['candidateName']

        raw_text = ''

        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/prepareDownloadFileFromSearch'
        get_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/downloadFile'
        post_payload = {
            'reportId': report_id, # This is from checkbox on candidate report page
            'scheduleCode': schedule, # A is contributions, # B is expenditures
            'fname': candidate_name,
        }

        session = requests.Session()
        p = session.post(post_url, post_payload, timeout=120)
        if 'fileName' in p.json():
            r = session.get(get_url, params=p.json())
            if r.text == '':
                print('Empty file. Report ID:', report_id)
            raw_text = r.text
        else:
            print(f'No file for schedule {schedule}, {self.start_date}-{self.end_date}. Report ID:', report_id)

        parsed_text = self._parse_schedule_text(raw_text)
        
        return parsed_text

    def _parse_schedule_text(self, text):
        if (text == ''): return pd.DataFrame()
        parsed = pd.read_csv(StringIO(text), sep='|', error_bad_lines=False, warn_bad_lines=True, index_col=False)
        return parsed

    def _parse_html_get_row(self, table, label):
        # label can be partial text or regex
        row = table.find('td', text=re.compile(label)).parent
        # replaces remove "$" and "," from strings
        pri = self._clean_value(row.find_all('td')[2].text)
        gen =  self._clean_value(row.find_all('td')[3].text)
        return {
            'primary': pri,
            'general': gen,
            'total': round(pri + gen, 2),
        }
    
    def _parse_c7_table(self, raw, candidate):
        cleaned = []
        for row in raw.json():
            addressLn1, city, state, zip_code = self._parse_address(row['entityAddress'])
            # Magic date conversion!
            # date  = datetime.fromtimestamp(row['datePaid'] / 1000).strftime('%m/%d/%y')
            date = self._parse_date(row['datePaid'])
            if (row['cashAmt'] > 0 and row['inKindAmt'] > 0):
                amount_type = 'Mixed'
            elif (row['cashAmt'] > 0):
                amount_type = 'CA'
            elif (row['inKindAmt'] > 0):
                amount_type = 'IK'
            cleaned.append({
                # 'Candidate': candidate, # added at Candidate object level
                # 'Reporting Period': self.label, # added at Candidate object level
                'Date Paid': date,
                'Entity Name': row['entityName'],
                'First Name' : '',
                'Middle Initial': '',
                'Last Name': '',
                'Addr Line1': addressLn1,
                'City': city,
                'State': state,
                'Zip': zip_code,
                'Zip4': '',
                'Country': '',
                'Occupation': row['occupationDescr'],
                'Employer': row['employerDescr'],
                'Contribution Type': row['lineItemCompositeDescr'],
                'Amount': row['totalAmt'],
                'Amount Type': amount_type,
                'Purpose': row['purposeDescr'],
                'Election Type': row['amountTypeDescr'],
                'Total Primary': row['totalToDatePrimary'],
                'Total General': row['totalToDateGeneral'],
                'Refund Transaction Type': '',
                'Refund Original Transaction Date': row['refundOrigTransDate'],
                'Refund Original Transaction Total': row['refundOrigTransTotalVal'],
                'Refund Original Transaction Descr': row['refundOrigTransDesc'],
                'Previous Transaction (Y/N)': row['previousTransactionInd'],
                'Fundraiser Name': row['fundraiserName'],
                'Fundraiser Location': row['fundraiserLocation'],
                'Fundraiser Attendees': row['fundraiserAttendees'],
                'Fundraiser Tickets Sold': row['fundraiserTicketsSold'],
            })
        return cleaned

    def _parse_c7e_table(self, raw):
        cleaned = []
        for row in raw.json():
            addressLn1, city, state, zip_code = self._parse_address(row['entityAddress'])
            date = self._parse_date(row['datePaid'])
            cleaned.append({
                'Date Paid': date,
                'Entity Name': row['entityName'],
                'First Name': '',
                'Middle Initial': '',
                'Last Name': '',
                'Addr Line1': addressLn1,
                'City': city,
                'State': state,
                'Zip': zip_code,
                'Zip4': '',
                'Expenditure Type': row['lineItemCompositeDescr'],
                'Amount': row['totalAmt'],
                'Purpose': row['purposeDescr'],
                'Election Type': row['amountTypeDescr'],
                'Expenditure Paid Communications Platform': row['expenditurePaidCommPlatform'],
                'Expenditure Paid Communications Quantity': row['expenditurePaidCommQuantity'],
                'Expenditure Paid Communications Subject Matter': row['expenditurePaidCommSubMatter']
            })
        return cleaned
    
    def _parse_address(self, raw):
        # Assumes address format '1008 Prospect Ave, Helena, MT 59601'
        # Edge cases will be a pain in the ass here
        address = raw.replace('Washington, DC', 'Washington DC, DC').split(', ')
        addressLn1 = (', ').join(address[0:len(address)-2])
        city = address[-2].strip()
        state_zip = address[-1].split(' ')
        state = state_zip[0]
        zip_code = state_zip[1]

        # hacky Testing
        # if (len(address) != 3):
        #     # print(f'Raw address string: "{raw}"')
        #     print('Address parse warning, not len 3', address)
        #     print([addressLn1,city,state,zip_code])
        if (len(state_zip) != 2): print('Address parse error, not len 2', state_zip)
        if (len(state) != 2): print("State parse error, not len 2", state)

        return addressLn1, city, state, zip_code

    def _parse_date(self, raw):
        return datetime.fromtimestamp(raw / 1000).strftime('%m/%d/%y')

    def _clean_value(self, val):
        if re.compile(r'\(*\)').search(val):
            # check for negative numbers indicated by parenthesis
            return -1 * float(val.replace('$','').replace(',','').replace(',','').replace(')','').replace('(',''))
        else:
            return float(val.replace('$','').replace(',','').replace(',',''))
    
    def _calc_unitemized_contributions(self):
        totalSum = self.summary['Receipts']['total']
        if (len(self.contributions) > 0):
            cashContributions =  self.contributions[self.contributions['Amount Type'] == 'CA']
            itemizedSum = cashContributions['Amount'].sum()
        else:
            itemizedSum = 0
        # Only bothering with totals for now
        return totalSum - itemizedSum