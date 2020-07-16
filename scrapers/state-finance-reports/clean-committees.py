#!/usr/bin/env python3

import pandas as pd
import json
import os
import glob
from datetime import datetime

BASE_PATH = 'scrapers/state-finance-reports'
IN_PATH = os.path.join(BASE_PATH, 'raw-committees')

def open_json(path):
    with open(path) as f:
        return json.load(f)
    
def parse_date(raw):
    if raw == 0: return ''
    return datetime.fromtimestamp(raw / 1000).strftime('%m/%d/%y')

def parse_summary(path):
    d = open_json(path)
    data = d['data']
    summary = d['summary']
    finances = d['finances']
    
    positions = [i['position'] +': ' + i['interest'] for i in summary.get('issues',[])]
    return {
        'committee': d['committeeName'],
        'cers_id': data['committeeId'],
        'reports': d['periods'],
        'type': data.get('committeeTypeDescr', ''),
        'amended_date': parse_date(data.get('amendedDate',0)),
        'last_report': finances.get('last_report_date','NA'),
        'city': data.get('entityCity', ''),
        'state': data.get('entityState'),
        'officer_1': summary.get('officers', False) and summary['officers'][0]['name'],
        'officer_2': summary.get('officers', False) and summary['officers'][1]['name'],
        'positions': ', '.join(positions),
        '2020_expenditures': finances['expenditures_19_20'],
        'num_2020_expenditures': finances['num_expenditures_19_20'],
        
        '2020_contributions': finances['contributions_19_20'],
        'num_2020_contributions': finances['num_contributions_19_20'],
        'cash_on_hand': finances['cash_on_hand'],
    }

summary_paths = glob.glob(os.path.join(IN_PATH, '*/*-summary.json'))
summaries = []
for file in summary_paths:
    summary = parse_summary(file)
    summaries.append(summary)
summaries = pd.DataFrame(summaries)

summaries = []
for file in summary_paths:
    summary = parse_summary(file)
    summaries.append(summary)
summaries = pd.DataFrame(summaries)
print(f'Committees: {len(summaries)}')

contribution_paths = glob.glob(os.path.join(IN_PATH, '*/*-contributions-itemized.json'))
contributions = pd.DataFrame()
for file in contribution_paths:
    dfi = pd.read_json(file, orient='records')
    contributions = contributions.append(dfi)
print(f'Contributions: {len(contributions)}')

expenditure_paths = glob.glob(os.path.join(IN_PATH, '*/*-expenditures-itemized.json'))
expenditures = pd.DataFrame()
for file in expenditure_paths:
    dfi = pd.read_json(file, orient='records')
    expenditures = expenditures.append(dfi)
print(f'Expenditures: {len(expenditures)}')

summaries.to_csv(os.path.join(BASE_PATH, 'data/state-committee-summaries.csv'), index=False)
contributions.to_csv(os.path.join(BASE_PATH, 'data/state-committee-contributions.csv'), index=False)
expenditures.to_csv(os.path.join(BASE_PATH, 'data/state-committee-expenditures.csv'), index=False)