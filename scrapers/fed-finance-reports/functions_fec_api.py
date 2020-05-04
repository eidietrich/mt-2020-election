# Calls for fetching committee-specific data via FEC public page API
# Equivalent to downloading records view for each candidate through website
# Seems to be more current data than FEC bulk downloads?

import pandas as pd
import requests
import json
import io
import time
from datetime import date

from secrets import API_KEY # FEC API key: See https://api.open.fec.gov/developers/

def build_url_call(committee_id, processed=True):
    if (processed):
        base_url = 'https://api.open.fec.gov/v1/download/schedules/schedule_a/?'
    else:
        base_url = 'https://api.open.fec.gov/v1/download/schedules/schedule_a/efile/?'
    configs = {
        'api_key': API_KEY,
#         'api_key': 'SnX6CUbBUlOl83CgbtX2M6GqqcpcQELTgHijsOYF',
        'committee_id': committee_id,
        'data_type': ('processed' if processed else 'efiling'),
        'sort_hide_null': 'false',
        'sort_nulls_last': 'false',
        'sort':'-contribution_receipt_date',
    }
    return base_url + '&'.join([f'{key}={configs[key]}' for key in configs.keys()])

def fetch_download_url(call):
    queued = True
    attempts = 0
    response = ''
    while (queued and attempts < 10):
        response = requests.post(call)
        print('Request response:', response.json()['status'])
        attempts += 1
        if (response.json()['status'] == 'complete'):
            queued = False
        elif (response.json()['status'] == 'queued'):
            time.sleep(5) # idle 10 seconds
    
    if (attempts == 10):
        print('Failed after 10 attempts')
        return None
    return response.json()['url']

def get_download(url):
    response = requests.get(url)
#     print(f'Fetched {url}')
    return pd.read_csv(io.StringIO(response.text))

def fetch_committee_receipts(committee_id, processed=True):
    call = build_url_call(committee_id, processed)
    url = fetch_download_url(call)
    df = get_download(url)
    if (len(df) > 0):
        df['filing_type'] = 'processed'
        df['scrape_date'] = date.today().strftime('%Y-%m-%d')
        print(f'Fetched {df.iloc[0]["committee_name"]} via processed filings:', len(df))
        return df
    else:
        # If no rows in processed data, fall back to raw FEC filings
        print('No processed filings, falling back to raw')
        call = build_url_call(committee_id, processed=False)
        url = fetch_download_url(call)
        df = get_download(url)
        if (len(df) > 0):
            df['filing_type'] = 'raw'
            print(f'Fetched {df.iloc[0]["committee_name"]} via raw filings:', len(df))
            return df
        else:
            print(f'No rows returned: {committee_id}')
            return pd.DataFrame()

def fetch_all_receipts(committee_ids):
    df = pd.DataFrame()
    for committee_id in committee_ids:
        dfi = fetch_committee_receipts(committee_id)
        df = df.append(dfi)
        if (len(dfi) == 0): print(f'No records found for {committee_id}')
    return df