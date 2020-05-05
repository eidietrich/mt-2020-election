import pandas as pd
import os

BASE_PATH = './scrapers/fed-finance-reports/data/'

raw_path = os.path.join(BASE_PATH, 'itemized-receipts-raw.json')
raw = pd.read_json(raw_path, orient='records')

'''
Cleaning to remove duplicates etc from raw itemized data as parsed by FEC API

- Filter to 2020 period
- Filter out items with memo code "X", indicating they shouldn't be included in itemized total

See: https://www.fec.gov/campaign-finance-data/contributions-individuals-file-description/

If this works as intended, total campaign receipts should total the sum of items for each candidate plus unitemized individual contributions not counted here. (It looks like there are still small discrepancies in the data, but I'm calling it good enough)
'''
print('### raw\n', raw['committee_name'].value_counts(dropna=False))
cleaned = raw[
    # limits to 2019-20 period (some U.S. Senate candidates have been fundraising longer)
    # two_transaction_period is non-null in processed data
    # pgo field is non-null in raw data
    # (raw['two_year_transaction_period'] == 2020) | (raw['pgo'].isin(['P2020', 'G2020'])) 
    raw['pgo'].isin(['P2020', 'G2020'])
    & (raw['memo_code'] != 'X') # Removes duplicate items from total
]
print('### cleaned\n', cleaned['committee_name'].value_counts(dropna=False))


print('## Cleaning/de-duplicating federal itemized data')
print('Num of raw rows:', len(raw))
print('Num. of cleaned rows:', len(cleaned))

cleaned.to_csv(BASE_PATH + 'itemized-receipts.csv', index=False)
print('Written to', BASE_PATH + 'itemized-receipts.csv')

cleaned.to_json(BASE_PATH + 'itemized-receipts.json', orient='records')
print('Written to', BASE_PATH + 'itemized-receipts.json')