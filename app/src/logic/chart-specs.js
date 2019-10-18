import counties from '../data/mt-10m-counties.json'
import zips from '../data/mt-zips.json'

const moneyAxisFormat = '$,.0f'
const dateAxisFormat = '%m/%d/%y'



const baseSpec = {
    data: { values: [] }, // add in component
    autosize: {
        type: "fit",
        contains: "padding"
    },
}
export const contributionBreakdownSpec = {
    ...baseSpec,
    title: 'Funding sources',
    height: 150,
    encoding: {
        x: {
            field: 'Amount', aggregate: 'sum', type: 'quantitative',
            axis: { format: moneyAxisFormat }
        },
        y: { field: 'Candidate', type: 'nominal', title: '' },
        color: {
            field: 'type2', type: 'nominal',
            legend: {
                orient: 'top',
                direction: 'vertical',
                title: '',
            }

        },
        tooltip: [
            { field: 'Amount', aggregate: 'sum', type: 'quantitative', format: '$,.0f' },
            // {field: 'First Name'},
            // {field: 'Last Name'},
            { field: 'type', type: 'nominal' },
            { field: 'Contribution Type', type: 'nominal' },
        ]
    },
    mark: 'bar',
};

export const cumulativeContributionSpec = {
    ...baseSpec,
    title: 'Cumulative fundraising',
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
    title: 'Cumulative spending',
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
            // scale: {domain: [0,600000]}
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
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
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
                    title: 'Total donated in zipcode', format: '$,',
                    scale: { range: [0, 1000] },
                    legend: { orient: 'top', format: '$,.0s' },
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