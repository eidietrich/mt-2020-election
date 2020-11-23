# Montana 2020

News app for parsing & presenting candidate data for the 2020 Montana election cycle. Montana Free Press project. In production at https://apps.montanafreepress.org/montana-2020/.

Open sourcing this primarily as a reference for data journalists/developers looking to build similar projects (and also my future self). Code here is definitely get-er-done quality, not replicate-without-headaches quality.

## Structure
- `app` - [Gatsby.js](http://gatsbyjs.org/) front-end app. Key non-standard pieces:
    - `gatsby-node` pulls from `/src/data/app-copy.json` to build pages for each race and candidate. Also merges in several other data sources (this should have been done in a front-end-independent data processing step).
    - `src/images/candidates/` - Collection of colored-by-party candidate portraits. Produced individually via Photoshop.
- `data` - centralized repository for cleaned data (e.g. for one-off analyses). Messy
- `scrapers` - data acquistion/processing pipelines (mostly Python-based)
    - `app-copy` - Pulls in much of the app's display copy and structured data on candidates from an [ArchieML](http://archieml.org/)-formatted [Google Doc](https://docs.google.com/document/d/1ycZZ3elJ80Ps1AQqQmbjmvJUMnCi41ABvRAxJA-_R3I/edit?usp=sharing). A Google Sheet would have been a better entry point for structured candidate data because editing the ArchieML json was error prone.
    - `coverage-highlights` - Pulls in banner narrative coverage (e.g. reported race profiles) on a race-by-race basis from a [Google Sheet](https://docs.google.com/spreadsheets/d/14J2sDZ25bYjxzeB_6MtJvOW15VHhY03Uwh5cFXnZZSs/edit#gid=0).
    - `coverage-outside` - Pulls in non-MTFP (and some MTFP) coverage relative to specific/candidate races from [Google Sheet](https://docs.google.com/spreadsheets/d/1Gc5T29Bq6sFrYHPjaK6RAkPTdLXzp5NTuX5AnIAOWpw/edit#gid=0) where MTFP's editorial team tracked media coverage.
    - `issue-questions` - Pulls in candidate questionnaire responses from ArchieML-formatted [Google Doc](https://docs.google.com/document/d/1gplgsSu4pVLedooxNi0VGBXwslXZ4EtXBqkZMgaD5mI/edit). Responses were solicited via Google Forms (with strict character count enabled!) and a [Google scripts mail merge automation](https://developers.google.com/gsuite/solutions/mail-merge), then converted from Google Sheets to a consolidated document. Consolidating in a GDoc instead of a .json allowed for team copy editing. More on Mail Merge process [here](https://docs.google.com/document/d/1ajbzildrtuPg9FAHlITEXhzGm2lU69sGqZ0rPoUkUYE/edit).
    - `fed-finance-reports` - System for pulling campaign finance data for federally-administerd races (U.S. Senate, U.S. House) from the U.S. Federal Election Commission. Key components:
        - `fetch-finance-totals.py` - Pulls aggregate finance totals for candidates in `/data/candidates.json` from FEC finance summary bulk download file.
        - `fetch-itemized-receipts.py` - Pulls raw itemized reciepts for candidates from their FEC.gov pages (e.g. https://www.fec.gov/data/receipts/?data_type=efiling&committee_id=C00491357).
        - `clean-itemized.py` - Initial cleaning for itemized receipts.
    - `state-finance-reports` - System for pulling campaign finance data for state-administered races (Governor etc.) from the Montana Commissioner of Political Practices' [CERS system](https://cers-ext.mt.gov/).
        - `raw` folder is essentially a cache. Scraping code checks for amended filing and updates caches if necessary. Included in version control because of manual form entries noted below.
        - `fetch-statewide.py` - Entry point for statewide race campaign finance report scraper.
        - `clean.py` - Cleans results of `fetch-statewide.py`
        - `fetch-candidate.py` and `fetch-report.py` are one-off scripts used for testing/exploration
        - Note: Mike Cooney campaign finance reports jammed up CERS most quarters. I resorted to emailing the COPP to ask for the data files directly, then hooking them up via a hacky manual workaround. See `MANUAL_CACHES` in `cers_models.py` and `raw/Cooney-Mike--R/manual-*`
        - `raw-committees/`, `raw-legislature/` are detritus using this CERS interface (via `fetch-committees.py` and `fetch-mtleg.py`) in an incomplete effort to pull in PAC-spending and legislative race fundraising figures.
- `process` - scripts for processing scraped data into forms used by front-end app (Node.js based)
    `prep-app-data.js` - Primary script. Writes to `./app/src/data/app-prepped-data.json`
- `utils` - one-off scripts. Messy.

## NPM Commands
- `npm start` - Start front-end development server
- `npm refresh` - Runs multiple data refresh scripts (does NOT run time-intensive state/federal data scrapers). Runs data processing script to aggregate already scraped state and federal filings, refreshes media links, featured media links, app text and candidate questionnaire text.
- `npm deploy` - Builds static production version of frontend app and deploys to MTFP's `apps` server on Amazon Web Service S3, then cache busts.
- `npm run fetch:federal-filings` - Runs the federal campaign finance data scraper, fetching finance totals, separately fetching itemized data and also running the initial cleaning step.
- `npm run fetch:state-filings` - Runs the state campaign finance data scraper, fetching data and passing it through an initial cleaning step.

Typical app data update workflow:
1. Scrape current state data
2. Scrape current federal data
3. Run `npm refresh` to pipe refreshed data to app 
4. Deploy via `npm deploy`

## App Secrets
- npm cache clearing script expects the Cloudfront distribution ID in `$CLOUDFRONT_DIST`
- Google doc interface scrapers expect `token-mtfp.json` file at project root. Can be created via `utils/initialize-google-oauth.js`.

## Notes for next iteration
- Data pipelines could use a good, solid refactor
- Data pipelines really should have had more consistent/comprehensive testing
- Data processing pipelines are inconsistent about reading/writing intermediate data to/from `data/` vs `app/src/data`.
- Front-end development would have been cleaner with Storybook or similar set up as a visual test environment
- Is cache-busting approach in AWS S3 bucket deployment process the most economic way to push updates? 
- App landing page (initially designed for answering 'who has filed to run for X position?` question early in primary period) really wasn't optimized for meeting reader needs immediately before the general election.


