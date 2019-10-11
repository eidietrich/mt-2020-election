import pandas as pd
import json

base_path = 'scrapers/state-finance-reports/'

contributions = pd.read_json(base_path + 'data/raw-contributions.json', orient='records')
expenditures = pd.read_json(base_path + 'data/raw-expenditures.json', orient='records')

# Cleaning
contributions['Candidate'] = contributions['Candidate'].str.strip()
expenditures['Candidate'] = expenditures['Candidate'].str.strip()

output = {
    "contributions": contributions.to_json(orient='records'),
    "expenditures": expenditures.to_json(orient='records')
}

with open(base_path + 'data/state-finance-cleaned.json', 'w') as f:
    f.write(json.dumps(output))