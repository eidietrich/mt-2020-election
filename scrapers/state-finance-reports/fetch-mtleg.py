#!/usr/bin/env python3

"""Check finance records from CERS for state district candidates

run as: python3 scrapers/state-finance-reports/fetch-mtleg.py
"""

from cers_interface import Interface
import json

cers = Interface()

print('# Fetching state district and legislative candidates')
mtleg = cers.legislature_2020(cachePath='scrapers/state-finance-reports/raw-legislature/')