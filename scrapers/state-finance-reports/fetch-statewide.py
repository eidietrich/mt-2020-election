#!/usr/bin/env python3

"""Check finance records from CERS for statewide candidates

run as: python3 scrapers/state-finance-reports/fetch-statewide.py
"""

from cers_interface import Interface

cers = Interface()

print('# Fetching statewide candidates')
statewide = cers.statewide_2020()
statewide.export('scrapers/state-finance-reports/raw/')