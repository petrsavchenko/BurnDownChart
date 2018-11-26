$(function() {

  // fetch('/releases')
  // .then(res => res.json())
  // .then(data => {
  //   //debugger;
  // });

  var releaseId = 'bb3a8e0b-c2b0-44e6-ab91-360dab82eb58';

  fetch(`/defects/${releaseId}`)
  .then(res => res.json())
  .then(data => {
    const estimatedItems = data.ResultSet
      .filter(item => item.Status && item.Status.Value === "Submitted" 
        && parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
      .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));

    const estimatedItemsTotal = estimatedItems
      .reduce((sum, item) => sum + item);


    const average = Math.round(estimatedItemsTotal/14);

    const getIdealBurnData = (average, estimatedItemsTotal) => {
      const idealBurnData = [];
      while(estimatedItemsTotal > average){
        estimatedItemsTotal-=average;
        idealBurnData.push(average);
      }
      if(estimatedItemsTotal > 0) {
        idealBurnData.push(estimatedItemsTotal);
      }
      return idealBurnData;
    }  
    const idealBurnData = getIdealBurnData(average, estimatedItemsTotal);
  });

  $('#burndown').highcharts({
    title: {
      text: 'Burndown Chart',
      x: -20 //center
    },
    colors: ['blue', 'red'],
    plotOptions: {
      line: {
        lineWidth: 3
      },
      tooltip: {
        hideDelay: 200
      }
    },
    subtitle: {
      text: 'Sprint 1',
      x: -20
    },
    xAxis: {
      categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6',
        'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12'
      ]
    },
    yAxis: {
      title: {
        text: 'Hours'
      },
      plotLines: [{
        value: 0,
        width: 1
      }]
    },
    tooltip: {
      valueSuffix: ' hrs',
      crosshairs: true,
      shared: true
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0
    },
    series: [{
      name: 'Ideal Burn',
      color: 'rgba(255,0,0,0.25)',
      lineWidth: 2,
      data: [110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]
    }, {
      name: 'Actual Burn',
      color: 'rgba(0,120,200,0.75)',
      marker: {
        radius: 6
      },
      data: [100, 110, 125, 95, 64, 76, 62, 44, 35, 29, 18, 2]
    }]
  });
});
