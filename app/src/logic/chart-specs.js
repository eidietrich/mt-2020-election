
const moneyAxisFormat = '$,.0f'
const dateAxisFormat = '%m/%d/%y'


const baseSpec = {
    data: { values: []}, // add in component
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
        x: { field: 'Amount', aggregate: 'sum', type: 'quantitative',
            axis: {format: moneyAxisFormat}
        },
        y: { field: 'Candidate', type: 'nominal', title: '' },
        color: {field: 'type2', type: 'nominal',
            legend: {
                orient: 'top',
                direction: 'vertical',
                title: '',
            }
    
        },
        tooltip: [
            {field: 'Amount', aggregate: 'sum', type: 'quantitative', format: '$,.0f' },
            // {field: 'First Name'},
            // {field: 'Last Name'},
            {field: 'type', type: 'nominal'},
            {field: 'Contribution Type', type: 'nominal'},
        ]
    },
    mark: 'bar',
};

export const cumulativeContributionSpec = {
    ...baseSpec, 
    title: 'Cumulative fundraising',
    height: 200,
    // width set responsively
    transform: [
        {
            sort: [{field: "Date Paid", type: 'temporal'}],
            window: [{"op": "sum", "field": "Amount", "as": "cumulative_amount"}],
            frame: [null, 0]
        },
    ],
    encoding: {
        x: { field: 'Date Paid', type: 'temporal', title:'',
            axis: {format: dateAxisFormat}
         },
        y: { field: 'cumulative_amount', type: 'quantitative', title: 'Total raised',
            axis: {format: moneyAxisFormat}
          },
        tooltip: [
            { field: 'Date Paid', type: 'temporal', title: 'Date'},
            { field: 'cumulative_amount', type: 'quantitative', format: '$,.0f', title: 'Total raised' },
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
            sort: [{field: "Date Paid", type: 'temporal'}],
            window: [{"op": "sum", "field": "Amount", "as": "cumulative_amount"}],
            frame: [null, 0]
        },
    ],
    encoding: {
        x: { field: 'Date Paid', type: 'temporal', title:'',
            axis: {format: dateAxisFormat}
         },
        y: { field: 'cumulative_amount', type: 'quantitative', title: 'Total raised',
            axis: {format: moneyAxisFormat},
            // scale: {domain: [0,600000]}
          },
        tooltip: [
            { field: 'Date Paid', type: 'temporal', title: 'Date'},
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