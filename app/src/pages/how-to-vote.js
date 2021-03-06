import React, { Component } from "react"
import { Link } from 'gatsby'

import Layout from "../components/layout"
import SEO from "../components/seo"

import DistrictLocator from '../components/DistrictLocator'
import Dropdown from '../library/Dropdown'

import styles from './text.module.css'

// const ballotDropOffAddresses = {
//   "Beaverhead County": "2 South Pacific St., Suite 3, Dillon, MT 59725",
//   "Big Horn County": "121 W. 3rd, Room 228, Hardin, MT 59034",
//   "Blaine County": "420 Ohio St., Chinook, MT 59523; Wednesday and Thursday 10 a.m. to 5 p.m. at the Fort Belknap Agency Insurance Building, 200 Chippewa Ave, Harlem MT",
//   "Broadwater County": "515 Broadway St., Townsend, MT 59644",
//   "Carbon County": "17 W. 11th St., Red Lodge, MT 59068",
//   "Carter County": "214 E. Park St., Ekalaka, MT 59324",
//   "Cascade County": "325 2nd Ave. N. #100, Great Falls, MT 59401; Montana Expo Park Exhibition Hall, 400 3rd St NW, Great Falls MT (May 26-29 from 7 a.m. to 5 p.m.; June 1 from 7 a.m. to noon)",
//   "Chouteau County": "1308 Franklin St., Fort Benton, MT 59442",
//   "Custer County": "1010 Main St., Suite 17, Miles City, MT 59301",
//   "Daniels County": "213 Main St., Scobey, MT 59263",
//   "Dawson County": "207 W. Bell St., Glendive, MT 59330",
//   "Deer Lodge County": "800 Main St., Anaconda, MT 59711 (9 a.m. to 1 p.m. by appointment only through June 1)",
//   "Fallon County": "10 W. Fallon Ave., Baker, MT 59313",
//   "Fergus County": "712 W. Main, Suite 204, Lewistown, MT 59457",
//   "Flathead County": "40 11th St. W., Suite 230, Kalispell, MT 59901",
//   "Gallatin County": "311 W. Main St., Room 210, Bozeman, MT 59715",
//   "Garfield County": "352 Leavitt Ave., Jordan, MT 59337",
//   "Glacier County": "512 E. Main St., Cut Bank, MT 59427 (8 a.m. to 5 p.m. by appointment only through June 1); Browning Satellite Office, 12 Starr School Rd., Browning, MT (8 a.m. to 5 p.m. by appointment only through June 1)",
//   "Golden Valley County": "107 Kemp St., Ryegate, MT 59074",
//   "Granite County": "220 N. Sansome St., Philipsburg , MT 59858",
//   "Hill County": "315 4th St., Havre, MT 59501",
//   "Jefferson County": "102 S. Monroe St., Boulder, MT 59632",
//   "Judith Basin County": "91 3rd St. N., Stanford, MT 59479 (back-door entrance)",
//   "Lake County": "106 4th Ave. E., Room 121, Polson, MT 59860",
//   "Lewis and Clark County": "316 N. Park Ave., Helena, MT 59623",
//   "Liberty County": "111 1st St. E., Chester, MT 59522 (10 a.m. to 2 p.m.)",
//   "Lincoln County": "512 California Ave., Libby, MT 59923",
//   "Madison County": "103 W. Wallace St., Virginia City, MT 59755 (8 a.m. to noon on June 1)",
//   "McCone County": "1004 Ave. C, Circle, MT 59215",
//   "Meagher County": "15 West Main St., White Sulphur Springs, MT 59645 (8 a.m. to 4:30 p.m. through June 1)",
//   "Mineral County": "300 River St., Superior, Montana 59872",
//   "Missoula County": "140 N. Russell St., Missoula, MT 59801",
//   "Musselshell County": "506 Main St., Roundup, MT 59072",
//   "Park County": "414 E. Callender St., Livingston, MT 59047",
//   "Petroleum County": "302 E. Main St., Winnett, MT 59087",
//   "Phillips County": "314 S. 2nd Ave. W., Malta, MT 59538",
//   "Pondera County": "20 4th Ave. SW, Conrad, MT 59425",
//   "Powder River County": "119 N. Park Ave., Broadus, MT 59317",
//   "Powell County": "409 Missouri Ave., Suite 203, Deer Lodge, MT 59722",
//   "Prairie County": "217 Park St., Terry, MT 59349",
//   "Ravalli County": "215 4th St., Hamilton, MT 59840",
//   "Richland County": "201 W. Main, Sidney, MT 59270",
//   "Roosevelt County": "400 2nd Ave. S., Suite 105, Wolf Point, MT 59201 (9 a.m. to 4 p.m. May 20-21 and May 27-28); James E. Shanley Tribal Library Satellite Office, 604 Assiniboine Ave., Study Room 2, Poplar, MT (9 a.m. to 4 p.m. May 20-21 and May 27-28)",
//   "Rosebud County": "1200 Main St., Forsyth, MT 59327 (8 a.m. to 5 p.m. by appointment only through June 1)",
//   "Sanders County": "1111 Main St., Thompson Falls, MT 59873 (8 a.m. to noon on June 1)",
//   "Sheridan County": "100 W. Laurel Ave., Plentywood, MT 59254",
//   "Silver Bow County": "105 W. Broadway, Room 208, Butte, MT 59701",
//   "Stillwater County": "400 E. 3rd Ave. N., Columbus, MT 59019",
//   "Sweet Grass County": "115 W. 5th Ave., Big Timber, MT 59011",
//   "Teton County": "1 Main Ave. S., Choteau, MT, 59422",
//   "Toole County": "226 1st St. S., Shelby, MT 59474",
//   "Treasure County": "307 Rapelje Ave., Hysham, MT 59038",
//   "Valley County": "501 Court Square # 2, Glasgow, MT 59230",
//   "Wheatland County": "201 A Ave. NW, Harlowton, MT 59036",
//   "Wibaux County": "203 Wibaux St. S., Wibaux, MT 59353",
//   "Yellowstone County": "217 N. 26th St., Room 101, Billings, MT 59101",
// }

