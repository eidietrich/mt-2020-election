# Assumes up-to-date committee names in data/candidates.json
# Updated via fetch-finance-totals.py

import os
import pandas as pd

from functions_fec_api import fetch_all_receipts

BASE_PATH = './scrapers/fed-finance-reports/data/'
CANDIDATE_PATH = os.path.join(BASE_PATH,'candidates.json') # rel to project root
OUT_PATH = os.path.join(BASE_PATH, 'itemized-receipts-raw.json')

candidates = pd.read_json(CANDIDATE_PATH)
candidate_committee_ids = list(candidates['CAND_PCC'])
receipts = fetch_all_receipts(candidate_committee_ids)

print('# Receipts:', len(receipts))

receipts.to_json(OUT_PATH, orient='records')
print('Written to', OUT_PATH)