let d3Data = [];
let csv_url = "/src/crime_and_incarceration_by_state_data.csvV2.csv"; //"../resources/crime_and_incarceration_by_state_data.csv"
//"https://raw.githubusercontent.com/NicholasEng22/TrackingCrimeAndPunishment/main/resources/crime_and_incarceration_by_state_data.csvV2.csv

function generateMap() {
    function unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
    }

    let crimeSelect = document.querySelector("#crime-select");
    let yearSelect = document.querySelector("#year-select").value;

    let rowsData = d3Data.filter(function(row) {
      return (yearSelect === "2001-2016" || yearSelect == row['year']) && row['code'] != 'FED';
    });

    let min = rowsData.reduce(function(prev, current) {
      return parseInt(prev[crimeSelect.value]) <= parseInt(current[crimeSelect.value]) ? prev : current;
    });

    let max = rowsData.reduce(function(prev, current) {
      return parseInt(prev[crimeSelect.value]) >= parseInt(current[crimeSelect.value]) ? prev : current;
    });

    min = parseInt(min[crimeSelect.value]);
    max = parseInt(max[crimeSelect.value]);

    var data = [{
        type: 'choropleth',
        locationmode: 'USA-states',
        locations: unpack(d3Data, 'code'),
        z: unpack(d3Data, crimeSelect.value),
        text: unpack(d3Data, 'jurisdiction'),
        zmin: min,
        zmax: max,
        colorscale: [
            [0, 'rgb(242,240,247)'], [0.2, 'rgb(218,218,235)'],
            [0.4, 'rgb(188,189,220)'], [0.6, 'rgb(158,154,200)'],
            [0.8, 'rgb(117,107,177)'], [1, 'rgb(84,39,143)']
        ],
        colorbar: {
            title: crimeSelect.value,
            thickness: 0.2
        },
        marker: {
            line:{
                color: 'rgb(255,255,255)',
                width: 2
            }
        }
    }];


    var layout = {
        title: crimeSelect.value.toUpperCase() + ' from ' + yearSelect,
        geo:{
            scope: 'usa',
            showlakes: true,
            lakecolor: 'rgb(255,255,255)'
        }
    };
    console.log("running");
    Plotly.newPlot("mapDiv", data, layout, {showLink: false});
}

function microCrimePieChart(){
  let yearSelect = document.querySelector("#year-select").value;
  let stateSelect = document.querySelector("#selectedMicroState").value;
  let stateData = d3Data.filter(function(row) {
    return ((yearSelect === "2001-2016" && row['year'] == "2016") || yearSelect == row['year']) && row['code'] == stateSelect;
  });
  var data = [{
    values: [stateData[0].murder_manslaughter,
        stateData[0].rape_legacy,
        stateData[0].robbery,
        stateData[0].agg_assault,
        stateData[0].burglary,
        stateData[0].larceny,
        stateData[0].vehicle_theft
      ],
    // values: [2135, 75, 2533, 5400, 242, 9003, 253, 4793],
    labels: ['Murder/Manslaughter', 'Rape', 'Robbery', 'Aggrevated Assault', 'Burglary', 'Larceny', 'Vehicle Theft'],
    type: 'pie'
  }];

  var layout = {
    title: 'Types of Crime in ' + stateSelect,
    height: 500,
    width: 700
  };

  Plotly.newPlot('microCrimePieChart', data, layout);
}

function macroCrimePieChart(){
  let yearSelect = document.querySelector("#year-select").value;
  let stateData = d3Data.filter(function(row) {
    return ((yearSelect === "2001-2016" && row['year'] == "2016") || yearSelect == row['year']) && row['code'] == 'FED';
  });
  var data = [{
    values: [stateData[0].murder_manslaughter,
        stateData[0].rape_legacy,
        stateData[0].robbery,
        stateData[0].agg_assault,
        stateData[0].burglary,
        stateData[0].larceny,
        stateData[0].vehicle_theft
      ],
    // values: [2135, 75, 2533, 5400, 242, 9003, 253, 4793],
    labels: ['Murder/Manslaughter', 'Rape', 'Robbery', 'Aggrevated Assault', 'Burglary', 'Larceny', 'Vehicle Theft'],
    type: 'pie'
  }];

  var layout = {
    title: 'Types of Crime in the US',
    height: 500,
    width: 700
  };

  Plotly.newPlot('macroCrimePieChart', data, layout);
}

function generateBar(){
let yearSelect = document.querySelector("#year-select").value;
let stateSelect = document.querySelector("#selectedMicroState").value;
let stateData = d3Data.filter(function(row) {
  return ((yearSelect === "2001-2016" && row['year'] == "2016") || yearSelect == row['year']) && row['code'] == stateSelect;
});
let fedData = d3Data.filter(function(row) {
  return ((yearSelect === "2001-2016" && row['year'] == "2016") || yearSelect == row['year']) && row['code'] == 'FED';
});


  var data = [
    {
      x: [stateSelect, 'Federal'],
      y: [(stateData[0].violent_crime_total + stateData[0].property_crime_total),, (fedData[0].violent_crime_total + fedData[0].property_crime_total)],
      type: 'bar'
    }
  ];

  var layout = {
    title: 'Crime in ' + stateSelect + ' vs. the US',
  };

  Plotly.newPlot('bar', data, layout);
}

