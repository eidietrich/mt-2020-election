# Data flow

General pattern: Local scripts to pull in data, stash as .json locally to feed to Gatsby build process.
Avoid a database if possible.

Current
- Candidate Google doc -`get-data.js`-> 'data.json' --> homepage + candidate pages

SIMPLE TODO:
- Embed podcast player in dropdown
- Add Google Analytics

BIGGER PICTURE TODO
- Clean up Google Docs import, security issues
- Build a shared component library? How would that work?

STRUCTURE
- app - Gatsby app for building public-facing product
- analysis - Gatsby app designed for experiments/internal reporting work
- data - centralized repository for cleaned data, stored as .json (may migrate this to MongoDB down the road)
- scrapers - data acquistion/processing pipelines
- utils - one-off scripts

DATA PROCESSING PIPELINES

Existing
- app-copy - Pulls in [ArchieML](http://archieml.org) for app text content from [Google Doc](https://docs.google.com/document/d/1-PomtLY2bwwC9I-osdZnxcb8nwB9ubvhxyxLocPBk4w/edit). Relies on `token.json` and `credentials.json` in project root.
    - Refresh copy: `node scrapers/app-copy/fetch-app-copy.js`
- state-finance-reports - itemized state/local race campaign finance data from COPP
    - Check for new candidate filings: `python3 scrapers/state-finance-reports/check-candidate-updates.py`
    - Check for new C-5 filings: `python3 scrapers/state-finance-reports/check-report-updates.py`
    - Refresh data: `python3 scrapers/state-finance-reports/fetch-finance-reports.py`

Next priority:
- fed-finance-reports - federal race campaign finance data from FEC API


Planned/potential
- boundaries - house/senate district & (hopefully) precinct-level geodata
- boundaries-cartogram - build
- results-historical- historical election data from SOS
- results-primary - (as available in June 2020) - 2020 primary results
- results-general - (as available in Nov. 2020) - 2020 general results
- candidate-business-interests - data sourced to COPP D-1 filings (available early 2020)
- candidate-records - hand-curated info on prior accomplishments? (include in app-copy?)
- district-demographics - state district/precinct-level demographic data - census bureau
- coverage-mtfp - list of stories related to specific candidates/races from MTFP - source to MTFP website API
- coverage-outside - list of stories from other outlets - hand-curate in Google Doc
- candidate-images - (currently stashed in app, incomplete)
- candidate-statements - hand-curate social media posts/press releases/other statemetns in Google Doc?
- candidate-mailers - mailers/advertisements - figure out system?
- spending-tv-spots - figure out how to scrape data from local TV stations
