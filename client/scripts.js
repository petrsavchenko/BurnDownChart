$(function() {

  fetch('/settings')
  .then(res => res.json())
  .then(data => {
    const releasesSelect = $('#releases');
    data.releases.forEach(item => {
      releasesSelect.append(
        $('<option></option>').val(item.Id).html(item.Name)
      );
      if(item.Selected){
        releasesSelect.val(item.Id);
      }
    });
    $('#startDate').val(data.startDate);
    $('#endDate').val(data.endDate);
  });

  //var releaseId = 'bb3a8e0b-c2b0-44e6-ab91-360dab82eb58';

  $('#submit').click(() => {
    const releaseId = $('#releases').val();
    const startDate = $('#startDate').val();
    const endDate = $('#endDate').val();

    fetch(`/defects/${releaseId}?startDate=${startDate}&endDate=${endDate}`)     
    .then(res => res.json())
    .then(data => {
      debugger;
      buildBurndownChart(data.days, data.idealBurn, data.actualBurn);
    });
  });

  let buildBurndownChart = (days, idealBurn, actualBurn) => {
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
        categories: days
      },
      yAxis: {
        title: {
          text: 'Story Points'
        },
        plotLines: [{
          value: 0,
          width: 1
        }]
      },
      tooltip: {
        valueSuffix: ' sp',
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
        data: idealBurn
      }, {
        name: 'Actual Burn',
        color: 'rgba(0,120,200,0.75)',
        marker: {
          radius: 6
        },
        data: actualBurn
      }]
    });
  } 

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