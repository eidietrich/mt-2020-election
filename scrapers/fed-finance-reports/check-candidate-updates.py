#!/usr/bin/env python3

"""Check FEC records for new federal candidates

run as: python3 scrapers/fed-finance-reports/check-candidate-updates.py
"""
import requests
import pandas as pd
import json

from functions import open_json
from functions import get_mt_federal_candidates

REFERENCE_PATH = './scrapers/fed-finance-reports/data/candidates.json' # rel to project root

API_KEY = 'qBKWfB76QbfggIpt6DaK2ZApCBRHJeMyTkOeNtYe'
BASE_URL = 'https://api.open.fec.gov'
VERSION = '/v1'

def check_candidates_for_updates(candidates, reference_path):
    '''
    Returns human-readable list of candidates added since last full data scrape. (Updated w/ fetch script)
    '''
    prev_candidates = pd.read_json(reference_path)
    
    prev_ids = list(prev_candidates['CAND_NAME'].unique())
    cur_ids = list(candidates['CAND_NAME'].unique())
    
    added_candidates = candidates[~candidates['CAND_NAME'].isin(prev_ids)]
    dropped_candidates = prev_candidates[~prev_candidates['CAND_NAME'].isin(prev_ids)]
    
    return {
        'added': list(added_candidates['CAND_NAME']),
        'dropped': list(dropped_candidates['CAND_NAME']),
    }



def main():
    candidates = get_mt_federal_candidates()
    
    changes = check_candidates_for_updates(candidates, REFERENCE_PATH)
    
    print('Num. candidates:', len(candidates))
    print('Changes:', json.dumps(changes, indent=4))

if __name__ == '__main__':
    main()