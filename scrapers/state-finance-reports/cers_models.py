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
            self.contributions = self._get_contributions()
            self.expenditures = self._get_expenditures()
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

class Report:
    def __init__(self, data):
        self.id = data['reportId']
        self.data = data
        self.type = data['formTypeCode']
        self.start_date = data['fromDateStr']
        self.end_date = data['toDateStr']
        
        if (self.type == 'C5'):
            self.contributions = self._fetch_contributions_schedule()
            self.expenditures = self._fetch_expenditures_schedule()
            pass
        else:
            print('Warning - unhandled report type', self.type, self.id)
            pass
    
    def _fetch_report_summary(self):
        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/retrieveReport'
        post_payload = {
            'candidateId': candidateId,
            'reportId': reportId,
            'searchPage': 'public'
        }
        session = requests.Session()
        p = session.post(post_url, post_payload)
        return p

        # TODO: continue here

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
        return pd.read_csv(StringIO(text), sep='|', error_bad_lines=False, warn_bad_lines=True)
        