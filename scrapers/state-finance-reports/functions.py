import requests
import pandas as pd
from io import StringIO
# Ref: https://blog.hartleybrody.com/web-scraping-cheat-sheet/

import json
def write_json(obj, path):
    with open(path, 'w') as f:
        json.dump(obj, f)

def open_json(path):
    with open(path) as f:
        return json.load(f)

def get_candidate_list(search_data):
    """
    Gets candidates for 2020 statewide races races, returns as json.
    
    State office and electionYear paramaters currently hard coded.
    """
    session = requests.Session()
    candidate_search_url = 'https://cers-ext.mt.gov/CampaignTracker/public/searchResults/searchCandidates'
    max_candidates = 1000
    candidate_list_url = f"""
    https://cers-ext.mt.gov/CampaignTracker/public/searchResults/listCandidateResults?sEcho=1&iColumns=9&sColumns=&iDisplayStart=0&iDisplayLength={max_candidates}&mDataProp_0=checked&mDataProp_1=candidateName&mDataProp_2=electionYear&mDataProp_3=candidateStatusDescr&mDataProp_4=c3FiledInd&mDataProp_5=candidateAddress&mDataProp_6=candidateTypeDescr&mDataProp_7=officeTitle&mDataProp_8=resCountyDescr&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=true&sSearch_6=&bRegex_6=false&bSearchable_6=true&sSearch_7=&bRegex_7=false&bSearchable_7=true&sSearch_8=&bRegex_8=false&bSearchable_8=true&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=false&bSortable_5=false&bSortable_6=true&bSortable_7=true&bSortable_8=true&_=1586980078555
    """
    
    session.post(candidate_search_url, search_data)
    r = session.get(candidate_list_url)
    return r.json()['aaData']

def get_candidate_list_cleaned(search_data):
    full = get_candidate_list(search_data)
    cleaned = list(map(lambda d: {
        'candidateId': d['candidateId'],
        'candidateName': d['candidateName'],
        'candidateLastName': d['personDTO']['lastName'],
        'partyDescr': d['partyDescr'],
        'electionYear': d['electionYear'],
        'resCountyDescr': d['resCountyDescr'],
        'officeTitle': d['officeTitle'],
        'candidateStatusDescr': d['candidateStatusDescr'],
        # More available here - home address, phone, etc.
    }, full))
    return cleaned

def get_candidate_finance_reports(candidateId):
    """
    Fetches list of candidate finance reports, returns as json
    """
    
    post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/publicReportList/retrieveCampaignReports'
    list_max=1000
    get_url = f"""
    https://cers-ext.mt.gov/CampaignTracker/public/publicReportList/listFinanceReports?sEcho=1&iColumns=6&sColumns=&iDisplayStart=0&iDisplayLength={list_max}&mDataProp_0=checked&mDataProp_1=fromDateStr&mDataProp_2=toDateStr&mDataProp_3=formTypeDescr&mDataProp_4=formTypeCode&mDataProp_5=statusDescr&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=true&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=true&_=1549557879524
    """
    post_payload = {
        'candidateId': candidateId,
        'searchType': '',
        'searchPage': 'public',
    }
    
    session = requests.Session()
    session.post(post_url, post_payload)
    r = session.get(get_url)
    return r.json()['aaData']

def get_candidate_finance_reports_cleaned(candidateId):
    full = get_candidate_finance_reports(candidateId)
    cleaned = list(map(lambda d: {
        'reportId': d['reportId'],
        'fromDateStr': d['fromDateStr'],
        'toDateStr': d['toDateStr'],
        'formTypeCode': d['formTypeCode'],
        'formTypeDescr': d['formTypeDescr'],
        'candidateId': d['candidateDTO']['candidateId'],
        'candidateName': d['candidateDTO']['candidateName'],
        'officeTitle': d['candidateDTO']['officeTitle'],
        'electionYear': d['candidateDTO']['electionYear'],
    }, full))
    return cleaned

def get_finance_reports(candidates):
    reports = []
    for candidate in candidates:
        candidate_reports =  get_candidate_finance_reports_cleaned(candidate['candidateId'])
        reports += candidate_reports
    return reports

