#!/usr/bin/env python3

"""Check Montana COPP records for new C-5 reports

python3 scrapers/state-finance-reports/check-report-updates.py

"""

import pandas as pd # only for logging

from functions import open_json
from functions import get_candidate_list_cleaned
from functions import get_finance_reports

reference_path = './scrapers/state-finance-reports/data/reports.json' # rel to project root

# IMPORTANT: Make sure this stays synced with main fetch script
# OR TODO: Break this off into a config file
# TODO - should this be refactored out of here?
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

def check_reports_for_updates(reports, archive_path):
    '''
    Returns human-readable list of reports added since last full data scrape.
    '''
    prev_reports = open_json(archive_path)
    
    prev_ids = [r['reportId'] for r in prev_reports]
    cur_ids = [r['reportId'] for r in reports]
    
    added_reports = [r for r in reports if r['reportId'] not in prev_ids]
    dropped_reports = [r for r in prev_reports if r['reportId'] not in cur_ids]
    
    use_keys = ['formTypeCode','candidateName','toDateStr']
    return {
        'added': [{ key: report[key] for key in use_keys } for report in added_reports],
        'dropped': [{ key: report[key] for key in use_keys } for report in dropped_reports],
    }

def main():
    print('Fetching candidate list')
    candidates = get_candidate_list()
    print('Num. candidates:', len(candidates))

    print('Fetching finance reports')
    reports = get_finance_reports(candidates)
    print('Num. reports:', len(reports))
    
    changes = check_reports_for_updates(reports, reference_path)
    
    print('Added:\n', pd.DataFrame(changes['added']))
    print('Dropped:\n', pd.DataFrame(changes['dropped']))

if __name__ == '__main__':
    main()