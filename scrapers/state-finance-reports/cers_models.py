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
from dateutil.parser import parse

import os
import json

import re
from bs4 import BeautifulSoup

class CandidateList:
    """List of candidates from specific search
    - fetchReports - flag to run costly scrape of individual financial reports
    - filterStatuses - if non-false, filter to candidates with statuses in array
    
    """
    def __init__(self, search, fetchReports=True, filterStatuses=False):
        candidate_list = self._fetch_candidate_list(search)
        if filterStatuses:
            candidate_list = [c for c in candidate_list if c['candidateStatusDescr'] in filterStatuses]
        self.candidates = [Candidate(c, fetchReports=fetchReports) for c in candidate_list]
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
    def __init__(self, data, fetchRegistration=False, fetchSummary=True, fetchReports=True):
        self.id = data['candidateId']
        self.name = data['candidateName']
        self.data = data
        self.finance_reports = []
        
        if fetchRegistration:
            pass # TODO 

        if fetchReports:
            finance_reports = self._fetch_candidate_finance_reports()
            print(f'## Fetching {len(finance_reports)} finance reports for {self.name}')
            self.finance_reports = [Report(r) for r in finance_reports]
            self.summary = self._get_summary()
            self.contributions = self._get_contributions()
            self.expenditures = self._get_expenditures()
            self.unitemized_contributions = self._get_unitemized_contributions()
            print(f'Found {len(self.contributions)} contributions and {len(self.expenditures)} expenditures in {len(self.finance_reports)} reports\n')

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
        }, full))
        return cleaned
        

    def list_reports(self):
        return [c.data for c in self.finance_reports]

    def list_summaries(self):
        summaries = [c.summary for c in self.finance_reports]
        summaries_sorted = sorted(summaries, key=lambda i: parse(i['report_end_date']))
        return summaries_sorted

    def export(self, base_dir):
        slug = self.name.strip().replace(' ','-').replace(',','')
        write_dir = os.path.join(base_dir, slug)
        # make folder if it doesn't exist
        if not os.path.exists(write_dir):
            os.makedirs(write_dir)
        summary_path = os.path.join(os.getcwd(), write_dir, slug + '-summary.json')
        contributions_path = os.path.join(os.getcwd(), write_dir, slug + '-contributions-itemized.json')
        expenditures_path = os.path.join(os.getcwd(), write_dir, slug + '-expenditures-itemized.json')
        summary = {
            'slug': slug,
            'candidateName': self.name,
            'scrape_date': date.today().strftime('%Y-%m-%d'),
            'officeTitle': self.data['officeTitle'],
            'partyDescr': self.data['partyDescr'],
            'periods': len(self.finance_reports),
            'receipts': self.summary['contributions']['total'],
            'expenditures': self.summary['expenditures']['total'],
            'balance': self.summary['cash_on_hand']['total'],
            'summary': self.summary,
            'unitemized_contributions': self.unitemized_contributions,
        }
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=4)
        self.contributions.to_json(contributions_path, orient='records')
        self.expenditures.to_json(expenditures_path, orient='records')
        print(slug, 'written to', os.path.join(os.getcwd(), write_dir))


    def _get_summary(self):
        summaries = [c.summary for c in self.finance_reports]
        summaries_sorted = sorted(summaries, key=lambda i: parse(i['report_end_date']))
        return {
            'contributions': {
                'primary': sum(s['Receipts']['primary'] for s in summaries_sorted),
                'general': sum(s['Receipts']['general'] for s in summaries_sorted),
                'total': sum(s['Receipts']['total'] for s in summaries_sorted)
            },
            'expenditures': {
                'primary': sum(s['Expenditures']['primary'] for s in summaries_sorted),
                'general': sum(s['Expenditures']['general'] for s in summaries_sorted),
                'total': sum(s['Expenditures']['total'] for s in summaries_sorted)
            },
            'cash_on_hand': summaries_sorted[-1]['Ending Balance']
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
            df = df.append(dfi)
        return df

    def _get_unitemized_contributions(self):
        """
        Return total + by-report unitemized contributions
        """
        reports = self.finance_reports
        by_report = [{
            'report': r.label,
            'unitemized_contributions': r.unitemized_contributions,
        } for r in reports]
        
        return {
            'total': sum(r.unitemized_contributions for r in reports),
            'reports': by_report
        }


class Report:
    def __init__(self, data):
        self.id = data['reportId']
        self.data = data
        self.type = data['formTypeCode']
        self.start_date = data['fromDateStr']
        self.end_date = data['toDateStr']
        self.label = f'{self.start_date} to {self.end_date}'
        
        if (self.type == 'C5'):
            self.summary = self._fetch_report_summary()
            self.contributions = self._fetch_contributions_schedule()
            self.expenditures = self._fetch_expenditures_schedule()
            self.unitemized_contributions = self._calc_unitemized_contributions()
        else:
            print('Warning - unhandled report type', self.type, self.id)
    
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
        p = session.post(post_url, post_payload)
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
    
    def _clean_value(self, val):
        return float(val.replace('$','').replace(',','').replace(',',''))
    
    def _calc_unitemized_contributions(self):
        totalSum = self.summary['Receipts']['total']
        if (len(self.contributions) > 0):
            itemizedSum = self.contributions['Amount'].sum()
        else:
            itemizedSum = 0
        # Only bothering with totals for now
        return totalSum - itemizedSum