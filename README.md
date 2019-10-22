# Montana 2020

Work in progress news app for parsing & presenting candidate data for the 2020 Montana election cycle.

## Structure
- app - Gatsby app for building public-facing product
- analysis - Gatsby app designed for experiments/internal reporting work
- data - centralized repository for cleaned data, stored as .json (may migrate this to MongoDB down the road)
- scrapers - data acquistion/processing pipelines
- process - scripts for processing scraped data into forms used by app and analysis
- utils - one-off scripts

## Data flow

General pattern: Local scripts (Python or Node) to pull in data, stash as .json locally, then feed to Gatsby build process. Plan is to avoid mucking with a database if possible.

Some data pipeline folders contain Jupyter notebooks for exploration/script development.

### Existing data processing pipelines
- *app-copy* - Pulls in [ArchieML](http://archieml.org) for app text content from [Google Doc](https://docs.google.com/document/d/1-PomtLY2bwwC9I-osdZnxcb8nwB9ubvhxyxLocPBk4w/edit). Relies on `token.json` and `credentials.json` in project root.
    - CMD: Refresh copy: `node scrapers/app-copy/fetch-app-copy.js`
- *state-finance-reports* - itemized state/local race campaign finance data from COPP
    - CMD: Check for new candidate filings: `python3 scrapers/state-finance-reports/check-candidate-updates.py`
    - CMD: Check for new C-5 filings: `python3 scrapers/state-finance-reports/check-report-updates.py`
    - CMD: Refresh data: (Takes several minutes) `python3 scrapers/state-finance-reports/fetch-finance-reports.py`
    - CMD: Clean data: `python3 scrapers/state-finance-reports/clean.py`
    - CMD: Move to app: `sh utils/campaign-finance-to-app.sh` # replace w/ node script that also parses

### App data compilation

- CMD: push state finance to app: `node process/process-state-finance.js`

### Deploy app to MTFP server
- `(cd app; gatsby build --prefix-paths && rm -r ./montana-2020 ||: && mv ./public ./montana-2020)`
- `(cd app; lftp -c "open sftp://ericdietrich@sftp.flywheelsites.com/mtfpeditor/montana-free-press/apps; mirror -eR montana-2020/")` // with file deletion
- `(cd app; lftp -c "open sftp://ericdietrich@sftp.flywheelsites.com/mtfpeditor/montana-free-press/apps; mirror -R montana-2020/")` // quicker?

### Next priority pipelines:
- fed-finance-reports - federal race campaign finance data from FEC API

### Planned/potential (some of these won't be feasible)
- boundaries - house/senate district & (hopefully) precinct-level geodata
- boundaries-cartogram - build
- results-historical- historical election data from SOS
- results-primary - (as available in June 2020) - 2020 primary results
- results-general - (as available in Nov. 2020) - 2020 general results
- candidate-business-interests - data sourced to COPP D-1 filings (available early 2020)
- candidate-records - hand-curated info on prior accomplishments? (include in app-copy?)
- district-demographics - state district/precinct-level demographic data - census bureau
- coverage-mtfp - list of stories related to specific candidates/races from MTFP - source to MTFP website API
- coverage-outside - list of stories from other outlets - hand-curate links in Google Sheet, pipe headlines/bylines/etc. into Gatsby with some sort of metadata scraper
- candidate-images - (currently stashed in app, incomplete)
- candidate-statements - hand-curate social media posts/press releases/other statements in Google Doc?
- candidate-mailers - mailers/advertisements - figure out system?
- spending-tv-spots - figure out how to scrape data from local TV stations

## TODO

FIRST TODO:
- Make plain text version of homepage at `/text-only/` (partially complete - need another through styling pass)
- Finish implementing campaign finance

MED TODO:
- Better graphic design - photo underlay on homepage title, match fonts/styles etc.
- Better homepage image
- Add updates page for new data/corrections etc.

BIGGER PICTURE TODO
- Clean up Google Docs import, bulletproof security issues
- Build a shared component library? How would that work? [Storybook](https://storybook.js.org/)?
- Think through testing for data pipelines
- Embed podcast player in dropdown for candidates who've been interviewed on [MTFP podcast](https://montanafreepress.org/series/montana-lowdown-podcast/)


