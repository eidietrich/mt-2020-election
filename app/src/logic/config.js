import { format } from 'd3-format'

export const raceTypes = [
  {key: 'state', description: 'State office. Race regulated by the Montana Commissioner of Political Practices'},
  {key: 'federal', description: 'Federal office. Race regulated by the Federal Election Commission.'}
]

export const parties = [
    {key: 'R', name:'Republican', color: '#d73027'},
    {key: 'D', name:'Democrat', color: '#4575b4'},
    {key: 'L', name:'Libertarian', color: '#e89a0b'},
  ]

// candidate statuses excluded from summary page
export const excludeStatuses = ['Withdrawn','Not Running','Rumored','Potential','Suspended']


// display info
export const dollarFormat = format('$,.0f')