def fetch_all_contributions_to_candidate(candidateId):
    """
    Fetches and aggregates contributions for a single candidate
    """
    reports = get_candidate_finance_reports_cleaned(candidateId)
    if len(reports) == 0:
        print('Found no reports')
        return pd.DataFrame()
    candidateName = reports[0]['candidateName']
    print('Found', len(reports), 'reports for', candidateName)
    df = pd.DataFrame()
    for report in reports:
#         print('Fetching report', report['reportId'], 'for', report['candidateName'])
        dfi = fetch_single_c5(report['reportId'], report['candidateName'], 'A')
        dfi.insert(0, 'Candidate', report['candidateName'])
        dfi.insert(1, 'Reporting Period', report['fromDateStr'] + ' to ' + report['toDateStr'])
        df = df.append(dfi)
#         print('And done. Report rows:', len(dfi), 'Total rows:', len(df))
    print('Fetched', len(df), 'rows for', reports[0]['candidateName'])
    return df

def fetch_all_expenditures_by_candidate(candidateId):
    """
    Fetches and aggregates expenditures by a single candidate
    """
    reports = get_candidate_finance_reports_cleaned(candidateId)
    if len(reports) == 0:
        print('Found no reports')
        return pd.DataFrame()
    candidateName = reports[0]['candidateName']
    print('Found', len(reports), 'reports for', candidateName)
    df = pd.DataFrame()
    for report in reports:
#         print('Fetching report', report['reportId'], 'for', report['candidateName'])
        dfi = fetch_single_c5(report['reportId'], report['candidateName'], 'B')
        dfi.insert(0, 'Candidate', report['candidateName'])
        dfi.insert(1, 'Reporting Period', report['fromDateStr'] + ' to ' + report['toDateStr'])
        df = df.append(dfi)
#         print('And done. Report rows:', len(dfi), 'Total rows:', len(df))
    print('Fetched', len(df), 'rows for', reports[0]['candidateName'])
    return df

def fetch_single_c5(reportId, name, schedule):
    """
    Fetches contributions from single report, parses as dataframe
    """

    post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/prepareDownloadFileFromSearch'
    get_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/downloadFile'
    post_payload = {
        'reportId': reportId, # This is from checkbox on candidate report page
        'scheduleCode': schedule, # A is contributions, # B is expenditures
#         'candidateId': candidateId,
        'fname': name,
    }
    session = requests.Session()
    p = session.post(post_url, post_payload)
    if 'fileName' in p.json():
        r = session.get(get_url, params=p.json())
#         print(p.json())
#         print('c5 result:\n', r.text)
        if r.text == '':
            print('Empty file. Report ID:', reportId)
            return pd.DataFrame()
        dfi = pd.read_csv(StringIO(r.text), sep='|', error_bad_lines=False, warn_bad_lines=True)
        return dfi
    else:
        print('No file. Report ID:', reportId)
        return pd.DataFrame()
    
def aggregate_all_contributions(candidates):
    """
    Collects spending data for all candidates in argument list and returns dataframe
    (Takes awhile to run).
    """
    
    df = pd.DataFrame()
    for index, candidate in enumerate(candidates):
        print(index, 'Looking at', candidate['candidateName'], 'Id:', candidate['candidateId'])
        dfi = fetch_all_contributions_to_candidate(candidate['candidateId'])
        df = df.append(dfi)
        print('Found', len(dfi), 'contributions for', candidate['candidateName'], 'Cumulative:', len(df), '\n')
    print('All done now. Total of', len(df), 'contributions found')
    return df

def aggregate_all_expenditures(candidates):
    """
    Collects spending data all candidates in argument list and returns dataframe
    (Takes awhile to run).
    """
    
    df = pd.DataFrame()
    for index, candidate in enumerate(candidates):
        print(index, 'Looking at', candidate['candidateName'], 'Id:', candidate['candidateId'])
        dfi = fetch_all_expenditures_by_candidate(candidate['candidateId'])
        df = df.append(dfi)
        print('Found', len(dfi), 'expenditures for', candidate['candidateName'], 'Cumulative:', len(df), '\n')
    print('All done now. Total of', len(df), 'expenditures found')
    return df