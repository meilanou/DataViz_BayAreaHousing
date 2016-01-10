"use strict";

// globle variables
var Perspectives = [
  {id: 'zhvi', type: 'line', 
    label: 'Zillow Home Value Index (ZHVI) - Median Home Value ($)', 
    map_label: 'ZHVI', format: '$s', file: 'zhvi.csv'},
  {id: 'zhvi1p5m', type: 'line',
    label: 'Zillow Home Value Index (ZHVI) - Median Home Value $1.5 Millions Cap ($)', 
    map_label: 'ZHVI', format: '$s', file: 'zhvi.csv'},
  {id: 'zhvi_summary', type: 'bar',
    label: 'Zillow Home Value Index (ZHVI) - Summary',
    map_label: 'ZHVI', format: '$s', file: 'zhvi_summary.csv'},
  {id: 'zhvi1p5m_summary', type: 'bar',
    label: 'Zillow Home Value Index (ZHVI) - Summary of Median $1.5 Millions Cap',
    map_label: 'ZHVI', format: '$s', file: 'zhvi_summary.csv'},
  {id: 'buy_sell', type: 'bar',
    label: 'Buyer/Seller Index - 0 Representing Best Seller\'s and 10 Buyer\'s Markets (Scale 0-10)', 
    map_label: 'Buyer/Seller Index', format: '.2f', file: 'buyer_seller.csv'},
  {id: 'health', type: 'bar',
    label: 'Market Health Index - 0 Representing Least Healthy and 10 Healthiest Markets (Scale 0-10)', 
    map_label: 'Market Health Index', format: '.2f', file: 'health.csv'},
  {id: 'zri', type: 'line',
    label: 'Zillow Rent Index (ZRI) - Median Home Rent ($)', 
    map_label: 'ZRI', format: '$s', file: 'zri.csv'},
  {id: 'zri4k', type: 'line',
    label: 'Zillow Rent Index (ZRI) - Median Home Rent $4,000 Cap ($)', 
    map_label: 'ZRI', format: '$s', file: 'zri.csv'},
  {id: 'zri_summary', type: 'bar',
    label: 'Zillow Rent Index (ZRI) - Summary',
    map_label: 'ZRI', format: '$s', file: 'zri_summary.csv'},
  {id: 'zri4k_summary', type: 'bar',
    label: 'Zillow Rent Index (ZRI) - Summary of Median $4,000 Cap',
    map_label: 'ZRI', format: '$s', file: 'zri_summary.csv'},
  {id: 'price_rent', type: 'line',
    label: 'Median of Price-to-Rent Ratios (Raw Ratio)', 
    map_label: 'Price-to-Rent', format: '.2f', file: 'price_to_rent.csv'},
  {id: 'inc_dec', type: 'line',
    label: 'Percentage of Homes Increasing vs. Decreasing Values (%)', 
    map_label: 'Increasing Values', format: '%', file: 'increase_decrease.csv'},
  {id: 'turnover', type: 'line',
    label: 'Percentage of Homes Sold in the Past 12 Months (%)', 
    map_label: 'Turnover', format: '%', file: 'turnover.csv'},
  {id: 'turnover99', type: 'line',
    label: 'Percentage of Homes Sold in the Past 12 Months (%), 99% Percentile', 
    map_label: 'Turnover', format: '%', file: 'turnover.csv'},
  {id: 'foreclosed', type: 'line',
    label: 'Homes Foreclosed: Number of Foreclosed per 10,000 Homes', 
    map_label: 'Foreclosed per 10k', format: ',.1f', file: 'foreclosed.csv'},
  {id: 'foreclosed99', type: 'line',
    label: 'Homes Foreclosed: Number of Foreclosed per 10,000 Homes, 99% Percentile', 
    map_label: 'Foreclosed per 10k', format: ',.1f', file: 'foreclosed.csv'},
  {id: 'resales', type: 'line',
    label: 'Foreclosure Re-Sales - Percentage of Home Sales Foreclosed Upon Within the Previous Year (%)', 
    map_label: 'Foreclosure Re-Sales', format: '%', file: 'resales.csv'}
  ];
