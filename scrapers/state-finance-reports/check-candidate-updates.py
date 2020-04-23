#!/usr/bin/env python3

"""Check Montana COPP records for new statewide candidates

run as: python3 scrapers/state-finance-reports/check-candidate-updates.py
"""

import pandas as pd # only for logging

from functions import open_json
from functions import get_candidate_list_cleaned


reference_path = './scrapers/state-finance-reports/data/candidates.json' # rel to project root

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

def check_candidates_for_updates(candidates, archive_path):
    '''
    Returns human-readable list of candidates added since last full data scrape.
    '''
    prev_candidates = open_json(archive_path)
    
    prev_ids = [c['candidateId'] for c in prev_candidates]
    cur_ids = [c['candidateId'] for c in candidates]
    
    added_candidates = [c for c in candidates if c['candidateId'] not in prev_ids]
    dropped_candidates = [c for c in prev_candidates if c['candidateId'] not in cur_ids]
    
    return {
        'added': ['"' + c['candidateName'] + '"' for c in added_candidates],
        'dropped': ['"' + c['candidateName'] + '"' for c in dropped_candidates],
    }

def main():
    candidates = get_candidate_list()
    
    changes = check_candidates_for_updates(candidates, reference_path)
    
    print('Num. candidates:', len(candidates))
    print('Added:\n', pd.DataFrame(changes['added']))
    print('Dropped:\n', pd.DataFrame(changes['dropped']))
    
#     print('\n---')
#     print('Candidates')
#     for candidate in sorted(candidates, key=lambda i: i['officeTitle']) :
#         print(candidate['partyDescr'], '|', candidate['candidateName'], '-', candidate['officeTitle'])

if __name__ == '__main__':
    main()