#!/usr/bin/env python3

"""Check FEC records for new federal candidates

run as: python3 scrapers/fed-finance-reports/check-candidate-updates.py
"""
import requests

from functions import open_json

REFERENCE_PATH = './scrapers/fed-finance-reports/data/candidates.json' # rel to project root

API_KEY = 'qBKWfB76QbfggIpt6DaK2ZApCBRHJeMyTkOeNtYe'
BASE_URL = 'https://api.open.fec.gov'
VERSION = '/v1'

def check_candidates_for_updates(candidates, reference_path):
    '''
    Returns human-readable list of candidates added since last full data scrape. (Updated w/ fetch script)
    '''
    prev_candidates = open_json(reference_path)
    
    prev_ids = [c['candidate_id'] for c in prev_candidates]
    cur_ids = [c['candidate_id'] for c in candidates]
    
    added_candidates = [c for c in candidates if c['candidate_id'] not in prev_ids]
    dropped_candidates = [c for c in prev_candidates if c['candidate_id'] not in cur_ids]
    
    return {
        'added': [c['name'] for c in added_candidates],
        'dropped': [c['name'] for c in dropped_candidates],
    }



def main():
    candidates = get_mt_federal_candidates_abbreviated()
    
    changes = check_candidates_for_updates(candidates, REFERENCE_PATH)
    
    print('Num. candidates:', len(candidates))
    print('Changes:', changes)

if __name__ == '__main__':
    main()