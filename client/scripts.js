$(function() {
  // var ChartTypes = Object.freeze({'Storypoints': 1, 'Time': 2});

  fetch('/settings')
    .then(res => res.json())
    .then(data => {
      const releasesSelect = $('#releases');
      data.releases.forEach(item => {
        releasesSelect.append(
          $('<option></option>').val(item.Id).html(item.Name)
        );
        if (item.Selected) {
          releasesSelect.val(item.Id);
        }
      });
      if (data.startDate) {
        $('#startDate').val(data.startDate.split("T")[0]);
      }
      if (data.endDate) {
        $('#endDate').val(data.endDate.split("T")[0]);
      }
      if (data.chartData){
        buildBurndownChart($("#releases option:selected").text(), data.chartType, 
          data.chartData.days, data.chartData.idealBurnData, data.chartData.actualBurnData);
      }
    });

  $('#submit').click(() => {
    const releaseId = $('#releases').val();
    const chartType = $('#chart-type').val();
    const startDate = $('#startDate').val();
    const endDate = $('#endDate').val();

    fetch(`/defects/${releaseId}?chartType=${chartType}&startDate=${startDate}&endDate=${endDate}`)     
      .then(res => res.json())
      .then(data => {
        buildBurndownChart($("#releases option:selected").text(), data.chartType, data.days, data.idealBurnData, data.actualBurnData);
      });
  });

  const buildBurndownChart = (sprintName, chartType, days, idealBurnData, actualBurnData) => {
    const startDate = new Date($('#startDate').val() || '1/01/2020');
    const endDate = new Date($('#endDate').val() || '1/14/2020');

    $('#burndown').highcharts({
      title: {
        text: sprintName, //$("#releases option:selected").text(),
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
        text: `${startDate.toDateString()} - ${endDate.toDateString()}`,
        x: -20
      },
      xAxis: {
        categories: days
      },
      yAxis: {
        title: {
          text: 'Storypoints' == chartType ? 'Storypoints': 'Remaining Time Estimate'
        },
        plotLines: [{
          value: 0,
          width: 1
        }]
      },
      tooltip: {
        valueSuffix: 'Storypoints' == chartType ? ' sp': ' h',
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
        data: idealBurnData
      }, {
        name: 'Actual Burn',
        color: 'rgba(0,120,200,0.75)',
        marker: {
          radius: 6
        },
        data: actualBurnData
      }]
    });
  }

  const sampleDays = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6',
    'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12'];
  const sampleIdealData = [110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
  const sampleActualData = [100, 110, 125, 95, 64, 76, 62, 44, 35, 29, 18, 2];

  buildBurndownChart('Burndown Chart', 'Storypoints', sampleDays, sampleIdealData, sampleActualData);
});
