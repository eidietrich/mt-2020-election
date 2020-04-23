"""
Interface for fetching CERS data

Components
- Interface - List of queries (e.g. all statewide 2020 candidates)
"""

from cers_models import CandidateList

CANDIDATE_SEARCH_DEFAULT = {
    'lastName': '',
    'firstName': '',
    'middleInitial': '',
    'electionYear': '',
    'candidateTypeCode': '',
    'officeCode': '',
    'countyCode': '',
    'partyCode': '',
}

ACTIVE_STATUSES = ['Active','Reopened','Amended']

class Interface:
    """
    Interface for Montana COPP Campaign Electronic Reporting System
    """

    # Recipies
    def list_statewide_2020_candidates(self):
        """Lists statewide 2020 candidates without fetching all their reports"""
        search = CANDIDATE_SEARCH_DEFAULT.copy()
        search['electionYear'] = '2020'
        search['candidateTypeCode'] = 'SW' # statewide
        candidates_state_2020 = CandidateList(
            search,
            fetchReports=False, # avoids costly scraping operation
            filterStatuses=ACTIVE_STATUSES
        ) 
        return candidates_state_2020.list_candidates()

    def statewide_2020(self):
        """Runs a full data fetch on statewide 2020 candidates"""
        search = CANDIDATE_SEARCH_DEFAULT.copy()
        search['electionYear'] = '2020'
        search['candidateTypeCode'] = 'SW' # statewide
        return CandidateList(search, filterStatuses=ACTIVE_STATUSES)

    def statewide_2020_johnsons(self):
        """For testing"""
        search = CANDIDATE_SEARCH_DEFAULT.copy()
        search['electionYear'] = '2020'
        search['candidateTypeCode'] = 'SW' # statewide
        search['lastName'] = 'Johnson'
        return CandidateList(search, filterStatuses=ACTIVE_STATUSES)




        

    