// get chart description by selected perspective
function get_pers_description(pers) {
  var description = '';

  switch (pers) {
    case 'zhvi':
    case 'zhvi_summary':
    description = 'The map is overlaid with the most recent monthly <b>ZHVI</b>. ';
    break;
    case 'zhvi1p5m':
    case 'zhvi1p5m_summary':
    description = 'The map contains the most recent monthly <b>ZHVI</b> up to $1.5 Millions. ';
    break;
    case 'zri':
    case 'zri_summary':
    description = 'The map is overlaid with the most recent monthly <b>ZRI</b>. ';
    break;
    case 'zri4k':
    case 'zri4k_summary':
    description = 'The map contains the most recent monthly <b>ZRI</b> up to $4,000. ';
    break;
    case 'buy_sell':
    description = 'On the map is the most recent monthly <b>Buyer/Seller Index</b>. '+
    '<b>Buyer/Seller Index:</b> This index combines the sale-to-list price ratio, the percent of homes that subject to '+
    'a price cut and the time properties spend on the market (measured as Days on Zillow). '+
    'Higher numbers (relative scale 0-10) indicate a better buyers’ market, lower numbers indicate a better sellers’ market.';
    break;
    case 'health':
    description = 'The map is showing the most recent monthly <b>Market Health Index</b>. '+
    '<b>Market Health Index:</b> This index indicates the current health of a housing market '+
    'relative to other markets nationwide. It is determined by several indicators including: '+
    'sell for gain percentage, previously foreclosed percentage, foreclosure ratio of all sales, '+
    'ZHVI, MoM, YoY, forecast YoY, stock of REOs, negative equity ratio, delinquency ratio and days on market. '+
    'A result scale from 0 to 10, with higher number representing the healthier markets.';
    break;
    case 'price_rent':
    description = 'The map is displaying the most recent monthly <b>Price-to-Rent Ratio</b>. '+
    '<b>Price-to-Rent Ratio:</b> This ratio is first calculated at the '+
    'individual home level, where the estimated home value is divided '+
    'by 12 times its estimated monthly rent price. The median of all '+
    'home-level price-to-rent ratios for a given region is then calculated.';
    break;
    case 'inc_dec':
    description = 'On the map is an overlay of the most recent monthly <b>Increasing Values (%)</b>. '+
    '<b>Increasing Values (%):</b> The percentage of homes with values that have increased in the past year. '+
    '<b>Decreasing Values (%):</b> The percentage of homes with values that have decreased in the past year.';
    break;
    case 'turnover':
    case 'turnover99':
    description = '<b>Sold in Past Year (Turnover) (%):</b> The percentage of all homes in a given area that sold in the past 12 months.'
    break;
    case 'foreclosed':
    case 'foreclosed99':
    description = '<b>Homes Foreclosed:</b> The number of homes (per 10,000 homes) that were foreclosed upon in a given month. '+
    'A foreclosure occurs when a homeowner loses their home to their lending institution or it is sold to a third party at an auction.';
    break;
    case 'resales':
    description = 'The map is showing most recent monthly <b>Foreclosure Re-Sales (%).</b> '+
    '<b>Foreclosure Re-Sales (%):</b> The percentage of home sales in a given month in which the '+
    'home was foreclosed upon within the previous year (e.g. sales of bank-owned homes after the bank '+
      'took possession of a home following a foreclosure).';
    break;
  }

  switch (pers) {
    case 'zhvi':
    case 'zhvi1p5m':
    description += '<b>Zillow Home Value Index (ZHVI)</b> is a time series '+
    'tracking the monthly median home value. This is a way of approximating '+
    'ideal home price index by leveraging the valuations Zillow creates on all homes '+
    '(Zestimates) instead of using actual sale prices on every home.';
    break;
    case 'zhvi_summary':
    case 'zhvi1p5m_summary':
    description += 'Besides <b>Zillow Home Value Index (ZHVI)</b>, the trend '+
    'since peak-crisis are demostrated by <b>Fall From Peak</b> for overall recovery, '+
    '<b>YoY</b> for recent change and <b>10-Year</b> forcast.';
    break;
    case 'zri':
    case 'zri4k':
    description += '<b>Zillow Rent Index (ZRI)</b> is created to track the monthly median rent in particular geographical regions. '+
    'Like the ZHVI, Zillow sought to create an index for rents that is unaffected by the mix of homes for rent at any particular time.';
    break;
    case 'zri_summary':
    case 'zri4k_summary':
    description += 'Besides <b>Zillow Rent Index (ZRI)</b>, the recent market trend '+
    'are demostrated by <b>MoM</b>, <b>QoQ</b> and <b>YoY</b> changes.';
    break;
    case 'turnover':
    description = 'On the map the most recnt monthly <b>Turnover (%)</b> is shown. '+description;
    break;
    case 'turnover99':
    description = 'On the map the most recnt monthly <b>Turnover (%)</b> '+
    'with ratio up to 99% percentile of all time is shown. '+description;
    break
    case 'foreclosed':
    description = 'The map is showing the most recent monthly <b>Homes Foreclosed</b>. '+description;
    break;
    case 'foreclosed99':
    description = 'The map is showing the most recent monthly <b>Homes Foreclosed</b> '+
    'with ratio up to 99% percentile of all time. '+description;
    break;
  }

  return description;
}
/* below are functions to process csv data for each perspective */
function get_zhvi_summary(csv_data, cap_max) {
  var data_array = new Array();    
  var categories = [
    {category: 'Zhvi', title: 'ZHVI', scale: 500000, format: '$s', color: '#FFA342', color_range: ['#FFFFFF', '#EB7900']},
    {category: 'PctFallFromPeak', title: 'Fall From Peak', scale: 0.01, format: '%', color: '#007DEB'},
    {category: 'YoY', title: 'Year Over Year', scale: 0.01, format: '%', color: '#EBD000'},
    {category: 'X10Year', title: '10-Year', scale: 0.01, format: '%', color: '#EBD000'}
    ];

  // extract sub data set if cap is applied
  if (cap_max) {
    var regions = csv_data.filter(function(d) { 
      return +d['Zhvi'] <= cap_max;
    }).map(function(d) {
      return d['RegionName'];
    });
    csv_data = csv_data.filter(function(d) {
      return regions.indexOf(d['RegionName']) >= 0;
    });
  }

  var i = 0;
  categories.forEach(function(c) {
    var category = c['category'];
    var scale_unit = c['scale'];
    var extent = d3.extent(csv_data.map(function(d) { return +d[category]; }));
    extent = get_nice_extent(extent, scale_unit, true);

    // color range only for first category
    var colors;
    if (i === 0) {
      var color_range = c['color_range'];
      colors = range_colors(extent, scale_unit, color_range);
    }

    var cat_data = csv_data.map(function(d) {
      return {
        region: d['RegionName'],
        datum: d[category]
      }
    });

    data_array.push({
      category: category,
      title: c['title'],
      extent: extent,
      colors: colors,
      mid_color: c['color'],
      format: c['format'],
      data: cat_data
    });

    i++;
  });

  return data_array;
}
function get_zri_summary(csv_data, cap_max) {
  var data_array = new Array();    
  var categories = [
    {category: 'Zri', title: 'ZRI', scale: 500, format: '$s', color: '#ED39BD', 
      color_range: ['#FFFFFF', '#DE00A3']},
    {category: 'MoM', title: 'Month Over Month', scale: 0.01, format: '%', color: '#F182F5'},
    {category: 'QoQ', title: 'Quarter Over Quarter', scale: 0.01, format: '%', color: '#F182F5'},
    {category: 'YoY', title: 'Year Over Year', scale: 0.01, format: '%', color: '#F182F5'}
    ];

  // extract sub data set if cap is applied
  if (cap_max) {
    var regions = csv_data.filter(function(d) { 
      return +d['Zri'] <= cap_max;
    }).map(function(d) {
      return d['RegionName'];
    });
    csv_data = csv_data.filter(function(d) {
      return regions.indexOf(d['RegionName']) >= 0;
    });
  }

  var i = 0;
  categories.forEach(function(c) {
    var category = c['category'];
    var scale_unit = c['scale'];
    var extent = d3.extent(csv_data.map(function(d) { return +d[category]; }));
    extent = get_nice_extent(extent, scale_unit, true);

    // color range only for first category
    var colors;
    if (i === 0) {
      var color_range = c['color_range'];
      colors = range_colors(extent, scale_unit, color_range);
    }

    var cat_data = csv_data.map(function(d) {
      return {
        region: d['RegionName'],
        datum: d[category]
      }
    });

    data_array.push({
      category: category,
      title: c['title'],
      extent: extent,
      colors: colors,
      mid_color: c['color'],
      format: c['format'],
      data: cat_data
    });

    i++;
  });

  return data_array;
}
function get_buyer_seller(csv_data) {
  var data_array = new Array();    
  var categories = [
    {category: 'BuyerSellerIndex', title: 'Buyer/Seller Index', scale: 0.01, 
      format: '.2f', color: '#D9A950', color_range: ['#ED6C26', '#3CBA44']},
    {category: 'SaleToListPrice', title: 'Sale to List Price', scale: 0.01, 
      format: '%', color: '#F79B4A'},
    {category: 'PctPriceCut', title: 'Percent Price Cut', scale: 0.01, 
      format: '%', color: '#95F74A'},
    {category: 'DaysOnMarket', title: 'Days On Market', scale: 10, 
      format: '.1f', color: '#F5F107'}
    ];

  var i = 0;
  categories.forEach(function(c) {
    var category = c['category'];
    var scale_unit = c['scale'];
    var extent;
    if (category === 'BuyerSellerIndex') {
      // BuyerSellerIndex known ranging from 0 to 10
      extent = [0.0, 10.0];
    } else {
      extent = d3.extent(csv_data.map(function(d) { return +d[category]; }));
      extent = get_nice_extent(extent, scale_unit, true);
    }

    // color range only for first category
    var colors;
    if (i === 0) {
      var color_range = c['color_range'];
      colors = range_colors(extent, scale_unit, color_range);
    }

    var cat_data = csv_data.map(function(d) {
      return {
        region: d['RegionName'],
        datum: d[category]
      }
    });

    data_array.push({
      category: category,
      title: c['title'],
      extent: extent,
      colors: colors,
      mid_color: c['color'],
      format: c['format'],
      data: cat_data
    });

    i++;
  });

  return data_array;
}
function get_market_health(csv_data) {
  var data_array = new Array();    
  var categories = [
    {category: 'MarketHealthIndex', title: 'Market Health Index', scale: 0.01, 
      format: '.2f', color: '#63C96B', color_range: ['#FFFFFF', '#32B83D']},
    {category: 'ForecastYoYPctChange', title: 'Forecast YoY', scale: 0.01, 
      format: '%', color: '#FFA229'},
    {category: 'SellForGain', title: 'Sell For Gain', scale: 0.01, 
      format: '%', color: '#FFD429'},
    {category: 'NegativeEquity', title: 'Negative Equity', scale: 0.01, 
      format: '%', color: '#24C1ED'}
    ];

  var i = 0;
  categories.forEach(function(c) {
    var category = c['category'];
    var scale_unit = c['scale'];
    var extent;
    if (category === 'MarketHealthIndex') {
      // MarketHealthIndex known ranging from 0 to 10
      extent = [0.0, 10.0];
    } else {
      extent = d3.extent(csv_data.map(function(d) { return +d[category]; }));
      extent = get_nice_extent(extent, scale_unit, true);
    }

    // color range only for first category
    var colors;
    if (i === 0) {
      var color_range = c['color_range'];
      colors = range_colors(extent, scale_unit, color_range);
    }

    var cat_data = csv_data.map(function(d) {
      return {
        region: d['RegionName'],
        datum: d[category]
      }
    });

    data_array.push({
      category: category,
      title: c['title'],
      extent: extent,
      colors: colors,
      mid_color: c['color'],
      format: c['format'],
      data: cat_data
    });

    i++;
  });

  return data_array;
}
function get_zhvi(csv_data, cap_max) {
  var nested_array = new Array();
  var category = null;

    // aggregation function to nest raw data by area
  function agg_areas(leaves) {
    var period_data = leaves.map(function(d){
      return {
        'period': d['period_date'],
        'datum': +d[category]
      };
    });

    period_data.sort(function(a, b) { return a.period - b.period; });

    // specific structure used by interquartile charting function
    return {
      'period_data': period_data,
      'latest_datum': (period_data.length === 0 ? undefined : 
        period_data[period_data.length - 1]['datum'])
    };
  }

  var categories = [
    {category: 'AllHomes', title: 'All Homes', color_range: ['#FFFFFF', '#EB7900']},
    {category: 'X3To4Bed', title: '3-4 Bedrooms Homes', color_range: ['#FFFFFF', '#EBE700']}
    ];

  var latest_period_date = d3.max(csv_data, function(d) { return d['period_date']; });
  var scale_unit = 500000;
  if (cap_max) {
    var regions = csv_data.filter(function(d) { 
      return d['Year'] === latest_period_date.getFullYear() &&
        d['Month'] === latest_period_date.getMonth() &&
        (isNaN(d['AllHomes'] ) || +d['AllHomes'] <= cap_max) &&
        (isNaN(d['X3To4Bed']) || +d['X3To4Bed'] <= cap_max);
    }).map(function(d) {
      return d['RegionName'];
    });
    csv_data = csv_data.filter(function(d) {
      return regions.indexOf(d['RegionName']) >= 0;
    });
  }
  // use consistent extent for all categories
  var full_extent = d3.extent(csv_data.map(function(d) { return +d['AllHomes']; }));
  full_extent = get_nice_extent(full_extent, scale_unit, true);

  categories.forEach(function(c) {
    category = c['category'];
    var color_range = c['color_range'];
    var colors = range_colors(full_extent, scale_unit, color_range);
    var nested = d3.nest()
      .key(function(d) { return d['RegionName']; })
      .rollup(agg_areas)
      .entries(csv_data);

    nested_array.push({
      category: category,
      title: c['title'],
      latest_period_date: latest_period_date,
      extent: full_extent,
      colors: colors,
      mid_color: colors.color_func((full_extent[0]+full_extent[1])/1.2),
      nested: nested
    });
  });

  return nested_array;
}
function get_zri(csv_data, cap_max) {
  var nested_array = new Array();
  var category = null;

    // aggregation function to nest raw data by area
  function agg_areas(leaves) {
    var period_data = leaves.map(function(d){
      return {
        'period': d['period_date'],
        'datum': +d[category]
      };
    });

    period_data.sort(function(a, b) { return a.period - b.period; });

    // specific structure used by interquartile charting function
    return {
      'period_data': period_data,
      'latest_datum': (period_data.length === 0 ? undefined : 
        period_data[period_data.length - 1]['datum'])
    };
  }

  var categories = [
    {category: 'AllHomes', title: 'All Homes', scale_unit: 500, color_range: ['#FFFFFF', '#E60095']},
    {category: 'PerSqft', title: 'Price per Square Feet', scale_unit: 0.5, color_range: ['#FFFFFF', '#DE00E6']}
    ];

  var latest_period_date = d3.max(csv_data, function(d) { return d['period_date']; });
  if (cap_max) {
    var regions = csv_data.filter(function(d) { 
      return d['Year'] === latest_period_date.getFullYear() &&
        d['Month'] === latest_period_date.getMonth() &&
        +d['AllHomes'] <= cap_max;
    }).map(function(d) {
      return d['RegionName'];
    });
    csv_data = csv_data.filter(function(d) {
      return regions.indexOf(d['RegionName']) >= 0;
    });
  }

  categories.forEach(function(c) {
    category = c['category'];
    var scale_unit = c['scale_unit'];
    // diff extent for each category
    var full_extent = d3.extent(csv_data, function(d) { return +d[category]; });
    full_extent = get_nice_extent(full_extent, scale_unit, true);

    var color_range = c['color_range'];
    var colors = range_colors(full_extent, scale_unit, color_range);

    var nested = d3.nest()
      .key(function(d) { return d['RegionName']; })
      .rollup(agg_areas)
      .entries(csv_data);

    nested_array.push({
      category: category,
      title: c['title'],
      latest_period_date: d3.max(csv_data, function(d) { return d['period_date']; }),
      extent: full_extent,
      colors: colors,
      mid_color: colors.color_func((full_extent[0]+full_extent[1])/1.2),
      nested: nested
    });
  });

  return nested_array;
}
function get_turnover(csv_data, percentile) {
  // extract data to percentile if required
  if (percentile && percentile > 0) {
    var all_values = csv_data
      .map(function(d) { return d['Portion']; })
      .sort(function(a, b) { return a-b; });
    var upper_limit = d3.quantile(all_values, percentile);
    // filter out regions that ever had Per10k greater then percentile
    var bad_regions = csv_data
      .filter(function(d) { return d['Portion'] > upper_limit; })
      .map(function(d) { return d['RegionName']; });
    bad_regions = d3.set(bad_regions).values();
    csv_data = csv_data
      .filter(function(d) { return bad_regions.indexOf(d['RegionName']) < 0; });
  }
  
  // setup color mapping
  var full_extent = d3.extent(csv_data, function(d) { return +d['Portion']; });
  full_extent = get_nice_extent(full_extent, 0.02, true);
  var color_range = ['#FFFFFF', '#EB0000'];
  var colors = range_colors(full_extent, 0.02, color_range);

  // aggregation function to nest raw data by area
  function agg_areas(leaves) {
    var period_data = leaves.map(function(d){
      return {
        'period': d['period_date'],
        'datum': +d['Portion']
      };
    });

    period_data.sort(function(a, b) { return a.period - b.period; });

    // specific structure used by interquartile charting function
    return {
      'period_data': period_data,
      'latest_datum': period_data[period_data.length - 1]['datum']
    };
  }

  // nest data by area
  var nested = d3.nest()
  .key(function(d) {
      return d['RegionName'];
    })
  .rollup(agg_areas)
  .entries(csv_data);

  return [{
    title: 'Turnover',
    latest_period_date: d3.max(csv_data, function(d) { return d['period_date']; }),
    extent: full_extent,
    colors: colors,
    mid_color: colors.color_func((full_extent[0]+full_extent[1])/2),
    nested: nested
  }];
}
function get_foreclosed(csv_data, percentile) {
  // extract data to percentile if required
  if (percentile && percentile > 0) {
    var all_values = csv_data
      .map(function(d) { return d['Per10k']; })
      .sort(function(a, b) { return a-b; });
    var upper_limit = d3.quantile(all_values, percentile);
    // filter out regions that ever had Per10k greater then percentile
    var bad_regions = csv_data
      .filter(function(d) { return d['Per10k'] > upper_limit; })
      .map(function(d) { return d['RegionName']; });
    bad_regions = d3.set(bad_regions).values();
    csv_data = csv_data
      .filter(function(d) { return bad_regions.indexOf(d['RegionName']) < 0; });
  }

  // setup color mapping
  var full_extent = d3.extent(csv_data, function(d) { return +d['Per10k']; });
  full_extent = get_nice_extent(full_extent, 1, true);
  var color_range = ['#FFFFFF', '#0000EB'];
  var colors = range_colors(full_extent, 1, color_range);

  // aggregation function to nest raw data by area
  function agg_areas(leaves) {
    var period_data = leaves.map(function(d){
      return {
        'period': d['period_date'],
        'datum': +d['Per10k']
      };
    });

    period_data.sort(function(a, b) { return a.period - b.period; });

    // specific structure used by interquartile charting function
    return {
      'period_data': period_data,
      'latest_datum': period_data[period_data.length - 1]['datum']
    };
  }

  // nest data by area
  var nested = d3.nest()
  .key(function(d) {
      return d['RegionName'];
    })
  .rollup(agg_areas)
  .entries(csv_data);

  return [{
    title: 'Foreclosed Out of 10k Homes',
    latest_period_date: d3.max(csv_data, function(d) { return d['period_date']; }),
    extent: full_extent,
    colors: colors,
    mid_color: colors.color_func((full_extent[0]+full_extent[1])/2),
    nested: nested
  }];
}
function get_resales(csv_data) {
  // setup color mapping
  var full_extent = d3.extent(csv_data, function(d) { return +d['Portion']; });
  full_extent = get_nice_extent(full_extent, 0.02, true);
  var color_range = ['#FFFFFF', '#00DFEB'];
  var colors = range_colors(full_extent, 0.02, color_range);

  // aggregation function to nest raw data by area
  function agg_areas(leaves) {
    var period_data = leaves.map(function(d){
      return {
        'period': d['period_date'],
        'datum': +d['Portion']
      };
    });

    period_data.sort(function(a, b) { return a.period - b.period; });

    // specific structure used by interquartile charting function
    return {
      'period_data': period_data,
      'latest_datum': period_data[period_data.length - 1]['datum']
    };
  }

  // nest data by area
  var nested = d3.nest()
  .key(function(d) {
      return d['RegionName'];
    })
  .rollup(agg_areas)
  .entries(csv_data);

  return [{
    title: 'Foreclosure Ratio',
    latest_period_date: d3.max(csv_data, function(d) { return d['period_date']; }),
    extent: full_extent,
    colors: colors,
    mid_color: colors.color_func((full_extent[0]+full_extent[1])/1.2),
    nested: nested
  }];
}
function get_price_to_rent(csv_data) {
  // setup color mapping
  var full_extent = d3.extent(csv_data, function(d) { return +d['Ratio']; });
  full_extent = get_nice_extent(full_extent, 5, true);
  var color_range = ['#CAC2D1', '#6700CF'];
  var colors = range_colors(full_extent, 5, color_range);

  // aggregation function to nest raw data by area
  function agg_areas(leaves) {
    var period_data = leaves.map(function(d){
      return {
        'period': d['period_date'],
        'datum': +d['Ratio']
      };
    });

    period_data.sort(function(a, b) { return a.period - b.period; });

    // specific structure used by interquartile charting function
    return {
      'period_data': period_data,
      'latest_datum': period_data[period_data.length - 1]['datum']
    };
  }

  // nest data by area
  var nested = d3.nest()
  .key(function(d) {
      return d['RegionName'];
    })
  .rollup(agg_areas)
  .entries(csv_data);

  return [{
    title: 'Price-to-Rent Ratio',
    latest_period_date: d3.max(csv_data, function(d) { return d['period_date']; }),
  	extent: full_extent,
  	colors: colors,
    mid_color: colors.color_func((full_extent[0]+full_extent[1])/2),
  	nested: nested
  }];
}
function get_increasing_decreasing(csv_data) {
  var nested_array = new Array();
  var category = null;

    // aggregation function to nest raw data by area
  function agg_areas(leaves) {
    var period_data = leaves.map(function(d){
      return {
        'period': d['period_date'],
        'datum': +d[category]
      };
    });

    period_data.sort(function(a, b) { return a.period - b.period; });

    // specific structure used by interquartile charting function
    return {
      'period_data': period_data,
      'latest_datum': (period_data.length === 0 ? undefined : 
        period_data[period_data.length - 1]['datum'])
    };
  }

  var categories = [
    //{category: 'Diff', title: 'Increase-Decrease Diff', color_range: ['#3B74ED', '#EDED3B']},
    {category: 'Increase', title: 'Increasing Values (%)', color_range: ['#0097FC', '#F0E800']},
    {category: 'Decrease', title: 'Decreasing Values (%)', color_range: ['#F0E800', '#0097FC']}
    ];

  categories.forEach(function(c) {
    category = c['category'];
    var full_extent = d3.extent(csv_data, function(d) { return +d[category]; });
    full_extent = get_nice_extent(full_extent, 0.01, true);
    var color_range = c['color_range'];
    var colors = range_colors(full_extent, 0.01, color_range);
    var nested = d3.nest()
      .key(function(d) { return d['RegionName']; })
      .rollup(agg_areas)
      .entries(csv_data);

    nested_array.push({
      category: category,
      title: c['title'],
      latest_period_date: d3.max(csv_data, function(d) { return d['period_date']; }),
      extent: full_extent,
      colors: colors,
      mid_color: colors.color_func((full_extent[0]+full_extent[1])/1.05),
      nested: nested
    });
  });

  return nested_array;
}
