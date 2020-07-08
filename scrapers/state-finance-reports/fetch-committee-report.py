#!/usr/bin/env python3

from cers_committees import Report

report = {'reportId': 27150, 'fromDateStr': '04/05/2012', 'toDateStr': '05/05/2012', 'formTypeCode': 'C6', 'formTypeDescr': 'Political Committee Finance Report', 'committeeId': 2736, 'candidateName': 'Montanans for Fiscal Accountability: No on LR123', 'statusDescr': 'Filed', 'amendedDate': None, 'totalContrLessThan35': 0.0, 'totalIndivContrLessThan35': 0.0, 'grandTotalLessThan35': 0.0, 'grandTotalLessThan35Primary': 0.0, 'grandTotalLessThan35General': 0.0}
cId = report['committeeId']
cName = report['candidateName'].strip().replace(' ','-').replace(',','')
slug = f'{cId}-{cName}'
Report(report, cachePath=f'scrapers/state-finance-reports/raw-committees/{slug}', checkCache=False)