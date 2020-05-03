#!/usr/bin/env python3

"""Get finance records for single candidate

Requires info from raw/candidates.json

run as: python3 scrapers/state-finance-reports/fetch-candidate.py
"""
import json

from cers_models import Candidate

def open_json(path):
    with open(path) as f:
        return json.load(f)

# candidate_id = 16074 # "Arntzen, Elsie "
# candidate_id = 16070 # cooney
candidate_id = 16062 # Downing
candidates = open_json('scrapers/state-finance-reports/raw/candidates.json')
candidate = [c for c in candidates if c['candidateId'] == candidate_id][0]
# data = {
#         "candidateId": 16074,
#         "candidateName": "Arntzen, Elsie ",
#         "candidateLastName": "Arntzen",
#         "partyDescr": "Republican",
#         "electionYear": "2020",
#         "resCountyDescr": "Yellowstone",
#         "officeTitle": "Superintendent of Public Instruction",
#         "candidateStatusDescr": "Amended"
# }
c = Candidate(candidate, checkCache=False) # Runs scrape