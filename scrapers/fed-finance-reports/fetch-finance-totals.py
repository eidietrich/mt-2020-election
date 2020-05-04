#!/usr/bin/env python3

"""Check summary finance records for federal candidates from FEC

run as: python3 scrapers/fed-finance-reports/fetch-finance-totals.py
"""

import os

from functions import write_json
from functions import download_large_file 
from functions import get_mt_federal_candidates
from functions import get_campaign_summaries

BASE_PATH = 'scrapers/fed-finance-reports/data/'
CANDIDATE_LIST_PATH = os.path.join(BASE_PATH,'candidates.json')
SUMMARY_PATH = os.path.join(BASE_PATH,'candidate-summaries.json')

print('Fetching federal candidate list')
mt_2020_candidates = get_mt_federal_candidates()
# print('TEMP - loading fetched federal candidate')
# import pandas as pd
# mt_2020_candidates = pd.read_json(CANDIDATE_LIST_PATH, orient='records')
print('Num. candidates:', len(mt_2020_candidates))

mt_2020_candidates.to_json(CANDIDATE_LIST_PATH, orient='records')
print('Candidate list written to', CANDIDATE_LIST_PATH)

print('Fetching campaign summaries')
mt_2020_summaries = get_campaign_summaries(mt_2020_candidates, BASE_PATH)
print('summaries', mt_2020_summaries[['CAND_ID','CAND_NAME','CAND_PTY_AFFILIATION']])
mt_2020_summaries.to_json(SUMMARY_PATH, orient='records')
print('Campaign summaries written to', SUMMARY_PATH)


