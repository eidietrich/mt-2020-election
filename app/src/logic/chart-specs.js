import counties from '../data/mt-10m-counties.json'
import zips from '../data/mt-zips.json'

const moneyAxisFormat = '$,.0f'
const dateAxisFormat = '%m/%d/%y'

const primaryDate = '06/02/2020'
const generalDate = '11/03/2020'

const categoricalColors = ['#e6ab02','#66a61e','#e7298a','#a6761d']
const contributionTypeDomain = ['Self financing', 'Individual donations', 'Committee support', 'Other support']

const partyColors = {
    domain: ['R','D','L'],
    range: ['#D73027','#4575B4', '#E89A0B']
}

const baseSpec = {
    autosize: {
        type: "fit",
        contains: "padding"
    },
}
export const contributionTypesSpec = {
    ...baseSpec,
    data: { values: [] },
    // title: 'Funding sources',
    height: 150,
    config: {
        // padding: {"left": 0, "top": 20, "right": 0, "bottom": 0},
        style: {
            cell: {
                stroke: 'transparent'
            }
        }
    },
    layer: [
        {
            encoding: {
                x: {
                    field: 'amount', type: 'quantitative',
                    scale: { domain: [0, 1000000]},
                    axis: { format: moneyAxisFormat },
                    title: 'Total raised'
                },
                y: {
                    field: 'candidate',
                    type: 'nominal',
                    title: '',
                    sort: 'none' },
                // facet: {field: 'party', type: 'nominal'},
                color: {
                    field: 'type', type: 'nominal',
                    sort: contributionTypeDomain,
                    scale: {range: categoricalColors, domain: contributionTypeDomain},
                    legend: {
                        orient: 'top',
                        direction: 'vertical',
                        title: '',
                    }
        
                },
                tooltip: [
                    { field: 'candidate', type: 'nominal', label: 'Candidate'},
                    { field: 'party', type: 'nominal', label: 'Party'},
                    { field: 'type', type: 'nominal', label: 'Type' },
                    { field: 'amount', type: 'quantitative', format: '$,.0f', label: 'Amount'},
                    
                ]
            },
            mark: 'bar',
        },
        {
            mark: {
                type: 'text',
                align: 'left',
                dx: 4,
            },
            encoding: {
                x: {
                    field: 'amount', type: 'quantitative', aggregate: 'sum', 
                },
                y: {
                    field: 'candidate', type: 'nominal', sort: 'none'
                },
                text: {
                    field: 'amount', type: 'quantitative', aggregate: 'sum', format: '$,.0f'
                }
            }
        }
    ]
    
};

export const cumulativeContributionSpec = {
    ...baseSpec,
    // title: 'Cumulative fundraising',
    height: 200,
    // width set responsively
    // transform: [
    //     {
    //         sort: [{field: "Date Paid", type: 'temporal'}],
    //         window: [{"op": "sum", "field": "Amount", "as": "cumulative_amount"}],
    //         frame: [null, 0]
    //     },
    // ],
    encoding: {
        x: {
            field: 'date', type: 'temporal', title: '',
            axis: { format: dateAxisFormat }
        },
        y: {
            field: 'cumulative', type: 'quantitative', title: 'Total raised',
            axis: { format: moneyAxisFormat }
        },
        tooltip: [
            { field: 'date', type: 'temporal', title: 'Date' },
            { field: 'cumulative', type: 'quantitative', format: '$,.0f', title: 'Total raised' },
        ]
    },
    mark: {
        type: 'area',
        fillOpacity: 0.5,
        line: {
            "color": "darkgreen"
        },
        color: "darkgreen"
    }
}

export const cumulativeExpendituresSpec = {
    ...baseSpec,
    // title: 'Cumulative spending',
    height: 200,
    // width set responsively
    transform: [
        {
            sort: [{ field: "date", type: 'temporal' }],
            window: [{ "op": "sum", "field": "Amount", "as": "cumulative_amount" }],
            frame: [null, 0]
        },
    ],
    encoding: {
        x: {
            field: 'date', type: 'temporal', title: '',
            axis: { format: dateAxisFormat }
        },
        y: {
            field: 'cumulative', type: 'quantitative', title: 'Total raised',
            stack: false,
            axis: { format: moneyAxisFormat },
            // scale: {domain: [0,600000]}
        },
        tooltip: [
            { field: 'date', type: 'temporal', title: 'Date' },
            { field: 'cumulative_amount', type: 'quantitative', format: '$,.0f', title: 'Total raised' },
        ]
    },
    mark: {
        type: 'area',
        fillOpacity: 0.5,
        line: {
            "color": "darkred"
        },
        color: "darkred"
    }
}
export const cumulativeCombinedSpec = {
    ...baseSpec,
    title: 'Cumulative campaign financials',
    height: 200,
    // width set responsively
    encoding: {
        x: {
            field: 'date', type: 'temporal', title: '',
            scale: { domain: ["01/01/2019", "11/31/2020"] },
            axis: { format: dateAxisFormat }
        },
        y: {
            field: 'cumulative', type: 'quantitative', title: 'Total raised',
            stack: false,
            axis: { format: moneyAxisFormat },
            scale: {domain: [0,1000000]}
        },
        color: {
            field: 'type', type: 'nominal', title: '',
            legend: { orient: 'top' }
        },
        tooltip: [
            { field: 'date', type: 'temporal', title: 'Date' },
            { field: 'type', type: 'nominal', title: 'Type' },
            { field: 'cumulative', type: 'quantitative', format: '$,.0f', title: 'Total to date' },
        ]
    },
    mark: {
        type: 'area',
        fillOpacity: 0.5,
        line: {
            "color": "darkred"
        },
        color: "darkred"
    }
}

