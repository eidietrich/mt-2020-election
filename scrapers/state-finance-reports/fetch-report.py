#!/usr/bin/env python3

"""Get single report by ID/data (for development/debugging)

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
# report_id = 49028 # Graybill C7
# candidates = open_json('scrapers/state-finance-reports/raw/candidates.json')
# reports = []
# for candidate in candidates:
#     reports += candidate['reports']

# report = [r for r in reports if r['reportId'] == report_id][0]

# Graybill C7
# report = {'reportId': 49028, 'fromDateStr': '06/02/2020', 'toDateStr': '06/02/2020', 'formTypeCode': 'C7', 'formTypeDescr': 'Notice of Pre-Election Contributions', 'candidateId': 16071, 'candidateName': 'Graybill, Raph ', 'officeTitle': 'Attorney General', 'electionYear': '2020'}

# Graybill C7E
# report = {'reportId': 48734, 'fromDateStr': '05/27/2020', 'toDateStr': '05/27/2020', 'formTypeCode': 'C7E', 'formTypeDescr': 'Notice of Pre-Election Expenditures', 'candidateId': 16071, 'candidateName': 'Graybill, Raph ', 'officeTitle': 'Attorney General', 'electionYear': '2020'}

# Arntzen C7
report = {
        "reportId": 48948,
        "fromDateStr": "05/30/2020",
        "toDateStr": "06/01/2020",
        "formTypeCode": "C7",
        "formTypeDescr": "Notice of Pre-Election Contributions",
        "candidateId": 16074,
        "candidateName": "Arntzen, Elsie ",
        "officeTitle": "Superintendent of Public Instruction",
        "electionYear": "2020",
        "statusDescr": "Filed",
        "amendedDate": "null"
    }

slug = report['candidateName'].strip().replace(' ','-').replace(',','')
r = Report(report, cachePath=f'scrapers/state-finance-reports/raw/{slug}', checkCache=True, writeCache=True, fetchFullReports=True)

# print(json.dumps(r.summary, indent=4))