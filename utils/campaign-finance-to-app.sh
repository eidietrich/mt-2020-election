#!/bin/bash
# run from root directory
# copy campaign finance data from scraper directory to app

CONTRIBUTIONS=scrapers/state-finance-reports/data/state-finance-cleaned.json
DESTINATION=app/src/data/state-finance.json
cp $CONTRIBUTIONS $DESTINATION
echo "File copied to app"