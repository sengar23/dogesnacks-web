
function binance_api() {
  let settings = {
    type: "GET",
    url: "https://api.binance.com/api/v3/klines",
    data: {
      "symbol": "DOGEUSDT",
      "interval": "5m",
      "limit": 287
    }
  };
  $.ajax(settings).done(function (response) {
    chart_update(response);
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error(errorThrown);
  });
}
function plot_api() {
  let settings = {
    type: "GET",
    url: "/bakery/positions"
  };
  $.ajax(settings).done(function (response) {
    window.localStorage.setItem("plot_data", JSON.stringify(response.data));
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error(errorThrown);
  });
}


function chart_render() {
  let chart_height = win_h * 0.9;
  var options_trade = {
    series: [{
      name: "",
      data: []
    }],
    chart: {
      type: 'line',
      height: chart_height,
      zoom: {
        enabled: false
      },
      toolbar: {
        tools: {
          pan: false,
          zoom: false,
          download: false,
        }
      },
      offsetX: 0
    },
    colors: ["#fff"],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 1,
      dashArray: 0
    },
    markers: {
      size: 0,
      hover: {
        size: 4
      }
    },
    grid: {
      show: false
    },
    tooltip: {
      enabled: false,
      marker: {
        show: false,
      },
      style: {
        fontSize: '14px',
        fontFamily: 'VT323',
      }
    },
    subtitle: {
      text: '',
      align: 'left'
    },
    labels: [],
    xaxis: {
      type: 'datetime',
      title: {
        text: "",
        offsetY: 0
      },
      labels: {
        style: {
          colors: "#FFFFFF",
          fontSize: '15px',
          fontFamily: 'VT323',
          fontWeight: 400,
        },
        datetimeUTC: false,
      },
    },
    legend: {
      horizontalAlign: 'left'
    },
  };
  window["chart_price"] = new ApexCharts(document.querySelector("#chart-price"), options_trade);
  window["chart_price"].render();
}


function chart_update(data) {
  let trade_series = [];
  let trade_lables_half = [];
  let plot_data = JSON.parse(window.localStorage.getItem("plot_data"));
  if (!plot_data) {
    plot_data = [];
  }
  plot_data = [];

  /*
  Binnace api candlestick chart response data help
  [
  [
    1499040000000,      // Open time
    "0.01634790",       // Open
    "0.80000000",       // High
    "0.01575800",       // Low
    "0.01577100",       // Close
    "148976.11427815",  // Volume
    1499644799999,      // Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base asset volume
    "28.46694368",      // Taker buy quote asset volume
    "17928899.62484339" // Ignore.
  ]
]
*/
  for (let i = 0; i < data.length; i++) {
    trade_lables_half.push(moment(data[i][6]).local().format('DD MMM YYYY, HH:mm'));
    trade_series.push(parseFloat(data[i][4]).toFixed(4));
  }

  let future_time = [trade_lables_half[trade_lables_half.length - 1]];
  for (let i = 1; i < trade_lables_half.length; i++) {
    let t = moment(future_time[future_time.length - 1]).local().add(5, 'minutes').format('DD MMM YYYY, HH:mm');
    future_time.push(t);
  }

  let trade_lables = trade_lables_half.concat(future_time);



  //Code to find center point on Y axis so Dogeship will always be in center vertically
  let max_price = trade_series.reduce(function (a, b) {
    return Math.max(a, b);
  });
  max_price = parseFloat(max_price);
  let min_price = trade_series.reduce(function (a, b) {
    return Math.min(a, b);
  });
  min_price = parseFloat(min_price);
  let current_price = trade_series[trade_series.length - 1];

  let max_price_y = max_price;
  let min_price_y = min_price;

  let min_diff = (current_price - min_price).toFixed(4);

  let max_diff = (max_price - current_price).toFixed(4);

  let min_max_diff = parseFloat((max_price - min_price).toFixed(4));






  //adding some buffer to min and max value with min-max price difference and taking random part of the number, i.e 5

  min_price_y = min_price - (min_max_diff / 5);
  max_price_y = max_price + (min_max_diff / 5);

  //Generate Random Snacks Plot data

  let plot_min = min_price;
  let plot_max = max_price;
  if (plot_data.length != 0) {
    //To find min and max snacks plot price from plot array
    let plot_min_obj = plot_data.reduce(function (prev, curr) {
      return prev.price < curr.price ? prev : curr;
    });
    plot_min = plot_min_obj.price;

    let plot_max_obj = plot_data.reduce(function (prev, curr) {
      return prev.price > curr.price ? prev : curr;
    });
    plot_max = plot_max_obj.price;
  }

  //adding some buffer to min and max value with min-max price difference and taking random part of the number, i.e 5
  if (min_price > plot_min) {
    min_price_y = plot_min - (min_max_diff / 6);

  }
  else {
    min_price_y = min_price - (min_max_diff / 5);
  }

  if (max_price < plot_max) {
    max_price_y = plot_max + (min_max_diff / 6);
  }
  else {
    max_price_y = max_price + (min_max_diff / 5);
  }

  

  let plots = [
    {
      x: new Date(trade_lables[(trade_lables.length) / 2 - 1]).getTime(),
      y: trade_series[trade_series.length - 1],
      marker: {
        size: 1,
        fillColor: "#fff",
        strokeColor: "#fff",
        radius: 1
      },
      label: {

      },
      image: {
        path: "img/doge-rocket.gif",
        width: 150,
        height: 150,
        offsetX: 0,
        offsetY: 0,
      }
    }
  ];

  for (let i = 0; i < plot_data.length; i++) {
    let plot_obj = {
      x: new Date(plot_data[i].time).getTime(),
      y: plot_data[i].price,
      marker: {
        size: 1,
        fillColor: "#fff",
        strokeColor: "#fff",
        radius: 1
      },
      label: {

      },
      image: {
        path: "img/snacks/" + plot_data[i].snack_type + ".png",
        width: 40,
        height: 40,
        offsetX: 10,
        offsetY: 15,
      }
    };
    plots.push(plot_obj);

  }


  chart_price.updateOptions({
    series: [{
      data: trade_series
    }],
    labels: trade_lables,

    yaxis: {
      forceNiceScale: true,
      min: parseFloat(min_price_y.toFixed(4)),
      max: parseFloat(max_price_y.toFixed(4)),
      tickAmount: 10,
      title: {
        text: "",
        offsetX: 0
      },
      labels: {
        style: {
          colors: "#FFFFFF",
          fontSize: '15px',
          fontFamily: 'VT323',
          fontWeight: 400,
        },
      },
    },
    annotations: {

      points: plots
    },
  });
}
function get_random_from_array(arr, quantity) {
  let result = new Array(quantity),
    len = arr.length,
    taken = new Array(len);
  if (quantity > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (quantity--) {
    let random_item_index = Math.floor(Math.random() * len);
    result[quantity] = arr[random_item_index in taken ? taken[random_item_index] : random_item_index];
    taken[random_item_index] = --len in taken ? taken[len] : len;
  }
  return result;
}


$(function () {
  //plot_api();
  chart_render();
  binance_api();
  const api_interval = setInterval(function () {
    binance_api();
  }, 3000);
  //clearInterval(api_interval);

});

