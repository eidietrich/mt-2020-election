# Assumes up-to-date committee names in data/candidates.json
# Updated via fetch-finance-totals.py

import pandas as pd

from functions_fec_api import fetch_all_receipts



BASE_PATH = './scrapers/fed-finance-reports/data/'
CANDIDATE_PATH = BASE_PATH + 'candidates.json' # rel to project root

candidate_committee_ids = list(pd.read_json(CANDIDATE_PATH)['CAND_PCC'])
print(candidate_committee_ids)
# receipts = fetch_all_receipts(candidate_committee_ids)


print('# Receipts', len(receipts))

receipts.to_csv(BASE_PATH + 'itemized-receipts-raw.csv', index=False)
print('Written to', BASE_PATH + 'itemized-receipts-raw.csv')

receipts.to_json(BASE_PATH + 'itemized-receipts-raw.json', orient='records')
print('Written to', BASE_PATH + 'itemized-receipts-raw.json')