// Reporting periods mapping for state filings
// Hand-coded b/c some of these are weird
module.exports.reportingPeriodDict = {
    
    '06/01/2019 to 10/10/2019': 'NonSt',
    
    '01/01/2019 to 04/01/2019': 'Q1_19',
    '12/21/2018 to 04/01/2019': 'Q1_19',
    '03/13/2019 to 04/02/2019': 'Q1_19',

    '04/01/2019 to 06/30/2019': 'Q2_19',
    '06/01/2019 to 06/30/2019': 'Q2_19',
    '05/26/2019 to 06/30/2019': 'Q2_19',
    '04/02/2019 to 06/30/2019': 'Q2_19',
    '05/17/2019 to 06/30/2019': 'Q2_19',
    '06/07/2019 to 07/01/2019': 'Q2_19',
    '06/08/2019 to 06/30/2019': 'Q2_19',
    '04/03/2019 to 06/30/2019': 'Q2_19',
    '06/26/2019 to 06/30/2019': 'Q2_19',
    
    '07/01/2019 to 09/30/2019': 'Q3_19',
    '07/02/2019 to 09/30/2019': 'Q3_19',
    '07/24/2019 to 09/30/2019': 'Q3_19',
    
    '10/01/2019 to 12/31/2019': 'Q4_19',
    '10/02/2019 to 12/31/2019': 'Q4_19', 
    '10/11/2019 to 12/31/2019': 'Q4_19',
    '11/25/2019 to 12/31/2019': 'Q4_19',

    '01/01/2020 to 04/01/2020': 'Q1_20',
    '01/01/2020 to 03/15/2020': 'Q1_20',
    '03/09/2020 to 03/15/2020': 'Q1_20',
    '03/09/2020 to 03/25/2020': 'Q1_20',
    '03/08/2020 to 03/15/2020': 'Q1_20',
    '01/01/2020 to 03/20/2020': 'Q1_20',
    '03/06/2020 to 03/20/2020': 'Q1_20',

    '03/16/2020 to 04/15/2020': 'Apr_20',
    '03/26/2020 to 04/15/2020': 'Apr_20',
    '03/21/2020 to 04/15/2020': 'Apr_20',

    '04/16/2020 to 05/14/2020': 'May_20',
    '04/16/2020 to 05/15/2020': 'May_20',
    '04/16/2020 to 05/17/2020': 'May_20',
    '04/16/2020 to 05/20/2020': 'May_20',

    '05/15/2020 to 05/17/2020': 'pri_C7',
    '05/16/2020 to 05/22/2020': 'pri_C7',
    '05/18/2020 to 05/18/2020': 'pri_C7',
    '05/18/2020 to 05/19/2020': 'pri_C7',
    '05/19/2020 to 05/19/2020': 'pri_C7',
    '05/19/2020 to 05/20/2020': 'pri_C7',
    '05/19/2020 to 05/21/2020': 'pri_C7',
    '05/15/2020 to 06/15/2020' : 'pri_C7',
    '05/20/2020 to 05/20/2020': 'pri_C7',
    '05/20/2020 to 05/21/2020': 'pri_C7',
    '05/20/2020 to 06/02/2020': 'pri_C7',
    '05/21/2020 to 05/22/2020': 'pri_C7',
    '05/22/2020 to 05/22/2020': 'pri_C7',
    '05/20/2020 to 05/22/2020': 'pri_C7',
    '05/20/2020 to 05/26/2020': 'pri_C7',
    '05/23/2020 to 05/25/2020': 'pri_C7',
    '05/25/2020 to 05/26/2020': 'pri_C7',
    '05/26/2020 to 05/26/2020': 'pri_C7',
    '05/27/2020 to 05/27/2020': 'pri_C7',
    '05/27/2020 to 05/28/2020': 'pri_C7',
    '05/28/2020 to 05/28/2020': 'pri_C7',
    '05/28/2020 to 05/29/2020': 'pri_C7',
    '05/29/2020 to 05/29/2020': 'pri_C7',
    '05/29/2020 to 06/01/2020': 'pri_C7',
    '05/30/2020 to 06/01/2020': 'pri_C7',
    '05/31/2020 to 06/01/2020': 'pri_C7',
    '06/02/2020 to 06/02/2020': 'pri_C7',
}

module.exports.contributionLimitsByOffice = {
    'Governor': 710,
    'U.S. Senate': 2800,
    'U.S. House': 2800,
    'Attorney General': 360,
    'Secretary of State': 360, 
    'Superintendent of Public Instruction': 360,
    'State Auditor': 360,
}