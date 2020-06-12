// centralized utility & data management functions 

import { parties } from './config.js'
 
const activeStatuses = ['Won primary', 'Uncontested primary','Passed primary','Gathering signatures']
export const passedPrimary = candidate => activeStatuses.includes(candidate.status)
export const failedPrimary = candidate => candidate.status === 'Lost primary'
export const filterToActive = candidates => candidates.filter(passedPrimary)

export const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')
export const makeCandidateUrl = candidate => `/candidates/${makeCandidateKey(candidate)}`

export const makeRaceKey = race => race.position.replace(/\s/g, '-')
export const makeRaceUrl = candidate => `/races/${makeRaceKey(candidate)}`

export const getCandidateParty = candidate => parties.find(d => d.key === candidate.party)
export const getPartyFromLetter = letter => parties.find(d => d.key === letter)
export const getPartyColor = letter => getPartyFromLetter(letter).color


export const candidateNameParty = candidate => {
  const incumbency = c => (candidate.incumbent === 'TRUE') ? "-INCUMBENT" : ""
  return `${candidate.first_name}\xA0${candidate.last_name}\xA0(${candidate.party}${incumbency(candidate)})`
}

export const cleanDisplayUrl = url => url
  .replace(/www\./, '')
  .replace('http://','')
  .replace('https://','')
  .replace(/\/$/,'')