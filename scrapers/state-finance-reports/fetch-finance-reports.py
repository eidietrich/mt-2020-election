#!/usr/bin/env python3

"""Check finance records for statewide from COPP

run as: python3 scrapers/state-finance-reports/fetch-finance-reports.py
"""

from functions import write_json
from functions import get_candidate_list_cleaned
from functions import get_finance_reports
from functions import aggregate_all_contributions
from functions import aggregate_all_expenditures

base_path = 'scrapers/state-finance-reports/data/'

def get_candidate_list():
    year = '2020'
    candidate_type_code = 'SW' # statewide
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
    
    all_candidates = get_candidate_list_cleaned(search_data)
    # include only active candidates
    active_statuses = ['Active','Reopened','Amended']
    candidates = [c for c in all_candidates if c['candidateStatusDescr'] in active_statuses]
    return candidates

def main():
    print('Fetching candidate list')
    candidates = get_candidate_list()
    print('Num. candidates:', len(candidates))
    
    print('Fetching finance reports')
    reports = get_finance_reports(candidates)
    print('Num. reports:', len(reports))
    
    print('Fetching contributions')
    raw_contributions = aggregate_all_contributions(candidates) # has internal logging
    
    print('Fetching expenditures')
    raw_expenditures = aggregate_all_expenditures(candidates) # has internal logging
    
    write_json(candidates, base_path + 'candidates.json')
    write_json(reports, base_path + 'reports.json')
    raw_contributions.to_json(base_path + 'raw-contributions.json', orient='records')
    raw_expenditures.to_json(base_path + 'raw-expenditures.json', orient='records')
    print('Files written to', base_path)

if __name__ == '__main__':
    main()