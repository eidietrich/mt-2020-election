#!/usr/bin/env python3

"""Get single report by ID

Requires info from raw/candidates.json

run as: python3 scrapers/state-finance-reports/fetch-report.py
"""
import json

from cers_models import Report

def open_json(path):
    with open(path) as f:
        return json.load(f)

# report_id = 47485 # Arntzen Q2 2020
# report_id = 46959 # Cooney Q1 2020, which is sticking --> Manually cached
# report_id = 46348 # Cooney 10/01/2019-12/31/2019 - Also sticking
# report_id = 45786 # Cooney 7/1 to 9/30 2019 -
report_id = 47481 # Downing
candidates = open_json('scrapers/state-finance-reports/raw/candidates.json')
reports = []
for candidate in candidates:
    reports += candidate['reports']

report = [r for r in reports if r['reportId'] == report_id][0]
slug = report['candidateName'].strip().replace(' ','-').replace(',','')
r = Report(report, cachePath=f'scrapers/state-finance-reports/raw/{slug}', checkCache=True, writeCache=True, fetchFullReports=True)

# print(json.dumps(r.summary, indent=4))