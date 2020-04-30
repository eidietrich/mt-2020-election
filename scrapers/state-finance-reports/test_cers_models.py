#!/usr/bin/env python3

"""
Quick and dirty functions to test web scraper classes

TODO: translate to pytest
Refs: https://www.tutorialspoint.com/python_web_scraping/python_web_scraping_testing_with_scrapers.htm
Refs: https://docs.pytest.org/en/latest/unittest.html
"""

import pandas as pd
from dateutil.parser import parse

def test_candidate_list():
    from cers_models import CandidateList
    search = {
        'lastName': '',
        'firstName': '',
        'middleInitial': '',
        'electionYear': '2020',
        'candidateTypeCode': '',
        'officeCode': '245', # OPI
        'countyCode': '',
        'partyCode': '',
    }
    cs = CandidateList(search, filterStatuses=['Active','Reopened','Amended'])
    cs.export('raw/')

def test_candidate():
    from cers_models import Candidate
    test_candidate = {
    'candidateId': 16074,
    'candidateName': 'Arntzen, Elsie ',
    'candidateLastName': 'Arntzen',
    'partyDescr': 'Republican',
    'electionYear': '2020',
    'resCountyDescr': 'Yellowstone',
    'officeTitle': 'Superintendent of Public Instruction',
    'candidateStatusDescr': 'Amended'
    }
    tc = Candidate(test_candidate)

    # summaries_sorted = sorted(tc.list_summaries(), key=lambda i: parse(i['report_end_date']))
    
    # _verify_summary_totals_sum(tc.summary)
    # _verify_candidate_reports_match(summaries_sorted)
    
    # print(tc.summary)
    # print(tc.unitemized_contributions)

    tc.export('raw/')

    # for total in summaries_sorted:
    #     print(total)

def test_report():
    from cers_models import Report
    test_report = {
    'reportId': 46848,
    'fromDateStr': '01/01/2020',
    'toDateStr': '03/15/2020',
    'formTypeCode': 'C5',
    'formTypeDescr': 'Candidate Campaign Finance Report',
    'candidateId': 16074,
    'candidateName': 'Arntzen, Elsie ',
    'officeTitle': 'Superintendent of Public Instruction',
    'electionYear': '2020'
    }
    tr = Report(test_report)
    print(tr.unitemized_contributions)
    # print(pd.DataFrame(tr.summary))


def _verify_candidate_reports_match(summaries_sorted):
    for i, _ in enumerate(summaries_sorted):
        current = summaries_sorted[i]
        if (i == 0):
            if (current['previous report']['total'] != 0):
                print ('First report isn\'t zero')
        else:
            prior = summaries_sorted[i-1]
            if (current['previous report']['total'] != prior['Ending Balance']['total']):
                print('Report total mismatch between reporting periods')
    print('Reports checked for alignment')

def _verify_summary_totals_sum(summary_total):
    # Primary + General = Total
    contributions = summary_total['contributions']
    expenditures = summary_total['expenditures']
    balance = summary_total['cash_on_hand']
    try:
        assert contributions['primary'] + contributions['general'] == contributions['total']
        assert expenditures['primary'] + expenditures['general'] == expenditures['total']
        assert balance['primary'] + balance['general'] == balance['total']
    except AssertionError:
        print('Primary/general/total mismatch')
        print(summary_total)

    # Down Revenues - Expendures = cash on hand
    try:
        assert summary_total['contributions']['total'] - summary_total['expenditures']['total'] == summary_total['cash_on_hand']['total']
    except AssertionError:
        print('Ending balance mismatch')
        print(summary_total)

    print('Summary totals checked')

def main():
    test_candidate_list()
    # test_candidate()
    # test_report()
    
if __name__ == '__main__':
    main()