const countyElectionPhones = {
  "Beaverhead County": "(406) 683-3720",
  "Big Horn County": "(406) 665-9704",
  "Blaine County": "(406) 357-3240",
  "Broadwater County": "(406) 266-3443",
  "Carbon County": "(406) 446-1220",
  "Carter County": "(406) 775-8749",
  "Cascade County": "(406) 454-6803",
  "Chouteau County": "(406) 622-5151",
  "Custer County": "(406) 874-3343",
  "Daniels County": "(406) 487-5561",
  "Dawson County": "(406) 377-3058",
  "Deer Lodge County": "(406) 563-4061",
  "Fallon County": "(406) 778-7106",
  "Fergus County": "(406) 535-5242",
  "Flathead County": "(406) 758-5535",
  "Gallatin County": "(406) 582-3060",
  "Garfield County": "(406) 557-2760",
  "Glacier County": "(406) 873-3609",
  "Golden Valley County": "(406) 568-2231",
  "Granite County": "(406) 859-3771",
  "Hill County": "(406) 265-5481",
  "Jefferson County": "(406) 225-4020",
  "Judith Basin County": "(406) 566-2277",
  "Lake County": "(406) 883-7268",
  "Lewis and Clark County": "(406) 447-8339",
  "Liberty County": "(406) 759-5365",
  "Lincoln County": "(406) 283-2302",
  "McCone County": "(406) 485-3505",
  "Madison County": "(406) 843-4270",
  "Meagher County": "(406) 547-3612",
  "Mineral County": "(406) 822-3520",
  "Missoula County": "(406) 258-4751",
  "Musselshell County": "(406) 323-1104",
  "Park County": "(406) 222-4110",
  "Petroleum County": "(406) 429-5311",
  "Phillips County": "(406) 654-2423",
  "Pondera County": "(406) 271-4000",
  "Powder River County": "(406) 436-2361",
  "Powell County": "(406) 846-9786",
  "Prairie County": "(406) 635-5575",
  "Ravalli County": "(406) 375-6550",
  "Richland County": "(406) 433-1708",
  "Roosevelt County": "(406) 653-6250",
  "Rosebud County": "(406) 346-7318",
  "Sanders County": "(406) 827-6922",
  "Sheridan County": "(406) 765-3403",
  "Silver Bow County": "(406) 497-6342",
  "Stillwater County": "(406) 322-8000",
  "Sweet Grass County": "(406) 932-5152",
  "Teton County": "(406) 466-2693",
  "Toole County": "(406) 424-8300",
  "Treasure County": "(406) 342-5547",
  "Valley County": "(406) 228-6226",
  "Wheatland County": "(406) 632-4891",
  "Wibaux County": "(406) 796-2481",
  "Yellowstone County": "(406) 256-2740",
}

