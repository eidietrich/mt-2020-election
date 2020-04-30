#!/usr/bin/env python3

"""Check finance records from CERS for statewide candidates

run as: python3 scrapers/state-finance-reports/fetch-statewide.py
"""
import json

OUT_PATH = 'scrapers/state-finance-reports/raw/candidates.json'

from cers_interface import Interface

cers = Interface()

print('# Fetching list of statewide candidates')
# candidates = cers.list_statewide_2020_candidates()
candidates = cers.list_statewide_2020_candidates_with_reports()
# print(json.dumps(candidates, indent=4))

with open(OUT_PATH, 'w') as f:
    json.dump(candidates, f, indent=4)
print('Written to', OUT_PATH)