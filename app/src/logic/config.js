import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'

export const raceTypes = [
  {key: 'state', description: 'State office. Race regulated by the Montana Commissioner of Political Practices'},
  {key: 'federal', description: 'Federal office. Race regulated by the Federal Election Commission.'}
]

export const parties = [
    {key: 'R', name:'Republican', color: '#d73027'},
    {key: 'D', name:'Democrat', color: '#4575b4'},
    {key: 'L', name:'Libertarian', color: '#e89a0b'},
  ]

// TODO: Automate this
export const fundraisingDomainUpperBound = {
  'Governor': 1800000,
  'U.S.-Senate': null,
  'U.S.-House': null,
  'Attorney-General': 200000,
  'Secretary-of-State' : 100000,
  'Superintendent-of-Public-Instruction': 100000,
  'State-Auditor': 100000,
}


// candidate statuses excluded from summary page
export const excludeStatuses = ['Withdrawn','Not Running','Rumored','Potential','Suspended']


// display info
export const dollarFormat = format('$,.0f')
export const percentFormat = format('.1%')
export const numberFormat = format(',')
export const dateFormat = timeFormat('%m/%d/%Y')