function generateLineBarMacro(){
  let crimeSelect = document.querySelector("#crime-select").value;
  let crimeData = d3Data.reduce(function(prev, curr) {
    if(prev[curr.code] == null) {
      prev[curr.code] = {
        x: [curr.year],
        y: [curr[crimeSelect]]
      };
    } else {
      prev[curr.code].x.push(curr.year);
      prev[curr.code].y.push(curr[crimeSelect]);
    }
    return prev;
  }, {});

  let plotData = Object.keys(crimeData).map(function(state){
    let stateData = crimeData[state];
    return {
      x: stateData.x,
      y: stateData.y,
      mode: 'lines',
      name: state
    }
  });

  var layout = {
    title: crimeSelect + ' Over Time (2001-2016) in the US',
  };

  Plotly.newPlot('lineBarMacro', plotData, layout);
}

function generateLineBarMicro(){
  let crimeSelect = document.querySelector("#crime-select").value;
  let stateSelect = document.querySelector("#selectedMicroState").value;
  let crimeData = d3Data.reduce(function(prev, curr) {
    if(prev[curr.code] == null) {
      prev[curr.code] = {
        x: [curr.year],
        y: [curr[crimeSelect]]
      };
    } else {
      prev[curr.code].x.push(curr.year);
      prev[curr.code].y.push(curr[crimeSelect]);
    }
    return prev;
  }, {});

  let plotData = Object.keys(crimeData).map(function(state){
    let stateData = crimeData[state];
    return {
      x: stateData.x,
      y: stateData.y,
      mode: 'lines',
      name: state
    }
  });

  plotData = plotData.filter(function(stateData){
    return stateData.name == stateSelect;
  });

  var layout = {
    title: crimeSelect + ' Over Time (2001-2016) in ' + stateSelect,
  };

  Plotly.newPlot('lineBarMicro', plotData, layout);
}

function dataTable(){
    d3.csv(csv_url, function(err, rows){

    function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; });
    }

    var headerNames = d3.keys(rows[0]);

    var headerValues = [];
    var cellValues = [];
    for (i = 0; i < headerNames.length; i++) {
      headerValue = [headerNames[i]];
      headerValues[i] = headerValue;
      cellValue = unpack(rows, headerNames[i]);
      cellValues[i] = cellValue;
    }

    // clean date
    for (i = 0; i < cellValues[1].length; i++) {
    var dateValue = cellValues[1][i].split(' ')[0]
    cellValues[1][i] = dateValue
    }


  var data = [{
    type: 'table',
    columnwidth: [150,600,1000,900,600,500,1000,1000,1000],
    columnorder: [0,1,2,3,4,5,6,7,8,9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    header: {
      values: headerValues,
      align: "center",
      line: {width: 1, color: 'rgb(50, 50, 50)'},
      fill: {color: ['rgb(235, 100, 230)']},
      font: {family: "Arial", size: 8, color: "white"}
    },
    cells: {
      values: cellValues,
      align: ["center", "center"],
      line: {color: "black", width: 1},
      fill: {color: ['rgba(228, 222, 249, 0.65)','rgb(235, 193, 238)', 'rgba(228, 222, 249, 0.65)']},
      font: {family: "Arial", size: 9, color: ["black"]}
    }
  }]

  var layout = {
    title: "Incarceration and Crime Data"
  }

  Plotly.newPlot('table', data, layout);
  });

}

function generateMacroPlots() {
  console.log("marco");

  if(d3Data.length === 0 ) {
    d3.csv(csv_url, function(err, rows){
      // console.log(rows);
      // console.log(csv_url);
      d3Data = rows;
      generateMap();
      // microCrimePieChart();
      macroCrimePieChart();
      //generateBar();
      generateLineBarMacro();
      // generateLineBarMicro();
      dataTable();
    });
  } else {
    generateMap();
    // microCrimePieChart();
    macroCrimePieChart();
    //generateBar();
    generateLineBarMacro();
    // generateLineBarMicro();
    dataTable();
  }
}

function generateMicroPlots() {
  console.log("micro");
  if(d3Data.length === 0 ) {
    d3.csv(csv_url, function(err, rows){
      // console.log(rows);
      // console.log(csv_url);
      d3Data = rows;
      generateMap();
      microCrimePieChart();
      // macroCrimePieChart();
      generateBar();
      // generateLineBarMacro();
      generateLineBarMicro();
      dataTable();
    });
  } else {
    generateMap();
    microCrimePieChart();
    // macroCrimePieChart();
    generateBar();
    // generateLineBarMacro();
    generateLineBarMicro();
    dataTable();
  }
}

// generatePlots();
console.log("Hi there");