export const contributionMapSpec = {
    ...baseSpec,
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "config": {
        padding: {"left": 0, "top": 0, "right": 0, "bottom": 0},
        style: {
            cell: {
                stroke: 'transparent'
            }
        }
    },
    "width": 600,
    "height": 400,
    "projection": {
        "type": "mercator"
    },

    // // Alternate option, Montana-optimized
    // "projection": {
    //   "type": "albers",
    //   "rotate": [110,0,0],
    // },
    "layer": [
        {
            "data": {
                "values": counties,
                "format": {
                    "type": "topojson",
                    "feature": "counties"
                }
            },
            "mark": {
                "type": "geoshape",
                "fill": "lightgray",
                "stroke": "white",
                "strokeWidth": 0.5,
            }
        },
        {
            "data": { "values": zips },
            "selection": {
                "highlight": { "type": "single", "empty": "none", "on": "mouseover" },
            },
            "mark": {
                type: "circle",
                fillOpacity: 0.5,
                strokeWidth: 1,
                stroke: "darkgreen",
                color: "darkgreen"
            },
            "encoding": {
                "longitude": {
                    "field": "longitude",
                    "type": "quantitative"
                },
                "latitude": {
                    "field": "latitude",
                    "type": "quantitative"
                },
                // "fillOpacity": {
                //     "condition": { selection: "highlight", "value": 1 },
                //     "value": 0.3
                // },
                "size": {
                    "field": 'amount', 'type': 'quantitative',
                    title: 'Donations', format: '$,',
                    scale: { domain: [0,1000000], range: [0, 1000] },
                    legend: {
                        // direction: 'vertical',
                        // legendX: -75,
                        // legendY: 0,
                        orient: 'top',
                        format: '$,.0s'
                    },
                },
                "tooltip": [
                    { field: "zip_code", type: "nominal", "title": "Zip code" },
                    { field: "city", type: "nominal", title: "Place" },
                    { field: "amount", type: "quantitative", format: '$,.0f', "title": 'Donations' },
                    { field: "number", type: "quantitative", format: ',', "title": 'Number' },
                ]
            }
        }
    ]
}

// export const raceMapSpec = {
//     ...baseSpec,
//     "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
//     "width": 600,
//     "height": 400,
//     "projection": {
//         "type": "mercator"
//     },
//     "layer": [
//         {
//             "data": {
//                 "values": counties,
//                 "format": {
//                     "type": "topojson",
//                     "feature": "counties"
//                 }
//             },
//             "mark": {
//                 "type": "geoshape",
//                 "fill": "lightgray",
//                 "stroke": "white",
//                 "strokeWidth": 0.5,
//             }
//         },
//         {
//             "data": { "values": zips },
//             "selection": {
//                 "highlight": { "type": "single", "empty": "none", "on": "mouseover" },
//             },
//             "mark": {
//                 type: "circle",
//                 fillOpacity: 0.5,
//                 strokeWidth: 1,
//                 stroke: "darkgreen",
//                 color: "darkgreen"
//             },
//             "encoding": {
//                 "longitude": {
//                     "field": "longitude",
//                     "type": "quantitative"
//                 },
//                 "latitude": {
//                     "field": "latitude",
//                     "type": "quantitative"
//                 },
//                 "size": {
//                     "field": 'amount', 'type': 'quantitative',
//                     title: 'Total donated in zipcode', format: '$,',
//                     scale: { domain: [0,1000000], range: [0, 1000] },
//                     legend: { orient: 'top', format: '$,.0s' },
//                 },
//                 "row": { "field": "candidate", "type": "nominal"},
//                 // "tooltip": [
//                 //     { field: "zip_code", type: "nominal", "title": "Zip code" },
//                 //     { field: "city", type: "nominal", title: "Place" },
//                 //     { field: "amount", type: "quantitative", format: '$,.0f', "title": 'Donations' },
//                 //     { field: "number", type: "quantitative", format: ',', "title": 'Number' },
//                 // ]
//             }
//         }
//     ]
// }

/* CONTRIBUTION LINE CHARTS */

