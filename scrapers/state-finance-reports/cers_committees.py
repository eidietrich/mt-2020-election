"""
Models for committee handling pulled from CERS

"""
import os
import requests
import json
import re
from datetime import date
from datetime import datetime
from dateutil.parser import parse

import pandas as pd
from bs4 import BeautifulSoup

EXCLUDE_NAMES = [
    'ATM Montana (Test)',
    'MT-ATM Incidental Committee (TEST)',
    'Montana Movie Critics Club',
    'Test Committee for Total to Date',
    'Test Incidental for Corporate Contributions',
    'Corpotest',
    'Corpotest 2',
    'Montana ATM Incidental Cmte',
    'FAke committee',
] # COPP test

class CommitteeList:

    def __init__(self,
        search,
        cachePath='scrapers/state-finance-reports/raw-committees',
        checkCommitteeListCache=False, writeCommitteeListCache=True,
        ):
        self.cache_path = cachePath

        committee_list = self._fetch_committee_list(search, checkCommitteeListCache=checkCommitteeListCache)
        
        print(f'{len(committee_list)} committees fetched')

        self.committees = [Committee(c) for c in committee_list]
        self.contributions = self._get_contributions()
        self.expenditures = self._get_expenditures()

        if writeCommitteeListCache:
            if not os.path.exists(self.cache_path): os.makedirs(self.cache_path)
            self.contributions.to_csv(os.path.join(self.cache_path, 'committee-contributions.csv'), index=False)
            self.expenditures.to_csv(os.path.join(self.cache_path, 'committee-expenditures.csv'), index=False)
        
        # print(json.dumps(committee_list, indent=6))
    
    def _get_contributions(self):
        contributions = pd.DataFrame()
        for committee in self.committees:
            contributions = contributions.append(committee.contributions)
            # if committee.contributions and (len(committee.contributions) > 0):
            #     contributions = contributions.append(committee.contributions)
        return contributions

    def _get_expenditures(self):
        expenditures = pd.DataFrame()
        for committee in self.committees:
            expenditures = expenditures.append(committee.expenditures)
            # if committee.expenditures and (len(committee.expenditures) > 0):
            #     expenditures = expenditures.append(committee.expenditures)
        return expenditures

    def _fetch_committee_list(self, search, raw=False,
        checkCommitteeListCache=False,
        writeCommitteeListCache=False,
        maxCommittees=200
    ):
        file_path = os.path.join(self.cache_path, f'committees-list.json')
        if checkCommitteeListCache and os.path.isfile(file_path):
            print(f'-- Fetching committees list from cache at {file_path}')
            with open(file_path) as f:
                cache = json.load(f)
            return cache
        
        print(f'Fetching committees list via CERS scrape')
        session = requests.Session()
        committee_search_url = 'https://cers-ext.mt.gov/CampaignTracker/public/searchResults/searchCommittees'
        candidate_list_url = f"""
        https://cers-ext.mt.gov/CampaignTracker/public/searchResults/listCommitteeResults?sEcho=1&iColumns=6&sColumns=&iDisplayStart=0&iDisplayLength={maxCommittees}&mDataProp_0=checked&mDataProp_1=committeeName&mDataProp_2=electionYear&mDataProp_3=committeeStatusDescr&mDataProp_4=committeeAddress&mDataProp_5=committeeTypeDescr&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=true&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=false&bSortable_5=true&_=1593184363809
        """
    
        session.post(committee_search_url, search)
        r = session.get(candidate_list_url)
        num_results = r.json()['iTotalRecords']

        if(maxCommittees < num_results): print(f'Warning: not all of {num_results} results fetched')

        full = r.json()['aaData']
        print(f'Committees found: {num_results}')

        cleaned = list(map(lambda d: {
            'committeeId': d['committeeId'],
            'committeeName': d['committeeName'],
            'committeeAddress': d['committeeAddress'],
            'committeeTypeDescr': d['committeeTypeDescr'],
            'incorporated': d['incorporated'],
            'electionYear': d['electionYear'],
            "amendedDate": d['amendedDate'],
            'entityFullName': d['entityDTO']['entityFullName'],
            'entityCity': d['entityDTO']['entityCity'],
            'entityState': d['entityDTO']['entityState'],
        }, full))

        if writeCommitteeListCache:
            if not os.path.exists(self.cache_path): os.makedirs(self.cache_path)
            with open(file_path, 'w') as f:
                json.dump(cleaned, f, indent=4)
            print(f'Committees list written to {file_path}')

        if raw:
            return full
        return cleaned

        """
        # TODO: Figure out
        --> Aggregate officer list to spreadsheets
        --> Aggregate fundraising/spending to 

        """

