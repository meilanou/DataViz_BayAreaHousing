"use strict";

// globle variables
var Perspectives = [
  {id: 'zhvi', type: 'line', 
    label: 'Zillow Home Value Index (ZHVI) - Median Home Value ($)', 
    map_label: 'ZHVI', format: '$s', file: 'zhvi.csv'},
  {id: 'zhvi_summary', type: 'bar',
    label: 'Zillow Home Value Index (ZHVI) - Summary',
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
  {id: 'zri_summary', type: 'bar',
    label: 'Zillow Rent Index (ZRI) - Summary',
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
  {id: 'foreclosed', type: 'line',
    label: 'Homes Foreclosed: Number of Foreclosed per 10,000 Homes', 
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
    description = 'The map is overlaid with the most recent monthly <b>ZHVI</b>. '+
    '<b>Zillow Home Value Index (ZHVI)</b> is a time series '+
    'tracking the monthly median home value. This is a way of approximating '+
    'ideal home price index by leveraging the valuations Zillow creates on all homes '+
    '(Zestimates) instead of using actual sale prices on every home.';
    break;
    case 'zhvi_summary':
    description = 'The map is overlaid with the most recent monthly <b>ZHVI</b>. '+
    'Besides <b>Zillow Home Value Index (ZHVI)</b>, the trend since peak-crisis are demostrated by '+
    'Fall From Peak for overall recovery, YoY for recent change and 10-Year forcast.';
    break;
    default:
    description = '';
    break;
  }

  return description;
}
/* below are functions to process csv data for each perspective */
function get_zhvi_summary(csv_data) {
  var data_array = new Array();    
  var categories = [
    {category: 'Zhvi', title: 'ZHVI', scale: 500000, format: '$s', color: '#FFA342', color_range: ['#FFFFFF', '#EB7900']},
    {category: 'PctFallFromPeak', title: 'Fall From Peak', scale: 0.01, format: '%', color: '#007DEB'},
    {category: 'YoY', title: 'Year Over Year', scale: 0.01, format: '%', color: '#EBD000'},
    {category: 'X10Year', title: '10-Year', scale: 0.01, format: '%', color: '#EBD000'}
    ];

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
function get_zhvi(csv_data) {
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