class VoterFAQPage extends Component {

  render() {


    return <Layout>
      <SEO title="Montana's 2020 election | How to vote" />
      <div className={`text ${styles.body}`}>
        <h1>Everything you need to know to vote</h1>
        <div className={styles.byline}>Compiled by Alex Sakariassen</div>
        <h3>When are the 2020 elections in Montana?</h3>
        <p>Montana's general election will be held Nov. 3. The state's primary election was held June 2.</p>

        <h3 id="what-offices-are-up-for-election-on-the-2020-ballot-">What offices are up for election on the 2020 ballot?</h3>
        <p>A lot. Montana’s 2020 ballot will include candidates for U.S. president, <Link to="/races/U.S.-Senate">U.S. Senate</Link>, <Link to="/races/U.S.-House">U.S. House</Link>, <Link to="/races/Governor">governor</Link>, <Link to="/races/Attorney-General">attorney general</Link>, <Link to="/races/Secretary-of-State">secretary of state</Link>, <Link to="/races/State-Auditor">state auditor</Link>, <Link to="/races/Superintendent-of-Public-Instruction">superintendent of public instruction</Link>, two state Supreme Court seats, eight District Court seats, and three seats on the utility-regulating Public Service Commission. </p>
        <p>Candidates for all 100 Montana House seats and 25 of the state’s 50 Senate seats (listed below) will also appear on the ballot, as well as any ballot measures that qualify. Signature gatherers will be working to qualify those petitions though mid-June, so be sure to check the <a href="https://sosmt.gov/elections/ballot_issues/2020-2/">Montana secretary of state’s ballot measure information page</a>  for more information.</p>
        <p>The Montana Senate districts on the 2020 ballot are: Districts 2, 3, 6, 7, 10, 15, 16, 17, 18, 21, 23, 25, 26, 28, 31, 35, 36, 37, 38, 39, 40, 44, 45, 46, and 47.</p>

        <DistrictLocator />

        <h3 id="how-do-i-vote-">How do I vote?</h3>
        <p>Due to public safety concerns raised by the coronavirus pandemic, this year‘s general election will play out a little differently in various parts of the state. Forty-six of Montana‘s 56 counties have opted to conduct the election by mail-in ballot, meaning all active registered voters will receive their ballot in the mail. The 10 counties that did not submit mail-in ballot plans to the state are: Broadwater, Carbon, Chouteau, Fergus, Mineral, Petroleum, Powder River, Powell, Stillwater, Treasure and Wibaux. If you live in one of these counties, please visit <a href="https://app.mt.gov/voterinfo/">Montana‘s My Voter Page</a> to find out if your ballot will be mailed to you or if your usual polling location will be open.</p>
        <p>If you live in one of the 46 counties that have opted for the mail-in route, those ballots are scheduled to be mailed to you Oct. 9. When it arrives, simply fill out the ballot, following the included instructions, and mail it back to your county elections office (return postage will be included). If you prefer not to return your ballot by mail, you can deliver it in person to your county‘s drop-off location (for a list of ballot drop-off locations in your county, check <a href="https://sosmt.gov/#r5">the drop-down tab on the Montana Secretary of State‘s website</a>). We‘ll also list those addresses a little farther down. Early in-person voting services are also available at your county elections office starting Oct. 2. Just make sure you mask up and maintain social distance.</p>

        <h3 id="do-i-need-to-be-registered-to-vote-">Do I need to be registered to vote?</h3>
        <p>Yes.</p>

        <h3 id="how-do-i-do-that-">How do I do that?</h3>
        <p>First, check the Montana secretary of state’s <a href="https://app.mt.gov/voterinfo/">My Voter Page</a> to make sure you aren’t registered already. If you aren’t, you can stop by your county election office anytime during regular business hours to pick up an application (some election offices are open by appointment only, so see the list below for details about your county). After you’ve filled it out, you’ll need to get it back to your county election office, either in person or via mail, and you’ll have to provide a valid ID or the last four digits of your Social Security number. Different election offices have different protocols for accomplishing this, so be sure to contact the election office in your county (their phone numbers are listed below) for instructions. </p>
        <p>Also, if you happen to be applying for a Montana driver’s license or identification card, you can register to vote at the same time.</p>

        <h3 id="can-i-register-to-vote-on-election-day-">Can I register to vote on Election Day?</h3>
        <p>Yes. Regular registration closes 30 days before the Nov. 3 general election. Late registration will be available until noon on Nov. 2 at your county election office or local election headquarters. Same-day registration is available from 7 a.m. to 8 p.m. on Election Day.</p>

        <h3 id="how-do-i-know-that-my-registration-information-is-accurate-and-current-">How do I know my registration information is accurate and current?</h3>
        <p>Go to the Montana secretary of state’s <a href="https://app.mt.gov/voterinfo/">My Voter Page</a> and enter your first name, last name and date of birth. The page will list your voter status, legislative House and Senate districts and the location of your polling place. There’s even a map with directions.</p>

        <h3 id="can-t-i-just-vote-online-">Can’t I just vote online?</h3>
        <p>Sorry, but that’s not an option in Montana.</p>

        <h3 id="are-there-any-situations-in-which-i-m-not-eligible-to-vote-">Are there any situations in which I’m not eligible to vote?</h3>
        <p>According to state law, you can’t vote if you’ll be under 18 on Election Day, are not a U.S. citizen, or have lived in Montana less than 30 days. Convicted felons currently incarcerated in a penal facility are also not eligible to vote, nor are persons whom a judge has ruled to be of unsound mind. Otherwise, you’re good to go.</p>

        <h3 id="i-have-a-friend-or-family-member-who-isn-t-able-to-drop-off-his-or-her-ballot-can-i-do-it-for-them-">I have a friend or family member who isn&#39;t able to drop off his or her ballot. Can I do it for them?</h3>
       
        <p>Yes. Due to a recent ruling by the Montana Supreme Court, all provisions of the 2018 Ballot Interference Prevention Act (BIPA) have been blocked, and the court doesn‘t plan to rule more broadly on the issue until after the Nov. 3 election. In other words, there are currently no limits or reporting requirements regarding who can help you drop off your ballot. Still, as the Missoula County Elections Office put it in an updated federal election FAQ: “Think of it like your grandmother‘s wedding ring. You can give it to whoever you want, but you should feel comfortable and confident in who you give it to.”</p>


        <h3 id="how-do-i-get-in-touch-with-my-county-election-official-">How do I get in touch with my county election official?</h3>
        <p>Easy. Just give them a call. Select your county in the dropdown menu below for their number.</p>

        <Dropdown
          data={countyElectionPhones}
          title='County election office phone numbers'
          defaultMessage='Select a county'
        />

        <h3 id="who-should-i-call-if-i-have-a-problem-on-election-day-or-if-i-see-something-hinky-going-on-">Who should I call if I have a problem on Election Day, or if I see something hinky going on?</h3>
        <p>County election officials will probably be in the best position to help, so call the appropriate number listed above. You can also call the Montana secretary of state’s office at (406) 444-9608.</p>

        <h3 id="who-should-i-vote-for-">Who should I vote for?</h3>
        <p>That’s entirely up to you, but it’s always a good idea to do a little research before casting your vote. If you’d like a clearer picture of who is running for federal and statewide office, see <Link to="/candidates">our candidate information pages</Link>.</p>
      </div>
    </Layout>
  }
}
export default VoterFAQPage