class Committee:
    def __init__(self, data, cachePath='scrapers/state-finance-reports/raw-committees',
        fetchSummary=True, fetchReports=True, fetchFullReports=True,
        checkCache=True, writeCache=True
    ):
        # Init based on data from committee list
        self.id = data['committeeId']
        self.name = data['committeeName']
        self.data = data
        self.finance_reports = []
        self.contributions = pd.DataFrame()
        self.expenditures = pd.DataFrame()
        self.summary = {}

        if (self.name and (self.name not in EXCLUDE_NAMES)):
            print(f'## {self.name} ({self.id})')
            self.slug = f'{self.id}-' + self.name.strip().replace('/',' ').replace(' ','-').replace(',','')
            self.cache_path = os.path.join(cachePath, self.slug)

            self.summary = self._fetch_c2_committee_summary()

            if fetchReports:
                self.raw_reports = self._fetch_committee_reports()
                # print (json.dumps(self.raw_reports, indent=2))
            if fetchReports and fetchFullReports and len(self.raw_reports) > 0:
                print(f'Fetching {len(self.raw_reports)} finance reports for {self.name} ({self.id})')
                self.full_reports = [Report(r, cachePath=self.cache_path, checkCache=checkCache, writeCache=writeCache) for r in self.raw_reports]
                
                self.contributions = self._get_contributions()
                self.expenditures = self._get_expenditures()
                self.summary = self._get_summary()
                # if (self.summary['reports'] > 0): print(json.dumps(self.summary, indent=2))
                self._export()
            else:
                print(f'-- No finance reports found')
    
    def _fetch_c2_committee_summary(self):
        # print(f'Fetching summary for {self.name} ({self.id})')
        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewCommittee/retrieveCommittee'
        post_payload = {
            'committeeId': self.id,
            'searchType': '',
            'searchPage': 'public',
        }
        session = requests.Session()
        p = session.post(post_url, post_payload)
        text = p.text
        soup = BeautifulSoup(text, 'html.parser')

        def find_by_key(table, key):
            row = table.find(text=re.compile(key))
            if (row and row.parent and row.parent.parent):
                return row.parent.parent.find('p').text
            else:
                return ''

        treasurer_table = soup.find('div', id='treasurerAccordionId')
        treasurer = {
            'position': 'Treasurer',
            'name': find_by_key(treasurer_table, 'Treasurer Full Name'),
            'address': find_by_key(treasurer_table, 'Mailing Address'),
            'phone': find_by_key(treasurer_table, 'Home Phone'),
            'email': find_by_key(treasurer_table, 'Home or Personal Email Address'),
        }
        
        
        deputy_table = soup.find('div', id='deputyAccordionId')
        deputy = {
            'position': 'Deputy Treasurer',
            'name': find_by_key(deputy_table, 'Deputy Treasurer Full Name'),
            'address': find_by_key(deputy_table, 'Mailing Address'),
            'phone': find_by_key(deputy_table, 'Home Phone'),
            'email': find_by_key(deputy_table, 'Home or Personal Email Address'),
        }
        
        issues_table = soup.find('div', id='ballotAccordionId').find('div', {"class": "panel-body"})
        issues_rows = issues_table.find_all('tr')[1:]

        issues = []
        for row in issues_rows:
            cols = row.find_all('td')
            issues.append({
                'interest': cols[0].text,
                'position': cols[1].text,
                'status': cols[2].text,
            })

        return {
            'officers': [
                treasurer,
                deputy,
            ],
            'issues': issues
        }

    def _fetch_committee_reports(self, raw=False):
        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/publicReportList/retrieveCommitteeReports'
        list_max=1000
        get_url = f"""
        https://cers-ext.mt.gov/CampaignTracker/public/publicReportList/listFinanceReports?sEcho=1&iColumns=6&sColumns=&iDisplayStart=0&iDisplayLength={list_max}&mDataProp_0=checked&mDataProp_1=fromDateStr&mDataProp_2=toDateStr&mDataProp_3=formTypeDescr&mDataProp_4=formTypeCode&mDataProp_5=statusDescr&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=true&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=true&_=1593616099447
        """
        post_payload = {
            'committeeId': self.id,
            'searchType': '',
            'searchPage': 'public',
        }
        session = requests.Session()
        session.post(post_url, post_payload)
        r = session.get(get_url)
        full = r.json()['aaData']
        num_records = r.json()['iTotalRecords']
        if (num_records > list_max): print(f'WARNING: Only {list_max} of {num_records} committee reports collected')
        
        if raw:
            return full
        
        cleaned = list(map(lambda d: {
            'reportId': d['reportId'],
            'fromDateStr': d['fromDateStr'],
            'toDateStr': d['toDateStr'],
            'formTypeCode': d['formTypeCode'],
            'formTypeDescr': d['formTypeDescr'],
            'committeeId': d['committeeDTO']['committeeId'],
            'candidateName': d['committeeDTO']['committeeName'],
            'statusDescr': d['statusDescr'],
            "amendedDate": d['amendedDate'],
            "totalContrLessThan35": d['totalContrLessThan35'],
            "totalIndivContrLessThan35": d['totalIndivContrLessThan35'],
            "grandTotalLessThan35": d['grandTotalLessThan35'],
            "grandTotalLessThan35Primary": d['grandTotalLessThan35Primary'],
            "grandTotalLessThan35General": d['grandTotalLessThan35General'],
        }, full))
        # print(json.dumps(full, indent=2))
        return cleaned

    def _get_summary(self):
        start_date = '01-01-2019'

        contributions = self.contributions.copy()
        if (len(contributions) > 0):
            contributions['date'] = pd.to_datetime(contributions['Date Paid'])
            contributions_2020 = contributions[contributions['date'] >= start_date]
            
            amt_contributions = round(contributions['Amount'].sum(),2)
            num_contributions = len(contributions)
            amt_contributions_19_20 = round(contributions_2020['Amount'].sum(),2)
            num_contributions_19_20 = len(contributions_2020)
        else:
            amt_contributions = 0
            num_contributions = 0
            amt_contributions_19_20 = 0
            num_contributions_19_20 = 0

        expenditures = self.expenditures.copy()
        if (len(expenditures) > 0): 
            expenditures['date'] = pd.to_datetime(expenditures['Date Paid'])
            expenditures_2020 = expenditures[expenditures['date'] >= start_date]
            
            amt_expenditures = round(expenditures['Amount'].sum(),2)
            num_expenditures = len(expenditures)
            amt_expenditures_19_20 = round(expenditures_2020['Amount'].sum(),2)
            num_expenditures_19_20 = len(expenditures_2020)
        else:
            amt_expenditures = 0
            num_expenditures = 0
            amt_expenditures_19_20 = 0
            num_expenditures_19_20 = 0
        
        if len(self.full_reports) > 0:
            last_report = max(self.full_reports, key=lambda d: datetime.strptime(d.summary['end_date'], '%m/%d/%Y'))
            cash_on_hand = last_report.summary['cash_in_bank']
        else:
            cash_on_hand = 0

        return {
            'reports': len(self.full_reports),

            'contributions': amt_contributions,
            'num_contributions': num_contributions,
            'contributions_19_20': amt_contributions_19_20,
            'num_contributions_19_20': num_contributions_19_20,

            'expenditures': amt_expenditures,
            'num_expenditures': num_expenditures,
            'expenditures_19_20': amt_expenditures_19_20,
            'num_expenditures_19_20': num_expenditures_19_20,

            'cash_on_hand': cash_on_hand
        }

    def _get_contributions(self):
        """Collect contributions across multiple reports as DataFrame"""
        if len(self.full_reports) == 0:
            return pd.DataFrame()

        df = pd.DataFrame()
        for report in self.full_reports:
            dfi = pd.DataFrame(report.contributions)
            dfi.insert(0, 'Committee', self.name)
            dfi.insert(1, 'Reporting Period', f'{report.start_date} to {report.end_date}' )
            dfi.insert(2, 'Report Type', report.type)
            df = df.append(dfi)
        return df

    def _get_expenditures(self):
        """Collect expenditures across multiple reports as DataFrame"""
        if len(self.full_reports) == 0:
            return pd.DataFrame()
        
        df = pd.DataFrame()
        for report in self.full_reports:
            dfi = pd.DataFrame(report.expenditures)
            dfi.insert(0, 'Candidate', self.name)
            dfi.insert(1, 'Reporting Period', f'{report.start_date} to {report.end_date}' )
            dfi.insert(2, 'Report Type', report.type)
            df = df.append(dfi)
        return df

    def _export(self):
        # use self.cache_path
        if not os.path.exists(self.cache_path):
            os.makedirs(self.cache_path)
        summary_path = os.path.join(os.getcwd(),self.cache_path, self.slug + '-summary.json')
        contributions_path = os.path.join(os.getcwd(), self.cache_path, self.slug + '-contributions-itemized.json')
        expenditures_path = os.path.join(os.getcwd(), self.cache_path, self.slug + '-expenditures-itemized.json')
        summary = {
            'slug': self.slug,
            'committeeName': self.name,
            'scrape_date': date.today().strftime('%Y-%m-%d'),
            'periods': len(self.full_reports),
            'data': self.data,
            'summary': self.summary,
        }
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=4)
        self.contributions.to_json(contributions_path, orient='records')
        self.expenditures.to_json(expenditures_path, orient='records')
        print(self.slug, 'written to', os.path.join(os.getcwd(), self.cache_path))
    
    """
    # Data to collect from committee registration view (C2)
    - Committee status
    - Incorporation date
    - Treasurer name / addresses / contact
    - Other officer names / addresses / contact
    - Committee purpose
    """
    ####
    """
    # Data to collect from financial reports
    - List of reports
        from, to, type, status
    - For each report
        - filing date
        - status
        - treasurer name (to track changes)
        - receipts/expenditures/cash-in-bank
        - total contributions < $35
        - contributions/expenditures (can adapt from C5 reports)
    """

    """
    Agggregate:
    - Total raised
    - Total raised since Jan. 1, 2019
    - Total Spent
    - Total spent since Jan. 1, 2019
    """

