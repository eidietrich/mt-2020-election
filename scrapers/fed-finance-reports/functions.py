import requests
import pandas as pd
import os
import zipfile
from io import StringIO
# Ref: https://blog.hartleybrody.com/web-scraping-cheat-sheet/

import json
def write_json(obj, path):
    with open(path, 'w') as f:
        json.dump(obj, f)

def open_json(path):
    with open(path) as f:
        return json.load(f)
    
# from https://stackoverflow.com/questions/16694907/download-large-file-in-python-with-requests
def download_large_file(url, local_path):
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(local_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk: # filter out keep-alive new chunks
                    f.write(chunk)
    print('Downloaded to', local_path)
    if (local_path[-4:] == '.zip'):
        with zipfile.ZipFile(local_path, 'r') as f:
            f.extractall(local_path[:-4])
        print('Unzipped to ' + local_path[:-4])
        

def get_mt_federal_candidates():
    url = 'https://www.fec.gov/files/bulk-downloads/2020/cn20.zip'
    local_path = 'data/candidate-list-20.zip'
    download_large_file(url, local_path)
    names = [
        "CAND_ID", "CAND_NAME", "CAND_PTY_AFFILIATION",
        "CAND_ELECTION_YR", "CAND_OFFICE_ST", "CAND_OFFICE",
        "CAND_OFFICE_DISTRICT", "CAND_ICI", "CAND_STATUS", "CAND_PCC",
        "CAND_ST1", "CAND_ST2", "CAND_CITY", "CAND_ST", "CAND_ZIP"
    ]
    df = pd.read_csv(local_path, delimiter="|", header=None, names=names)
    mt_2020 = df[
        (df['CAND_OFFICE_ST'] == 'MT') 
        & (df['CAND_ELECTION_YR'] == 2020)
        & (df['CAND_OFFICE'].isin(['H','S'])) # House or Senate
    ]
    
    # b/c Kathleen Williams has been miscategorized as a Mississippi candidate
    kw = df[(df["CAND_ID"] == 'H8MT01232') & (df["CAND_OFFICE_ST"] != 'MT')].copy()
    kw["CAND_OFFICE_ST"] = 'MT'

    candidates = mt_2020.append(kw)
    candidates.to_json('data/mt-2020-candidates.json', orient='records')
    return candidates

# cols to include in abbreviated data
cand_cols = [
    'name','candidate_id','office_full','party','state',
    'incumbent_challenge_full', 'has_raised_funds',
    'candidate_status','last_f2_date', 'first_file_date','last_file_date'
]


def get_campaign_summaries(candidates, BASE_PATH):
    # JUST for 2019-20 period
    url = 'https://www.fec.gov/files/bulk-downloads/2020/webl20.zip'
    # Data dictionary: https://www.fec.gov/campaign-finance-data/current-campaigns-house-and-senate-file-description/
    local_path = BASE_PATH + 'candidate-committee-summaries-20.zip'
    download_large_file(url, local_path)
    names = [
        "CAND_ID", "CAND_NAME", "CAND_ICI", "PTY_CD", "CAND_PTY_AFFILIATION",
        "TTL_RECEIPTS", "TRANS_FROM_AUTH", "TTL_DISB", "TRANS_TO_AUTH", 
        "COH_BOP", "COH_COP", "CAND_CONTRIB", "CAND_LOANS", "OTHER_LOANS", 
        "CAND_LOAN_REPAY", "OTHER_LOAN_REPAY", "DEBTS_OWED_BY", 
        "TTL_INDIV_CONTRIB", "CAND_OFFICE_ST", "CAND_OFFICE_DISTRICT", 
        "SPEC_ELECTION", "PRIM_ELECTION", "RUN_ELECTION", "GEN_ELECTION", 
        "GEN_ELECTION_PRECENT", "OTHER_POL_CMTE_CONTRIB", "POL_PTY_CONTRIB", 
        "CVG_END_DT", "INDIV_REFUNDS", "CMTE_REFUNDS"
    ]
    summaries = pd.read_csv(local_path, delimiter="|", header=None, names=names)
    # df = df[df['CAND_ID'].isin(candidate_ids)]
    join_on = ['CAND_ID','CAND_NAME','CAND_PTY_AFFILIATION','CAND_OFFICE_ST']
    
    combined = candidates.merge(summaries, on=join_on, how='left')
    return combined