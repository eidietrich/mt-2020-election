#!/usr/bin/env python3

"""Pull summary finance records for statewide candidates from COPP

run as: python3 scrapers/state-finance-reports/fetch-finance-summaries.py
"""
import pandas as pd
import requests
from bs4 import BeautifulSoup
import re

from functions import get_candidate_finance_reports_cleaned
from functions import get_candidate_list_cleaned

OUT_PATH = 'data/state-candidate-summaries.csv'

def main():
    print('Starting state finance summaries fetch')
    cs = CandidateSummaries('2020', 'SW') # SW --> statewide candidates
    print('Candidate list collected')
    cs.collect_candidates() # Slow step
    cs.summary.to_csv(OUT_PATH, index=False)
    cs.summary.to_csv('scrapers/state-finance-reports/' + OUT_PATH, index=False)
    print('Written to', OUT_PATH)
    
    
class CandidateSummaries:
    def __init__(self, year, candidate_type_code):
        
        self.candidates = self._get_candidate_list(year, candidate_type_code)
        self.summary = []
    
    def _get_candidate_list(self, year, candidate_type_code):
        active_statuses = ['Active', 'Amended', 'Reopened'] # Redundant w/ other code
        search_data = {
            'lastName': '',
            'firstName': '',
            'middleInitial': '',
            'electionYear': year,
            'candidateTypeCode': candidate_type_code,
            'officeCode': '',
            'countyCode': '',
            'partyCode': '',
        }
        return [c for c in get_candidate_list_cleaned(search_data) if c['candidateStatusDescr'] in active_statuses]
        
    def collect_candidates(self):
        print('Collecting candidate summaries')
        candidates = [ Summary(c) for c in self.candidates ]
        df = pd.DataFrame()
        for c in candidates:
            dfi = pd.DataFrame([c.get_summary()])
            df = df.append(dfi)
        self.summary = df
        print('Done')
        
    def export(self):
        # TODO
        pass
        

class Summary:
    '''
    Note: This runs slow data scrape when created. Best way to do this?
    '''
    def __init__(self, info):
        self.id = info['candidateId']
        self.name = info['candidateName']
        self.office = info['officeTitle']
        self.party = info['partyDescr'][0]
        self.summary = self._collect_summary(info['candidateId'])
            
    def get_summary(self):
         return {
            'candidateName': self.name,
            'candidateId': self.id,
            'officeTitle': self.office,
            'partyDescr': self.party,
            **self.summary
        }
        
    def _collect_summary(self, candidateId):
        raw = self._fetch_candidate_summaries(candidateId)
        clean = self._clean_summary(raw)
        return clean
        
    def _fetch_candidate_summaries(self, candidateId):
        reports = get_candidate_finance_reports_cleaned(candidateId)
        if len(reports) == 0:
            print('Found no reports', candidateName, candidateId)
            return []
        candidateName = reports[0]['candidateName']
        print('Found', len(reports), 'reports for', candidateName, candidateId)
        report_summaries = []
        for report in reports:
            summary = self._get_report_summary(report['reportId'], candidateId)
            report_summaries.append(summary)
        return report_summaries
    
    def _clean_summary(self, raw_summaries):
        # produce aggregate summary across different reporting periods
        # run once per candidate
        total_receipts = sum(summary['Receipts']['total'] for summary in raw_summaries)
        total_expenditures = sum(summary['Expenditures']['total'] for summary in raw_summaries)
        balance = total_receipts - total_expenditures
        # TODO: Figure out how to check this against reported balance lines

        if (balance < 0): print ('Balance less than 0', balance, self.name, self.id)

        return {
            'periods': len(raw_summaries),
            'receipts': round(total_receipts, 2),
            'expenditures': round(total_expenditures, 2),
            'balance': round(balance, 2)
        }
    
    def _get_report_summary(self, reportId, candidateId):
        html = self._fetch_summary_report(reportId, candidateId)
        soup = BeautifulSoup(html.text, 'html.parser')
        parsed = self._parse_report(soup)
        return parsed

    def _fetch_summary_report(self, reportId, candidateId):
        post_url = 'https://camptrackext.mt.gov/CampaignTracker/public/viewFinanceReport/retrieveReport'
        post_payload = {
            'candidateId': candidateId,
            'reportId': reportId,
            'searchPage': 'public'
        }
        session = requests.Session()
        p = session.post(post_url, post_payload)
        return p

    def _parse_report(self, soup):
        labels = [
            'previous report',
            'Receipts',
            'Expenditures',
            'Ending Balance',
        ]
        table = soup.find('div', id='summaryAccordionId').find('table')
        parsed = { label: self._get_row(table, label) for label in labels }
        return parsed

    def _get_row(self, table, label):
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
    

if __name__ == '__main__':
    main()