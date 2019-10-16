// centralized utility & data management functions 

import { parties } from './config.js'

export const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')
export const makeCandidateUrl = candidate => `/candidates/${makeCandidateKey(candidate)}`

export const makeRaceKey = race => race.position.replace(/\s/g, '-')
export const makeRaceUrl = candidate => `/races/${makeRaceKey(candidate)}`

export const getCandidateParty = candidate => parties.find(d => d.key === candidate.party)

export const candidateNameParty = candidate => {
  const incumbency = c => (candidate.incumbent === 'TRUE') ? "-INCUMBENT" : ""
  return `${candidate.first_name} ${candidate.last_name} (${candidate.party}${incumbency(candidate)})`
}

export const cleanDisplayUrl = url => url
  .replace(/www\./, '')
  .replace('http://','')
  .replace('https://','')
  .replace(/\/$/,'')