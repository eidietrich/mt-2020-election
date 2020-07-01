#!/usr/bin/env python3

from cers_committees import CommitteeList

COMMITTEE_SEARCH_DEFAULT = {
    'committeeName': '',
    'electionYear': '',
    'committeeTypeCode': '',
}

search = COMMITTEE_SEARCH_DEFAULT.copy()
# search['electionYear'] = '2020'
committees = CommitteeList(search)