class Report:
    def __init__(self, data, cachePath, checkCache=True, writeCache=True, fetchFullReports=True):
        self.id = data['reportId']
        self.data = data
        self.type = data['formTypeCode']
        self.start_date = data['fromDateStr']
        self.end_date = data['toDateStr']
        self.label = f'{self.start_date} to {self.end_date}'

        self.fetchFullReports = fetchFullReports

        self.contributions = pd.DataFrame()
        self.expenditures = pd.DataFrame() 
    
        self.file_path = os.path.join(cachePath, f'{self.type}-{self.id}.json')

        # print('REPORT:', self.data)

        if checkCache and os.path.isfile(self.file_path):
            self._get_cached_data()
            # This checks for updates and reroutes for newly amended forms
        else:
            self._get_c6_data_from_scrape()

        # Add cache
        if writeCache:
            if not os.path.exists(cachePath): os.makedirs(cachePath)
            self._export() 

    def _get_cached_data(self):
        print(f'--- From cache, loading {self.type} {self.start_date}-{self.end_date} ({self.id})')
        file_path = self.file_path
        
        with open(file_path) as f:
            cache = json.load(f)

        if (('data' in cache) and (cache['data']['amendedDate'] == self.data['amendedDate'])):
            self.summary = cache['summary']
            self.contributions = cache['contributions']
            self.expenditures = cache['expenditures']
        else:
            print(f'----- Actually, amendment found on {self.id}')
            self._get_c6_data_from_scrape()

    def _get_c6_data_from_scrape(self):
        """
        Approach: Assume it's manageable to pull everything from the 'view report' summary
        """
        print(f'Fetching C6 {self.start_date}-{self.end_date} ({self.id})')
        post_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/retrieveReport'
        post_payload = {
            'committeeId': self.data['committeeId'],
            'reportId': self.id,
            'searchPage': 'public'
        }
        session = requests.Session()
        p = session.post(post_url, post_payload)
        text = p.text
        soup = BeautifulSoup(text, 'html.parser')

        def get_table_row(table, key):
            text = table.find(text=re.compile(key)).parent.parent.find_all('td')[2].text
            return parse_dollars(text)

        def parse_dollars(raw):
            return float(raw.replace('$','').replace(',','').replace(',','').replace('(','-').replace(')',''))

        summary_table = soup.find('div', id='summaryAccordionId').find('div', {'class': 'panel-body'})
        summary = {
            'start_date': self.start_date,
            'end_date': self.end_date,
            'receipts': get_table_row(summary_table, 'Total Received'),
            'expenditures': get_table_row(summary_table, 'Expenditures'),
            'cash_in_bank': get_table_row(summary_table, 'Ending Balance')
        }
        
        detail_url = 'https://cers-ext.mt.gov/CampaignTracker/public/viewFinanceReport/financeRepDetailList'

        expenditures_raw = session.post(detail_url, {'listName': "expendOther"})
        expenditures = self._parse_expenditure_table(expenditures_raw)
        
        contributions_raw = session.post(detail_url, {'listName': "individual"})
        contributions = self._parse_contributions_table(contributions_raw)
        # print(json.dumps(contributions, indent=2))

        # Unhandled for now
        try:
            loan_raw = session.post(detail_url, {'listName': "loan"})
            if (loan_raw.json() and loan_raw.json() != []): print('## Need to handle C6 loans')
        except json.decoder.JSONDecodeError:
            # For weird bug with 4J's Casino 46201
            pass

        fund_raw = session.post(detail_url, {'listName': "fundraisers"})
        if (fund_raw.json() != []): print('## Need to handle C6 fundraisers')

        refund_raw = session.post(detail_url, {'listName': "refunds"})
        if (refund_raw.json() != []): print('## Need to handle C6 refunds')

        comm_raw = session.post(detail_url, {'listName': "committee"})
        if (comm_raw.json() != []): print('## Need to handle C6 committee contributions')

        petty_raw = session.post(detail_url, {'listName': "pettyCash"})
        if (petty_raw.json() != []): print('## Need to handle C6 petty cash')

        debt_raw = session.post(detail_url, {'listName': "debtLoan"})
        if (debt_raw.json() != []): print('## Need to handle C6 debts')

        pay_raw = session.post(detail_url, {'listName': "payment"})
        if (pay_raw.json() != []): print('## Need to handle C6 payments only')

        self.summary = summary
        self.contributions = contributions
        self.expenditures = expenditures

    def _parse_expenditure_table(self, r):
        rows = r.json()
        cleaned = []
        for row in rows:
            addressLn1, city, state, zip_code = self._parse_address(row['entityAddress'])
            date = self._parse_date(row['datePaid'])
            cleaned.append({
                'Date Paid': date,
                'Entity Name': row['entityName'],
                'First Name': '',
                'Middle Initial': '',
                'Last Name': '',
                'Addr Line1': addressLn1,
                'City': city,
                'State': state,
                'Zip': zip_code,
                'Zip4': '',
                'Expenditure Type': row['lineItemCompositeDescr'],
                'Amount': row['totalAmt'],
                'Purpose': row['purposeDescr'],
                'Election Type': row['amountTypeDescr'],
                'Expenditure Paid Communications Platform': row['expenditurePaidCommPlatform'],
                'Expenditure Paid Communications Quantity': row['expenditurePaidCommQuantity'],
                'Expenditure Paid Communications Subject Matter': row['expenditurePaidCommSubMatter']
            })
        return cleaned

    def _parse_contributions_table(self, r):
        rows = r.json()
        cleaned = []
        for row in rows:
            addressLn1, city, state, zip_code = self._parse_address(row['entityAddress'])
            # Magic date conversion!
            # date  = datetime.fromtimestamp(row['datePaid'] / 1000).strftime('%m/%d/%y')
            date = self._parse_date(row['datePaid'])
            if (row['cashAmt'] > 0 and row['inKindAmt'] > 0):
                amount_type = 'Mixed'
            elif (row['cashAmt'] > 0):
                amount_type = 'CA'
            elif (row['inKindAmt'] > 0):
                amount_type = 'IK'
            cleaned.append({
                'Date Paid': date,
                'Entity Name': row['entityName'],
                'First Name' : '',
                'Middle Initial': '',
                'Last Name': '',
                'Addr Line1': addressLn1,
                'City': city,
                'State': state,
                'Zip': zip_code,
                'Zip4': '',
                'Country': '',
                'Occupation': row['occupationDescr'],
                'Employer': row['employerDescr'],
                'Contribution Type': row['lineItemCompositeDescr'],
                'Amount': row['totalAmt'],
                'Amount Type': amount_type,
                'Purpose': row['purposeDescr'],
                'Election Type': row['amountTypeDescr'],
                'Total Primary': row['totalToDatePrimary'],
                'Total General': row['totalToDateGeneral'],
                'Refund Transaction Type': '',
                'Refund Original Transaction Date': row['refundOrigTransDate'],
                'Refund Original Transaction Total': row['refundOrigTransTotalVal'],
                'Refund Original Transaction Descr': row['refundOrigTransDesc'],
                'Previous Transaction (Y/N)': row['previousTransactionInd'],
                'Fundraiser Name': row['fundraiserName'],
                'Fundraiser Location': row['fundraiserLocation'],
                'Fundraiser Attendees': row['fundraiserAttendees'],
                'Fundraiser Tickets Sold': row['fundraiserTicketsSold'],
            })
        return cleaned

    # TODO: Dedupe with cers_committees
    def _parse_address(self, raw):
        # Assumes address format '1008 Prospect Ave, Helena, MT 59601'
        # Edge cases will be a pain in the ass here
        if (raw == ''):
            return '','','',''
        address = raw.replace('Washington, DC', 'Washington DC, DC').split(', ')
        addressLn1 = (', ').join(address[0:len(address)-2])
        city = address[-2].strip()
        state_zip = address[-1].split(' ')
        state = state_zip[0]
        zip_code = state_zip[1]

        if (len(state_zip) != 2): print('Address parse error, not len 2', state_zip)
        if (len(state) != 2): print("State parse error, not len 2", state)

        return addressLn1, city, state, zip_code

    def _parse_date(self, raw):
        return datetime.fromtimestamp(raw / 1000).strftime('%m/%d/%y')

    def _export(self):
        file_path = self.file_path
        output = {
            'data': self.data,
            'summary': self.summary,
            'contributions': self.contributions,
            'expenditures': self.expenditures,
        }
        with open(file_path, 'w') as f:
            json.dump(output, f, indent=4)
