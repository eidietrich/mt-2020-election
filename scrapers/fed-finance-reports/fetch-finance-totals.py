#!/usr/bin/env python3

"""Check summary finance records for federal candidates from FEC

run as: python3 scrapers/fed-finance-reports/fetch-finance-totals.py
"""

from functions import write_json
from functions import download_large_file 
from functions import get_mt_federal_candidates
from functions import get_campaign_summaries

BASE_PATH = 'scrapers/fed-finance-reports/data/'
CANDIDATE_LIST_PATH = BASE_PATH + 'candidates.json'
OUT_PATH = BASE_PATH + 'raw-summaries.json'

print('Fetching federal candidate list')
mt_2020_candidates = get_mt_federal_candidates()
print('Num. candidates:', len(mt_2020_candidates))

# write_json(mt_2020_candidates, BASE_PATH + 'candidates.json')
\
mt_2020_candidates.to_json(CANDIDATE_LIST_PATH, orient='records')
print('Candidate list written to', CANDIDATE_LIST_PATH)

mt_2020_candidate_ids = list(mt_2020_candidates['CAND_ID'])
# mt_2020_candidate_committees = list(mt_2020_candidates['CAND_PCC'])

print('Fetching campaign summaries')
mt_2020_summaries = get_campaign_summaries(mt_2020_candidate_ids, BASE_PATH)

mt_2020_summaries.to_json(OUT_PATH, orient='records')
print('Campaign summaries written to', OUT_PATH)


