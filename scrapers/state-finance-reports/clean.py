import pandas as pd
import json

base_path = 'scrapers/state-finance-reports/'

contributions = pd.read_json(base_path + 'data/raw-contributions.json', orient='records')
expenditures = pd.read_json(base_path + 'data/raw-expenditures.json', orient='records')

# Cleaning
contributions['Candidate'] = contributions['Candidate'].str.strip()
expenditures['Candidate'] = expenditures['Candidate'].str.strip()
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
output = {
    'contributions': contributions.to_json(orient='records'),
    'expenditures': expenditures.to_json(orient='records')
}

with open(base_path + 'data/state-finance-cleaned.json', 'w') as f:
    print('Cleaned finance data written')
    f.write(json.dumps(output))

contributions.to_csv('data/state-candidate-contributions.csv', index=False)
expenditures.to_csv('data/state-candidate-expenditures.csv', index=False)