#!/usr/bin/env python3

from cers_committees import Committee

data = {
    "committeeId": 8350,
    "committeeName": "Doctors for a Healthy Montana ",
    "committeeAddress": "PO Box 9763, Kalispell, MT 59904",
    "committeeTypeDescr": "Independent",
    "incorporated": "N",
    "electionYear": "2000",
    "amendedDate": 1585893600000,
    "entityFullName": "Doctors for a Healthy Montana ",
    "entityCity": "Kalispell",
    "entityState": "MT",
    "isCorporationInd": "N",
    "isFundraiserInd": False,
}

# data = {'committeeId': 7054, 'committeeName': 'Montana Primary Care Association' }
data = {'committeeId': 7987, 'committeeName': 'Montana United'}



committee = Committee(data, checkCache=False)