const partyColorScale = {
    field: 'party',
    type: 'nominal',
    scale: partyColors,
    // legend: { orient: 'top', title: null}
    legend: null,
}
export const raceCumulativeContributionSpec = {
    ...baseSpec,
    // title: 'Cumulative fundraising',
    data: {values: []},
    height: 200,
    "config": {
        padding: {"left": 0, "top": 0, "right": 0, "bottom": 0},
        style: {
            cell: {
                stroke: 'transparent'
            },
        }
    },
    // width set responsivel
    layer: [
        {
            encoding: {
                x: {
                    field: 'date', type: 'temporal', title: '',
                    scale: { domain: ["01/01/2019", "11/31/2020"] },
                    axis: { format: dateAxisFormat, grid: false  }
                },
                y: {
                    field: 'cumulative', type: 'quantitative', title: 'Total raised',
                    stack: 'none',
                    scale: {domain: [0, 10000]},
                    axis: { format: moneyAxisFormat}
                },
                color: partyColorScale,
                detail: {
                    field: 'candidate', type: 'nominal',
                },
                tooltip: [
                    { field: 'candidate', type: 'nominal', title: 'Candidate' },
                    { field: 'date', type: 'temporal', title: 'Date' },
                    { field: 'cumulative', type: 'quantitative', format: '$,.0f', title: 'Total raised' },
                ]
            },
            mark: {
                type: 'area',
                fillOpacity: 0.2,
                interpolate: 'step-after',
                line: {
                    "color": "black"
                },
            }
        },
        {
            "mark": "rule",
            data: {
                values: [
                    { date: primaryDate },
                    { date: generalDate }
                ]
            },
            "encoding": {
              "x": {
                "field": "date",
                "type": "temporal"
              },
              "size": {"value": 2},
            }
        },
        {
            "mark": {
                type: "text",
                dy: -3,
                dx: -2,
                angle: -90,
                align: 'right',
                baseline: 'bottom',
            },
            data: {
                values: [
                    { date: primaryDate, label: 'Primary (June 6)' },
                    { date: generalDate, label: 'General (Nov. 3)' }
                ]
            },
            "encoding": {
              "x": {
                "field": "date",
                "type": "temporal"
              },
              y: {value: 0},
              text: {
                field: 'label', type: 'nominal'
              },
            }
        },
        {
            "mark": {
                type: "text",
                dx: 5,
                align: 'left',
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                aggregate: "max"
              },
              y: {
                field: 'cumulative',
                aggregate: "max",
                type: 'quantitative',
                stack: 'none',
              },
              color: partyColorScale,
              detail: {
                  field: 'candidate', type: 'nominal'
              },
              text: {
                field: 'candidate', type: 'nominal'
              },
            }
        }
    ]
}
export const raceCumulativeExpenditureSpec = {
    ...baseSpec,
    // title: 'Cumulative fundraising',
    data: {values: []},
    height: 200,
    "config": {
        padding: {"left": 0, "top": 0, "right": 0, "bottom": 0},
        style: {
            cell: {
                stroke: 'transparent'
            },
        }
    },
    // width set responsively
    layer: [
        {
            encoding: {
                x: {
                    field: 'date', type: 'temporal', title: '',
                    scale: { domain: ["01/01/2019", "11/31/2020"] },
                    axis: { format: dateAxisFormat, grid: false  }
                },
                y: {
                    field: 'cumulative', type: 'quantitative', title: 'Total raised',
                    stack: 'none',
                    scale: {domain: [0, 10000]},
                    axis: { format: moneyAxisFormat}
                },
                color: partyColorScale,
                detail: {
                    field: 'candidate', type: 'nominal',
                },
                tooltip: [
                    { field: 'candidate', type: 'nominal', title: 'Candidate' },
                    { field: 'date', type: 'temporal', title: 'Date' },
                    { field: 'cumulative', type: 'quantitative', format: '$,.0f', title: 'Total raised' },
                ]
            },
            mark: {
                type: 'area',
                fillOpacity: 0.2,
                interpolate: 'step-after',
                line: {
                    "color": "black"
                },
            }
        },
        {
            "mark": "rule",
            data: {
                values: [
                    { date: primaryDate },
                    { date: generalDate }
                ]
            },
            "encoding": {
              "x": {
                "field": "date",
                "type": "temporal"
              },
              "size": {"value": 2},
            }
        },
        {
            "mark": {
                type: "text",
                dy: -3,
                dx: -2,
                angle: -90,
                align: 'right',
                baseline: 'bottom',
            },
            data: {
                values: [
                    { date: primaryDate, label: 'Primary (June 6)' },
                    { date: generalDate, label: 'General (Nov. 3)' }
                ]
            },
            "encoding": {
              "x": {
                "field": "date",
                "type": "temporal"
              },
              y: {value: 0},
              text: {
                field: 'label', type: 'nominal'
              },
            }
        },
        {
            "mark": {
                type: "text",
                dx: 5,
                align: 'left',
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                aggregate: "max"
              },
              y: {
                field: 'cumulative',
                aggregate: "max",
                type: 'quantitative',
                stack: 'none',
              },
              color: partyColorScale,
              detail: {
                  field: 'candidate', type: 'nominal'
              },
              text: {
                field: 'candidate', type: 'nominal'
              },
            }
        }
    ]
}