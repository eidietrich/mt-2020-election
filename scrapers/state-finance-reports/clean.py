import pandas as pd
import json
import os
import glob

BASE_PATH = 'scrapers/state-finance-reports'
IN_PATH = os.path.join(BASE_PATH, 'raw')

def open_json(path):
    with open(path) as f:
        return json.load(f)

summary_paths = glob.glob(os.path.join(IN_PATH, '*/*-summary.json'))
summaries = []
for file in summary_paths:
    summary = open_json(file)
    summary['candidateName'] = summary['candidateName'].strip()
    summaries.append(dict(summary))

contribution_paths = glob.glob(os.path.join(IN_PATH, '*/*-contributions-itemized.json'))
contributions = pd.DataFrame()
for file in contribution_paths:
    dfi = pd.read_json(file, orient='records')
    contributions = contributions.append(dfi)

contributions['Candidate'] = contributions['Candidate'].str.strip()
contribution_type = {
    1: 'Personal contributions',
    2: 'Unitemized contributions',
    3: 'Loans',
    4: 'Fundraisers & misc',
    5: 'PAC contributions',
    6: 'Political party contributions',
    7: 'Incidental committee contributions',
    8: 'Other political committee contributions',
    9: 'Individual contributions',
}
contributions['type'] = contributions['Contribution Type'].replace(contribution_type)

expenditure_paths = glob.glob(os.path.join(IN_PATH, '*/*-expenditures-itemized.json'))
expenditures = pd.DataFrame()
for file in expenditure_paths:
    dfi = pd.read_json(file, orient='records')
    expenditures = expenditures.append(dfi)

expenditures['Candidate'] = expenditures['Candidate'].str.strip()

OUT_PATH = os.path.join(BASE_PATH, 'data/state-finance-cleaned.json')

contributions.to_csv(os.path.join(BASE_PATH,'data/state-candidate-contributions.csv'), index=False)
expenditures.to_csv(os.path.join(BASE_PATH,'data/state-candidate-expenditures.csv'), index=False)

output = {
    'summaries': summaries,
    'contributions': contributions.to_json(orient='records'),
    'expenditures': expenditures.to_json(orient='records')
}
with open(OUT_PATH, 'w') as f:
    f.write(json.dumps(output))
    print(f'Cleaned data written to {OUT_PATH}')
