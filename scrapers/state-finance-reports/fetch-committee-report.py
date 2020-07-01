#!/usr/bin/env python3

from cers_committees import Report

report = {
    "reportId": 47192,
    "fromDateStr": "01/01/2020",
    "toDateStr": "03/25/2020",
    "formTypeCode": "C6",
    "formTypeDescr": "Political Committee Finance Report",
    "committeeId": 8350,
    "committeeName": "Doctors for a Healthy Montana ",
    "statusDescr": "Filed",
    "amendedDate": None,
    "totalContrLessThan35": 0.0,
    "totalIndivContrLessThan35": 0.0,
    "grandTotalLessThan35": 0.0,
    "grandTotalLessThan35Primary": 0.0,
    "grandTotalLessThan35General": 0.0
}
cId = report['committeeId']
cName = report['committeeName'].strip().replace(' ','-').replace(',','')
slug = f'{cId}-{cName}'
Report(report, cachePath=f'scrapers/state-finance-reports/raw-committees/{slug}', checkCache=False)