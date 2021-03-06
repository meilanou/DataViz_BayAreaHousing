"use strict";

// globle variables
// var Bay_Area_Counties = ['San Francisco','Marin','Sonoma','Napa','Solano',
//  'Contra Costa','Alameda','Santa Clara','San Mateo'];
var Bay_Area_Counties = ['San Francisco','Marin','Contra Costa','Alameda','Santa Clara','San Mateo'];
var Main_Areas = ['United States', 'San Francisco', 'San Jose'];

var margin = 40,
  width = 680,
  height = 540,
  font_margin = 12;
var interval = 30,
  wait = 1000,
  duration = 1500;
var pricing_unit = 100000.0;

// create default 2 divs
function append_divs() {
  d3.select('#container').append('div')
    .attr('id', 'left')
    .style('height', (height*1.5)+'px');
  d3.select('#container').append('div')
    .attr('id', 'right');
}
// make charting area bigger
function resize_for_exploration() {
  if (d3.select('#left').empty()) {
    append_divs();
  }
  d3.select('#left').style('width', '18%');
  d3.select('#right').style('width', '70%');
}
// make story area bigger
function resize_for_story() {
  if (d3.select('#left').empty()) {
    append_divs();
  }
  d3.select('#left').style('width', '30%');
  d3.select('#right').style('width', '58%');
}
// common addition to every page
function add_data_resource() {
  d3.select('#left')
    .append('p')
    .attr('class', 'footnote')
    .html('Percentiles: A measure at which that percentage of the total values are the same as or below that measure. '+
      'For example, 99% of the data values lie below the 99th percentile.<br/><br/>'+
      'Quartiles: Values that divide a data table into four groups containing an approximately equal number of observations. '+
      'The total of 100% is split into four equal parts: 25%, 50%, 75% and 100%.<br/><br/>'+
      "[1] Please refer to <a href='sources.html' target='_blank'>Data Sources</a> for raw data sources<br/>"+
      "[2] See <a href='datasets.html' target='_blank'>Data Files</a> for processed data sets used for visualization");
}