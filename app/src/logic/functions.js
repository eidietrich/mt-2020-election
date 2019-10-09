// centralized utility & data management functions 

import { parties } from './config.js'

export const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')

export const getCandidateParty = candidate => parties.find(d => d.key === candidate.party)

export const cleanDisplayUrl = url => url
  .replace(/www\./, '')
  .replace('http://','')
  .replace('https://','')
  .replace('\/$','')