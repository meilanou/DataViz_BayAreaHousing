"use strict";

/* draw static US map */
function draw_us_map(geo_data, svg, width, height) {
  var g_map = svg
    .append('g')
    .attr('class', 'map');

  var us_projection = d3.geo.albersUsa()
    .scale(width)
    .translate([width/1.8, height/2]);

  var us_outline = d3.geo.path()
    .projection(us_projection);

  if (geo_data) {
    g_map.selectAll('path')
      .data(geo_data.features)
      .enter()
      .append('path')
      .attr('d', us_outline);
  }

  return {
    'svg': svg,
    'g': g_map,
    'projection': us_projection,
    'path': us_outline
  };
}
/* draw static state map */
function draw_state_map(geo_data, svg, width, height, long, lat) {
  var g_map = svg
    .append('g')
    .attr('class', 'map');

  var b = d3.geo.bounds(geo_data),
    s = Math.min(width/(b[1][0] - b[0][0]), height/(b[1][1] - b[0][1]))*50;

  var state_projection = d3.geo.transverseMercator()
    .rotate([long, lat])
    .scale(s)
    .translate([width/2, height/2]);

  var state_outline = d3.geo.path()
    .projection(state_projection);

  if (geo_data) {
    g_map
      .selectAll('path')
      .data(geo_data.features)
      .enter()
      .append('path')
      .attr('d', state_outline);
  }

  return {
    'svg': svg,
    'g': g_map,
    'projection': state_projection,
    'path': state_outline
  };
}
/* compute scale and translate by coundaries for zoom-in */
function get_zoom_in_factors(path, feature, width, height) {
  var bounds = get_bounding_box(path, feature),
    scale = Math.min(width/bounds.dx, height/bounds.dy)*0.95,
    translate = [width/2 - scale*bounds.cx, height/2 - scale*bounds.cy];

  return {
    'scale': scale,
    'translate': translate
  };
}
/* transitionally zoom in a selected feature */
function zoom_in_feature(g, scale, translate, duration, callback) {
  var trans = g
    .transition()
    .duration(duration)
    .style("stroke-width", 1.5/scale + "px")
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")")

  if (callback) {
    var n = 0;
    trans
      .each(function() { ++n; }) 
      .each("end", function() { if (!--n) callback(); }); 
  }
}
/* basic x-axis with no tick */
function setup_year_scale_xaxis(g, period_dates, width, height, margin, add_extra) {
  if (add_extra) {
    // extend to make mouseover toolip is easier to locate on UI
    var last = period_dates[period_dates.length-1];
    var extra = new Date(last.getFullYear(), last.getMonth()+1, 1);
    period_dates.push(extra);
  }

  var period_date_extent = d3.extent(period_dates);

  var period_scale = d3.time.scale()
    .range([margin, width])
    .domain(period_date_extent);

  var x_axis_period = d3.svg.axis()
    .scale(period_scale)
    .orient('bottom')
    .tickFormat(d3.time.format("%Y"))
    .ticks(period_date_extent[1].year - period_date_extent[0].year + 1);

  // draw x-axis
  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', "translate(0," + (height-margin-font_margin) + ")")
    .call(x_axis_period);

  // rotate x-axis labels 30 degree counter-clock-wise
  g.selectAll(".x text")
    .attr("transform", function(d) {
      var bbox = this.getBBox();
      return "translate(" + (-bbox.width/1.3) + "," + (bbox.height-6) + ")rotate(-30)";
    });

  return period_scale;
}
/* draw static interquartile line chart by time series, 
specificcally structured nested data required */
function draw_iqr_line_chart(nested, extent, ticks, svg, width, height, margin) {
  var g = svg.append('g')
    .attr('class', 'chart');

  // setup x-axis
  var period_dates = d3.values(nested)
    .map(function(d) { return d['values']['period_date']; })
    .sort(function (a, b) { return a - b; });
  var period_scale = setup_year_scale_xaxis(g, period_dates, width, height, margin, true);

  var tick_values = get_tick_values(extent, ticks, false);

  var price_scale = d3.scale.linear()
    .range([(height-margin-font_margin), margin])
    .domain(extent)
    .nice();

  var y_axis_price = d3.svg.axis()
    .scale(price_scale)
    .orient('left')
    .innerTickSize(-width+margin)
    .tickFormat(d3.format('$,s'))
    .tickValues(tick_values);

  // draw y-axis first as it's showing dash lines
  // draw text and grid lines too
  g.append("g")
    .attr("class", "y axis noline")
    .attr('transform', "translate(" + margin + ",0)")
    .call(y_axis_price)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -40)
    .attr("dy", "1.2em")
    .style("text-anchor", "end")
    .text("Median Price ($)");

  // chart title
  svg.append("text")
      .attr("x", width/2)             
      .attr("y", height - 5)
      .attr("text-anchor", "middle")  
      .text("All States Interquartile v.s. California");

  // create functions for min, 1st quartile, median, 3rd quartile, max lines
  // and major line (special attention line)
  var line_median = d3.svg.line()
    .x(function(d) { return period_scale(d['values']['period_date']); })
    .y(function(d) { return price_scale(d['values']['median_period']); });

  var line_min = d3.svg.line()
    .x(function(d) { return period_scale(d['values']['period_date']); })
    .y(function(d) { return price_scale(d['values']['median_min']); });

  var line_max = d3.svg.line()
    .x(function(d) { return period_scale(d['values']['period_date']); })
    .y(function(d) { return price_scale(d['values']['median_max']); });

  var line_q1 = d3.svg.line()
    .x(function(d) { return period_scale(d['values']['period_date']); })
    .y(function(d) { return price_scale(d['values']['median_q1']); });

  var line_q3 = d3.svg.line()
    .x(function(d) { return period_scale(d['values']['period_date']); })
    .y(function(d) { return price_scale(d['values']['median_q3']); });

  var line_major = d3.svg.line()
    .x(function(d) { return period_scale(d['values']['period_date']); })
    .y(function(d) { return price_scale(d['values']['median_major']); });

  // draw lines of interquartile's 4 sections (5 lines)
  svg.append('g')
    .append("path")
    .attr("class", "iqr")
    .attr('stroke', '#555555')
    .attr("d", line_median(nested));

  svg.append('g')
    .append("path")
    .attr("class", "iqr")
    .attr('stroke', '#99D4E8')
    .attr("d", line_min(nested));

  svg.append('g')
    .append("path")
    .attr("class", "iqr dash")
    .attr('stroke', '#A1BCC4')
    .attr("d", line_q1(nested));

  svg.append('g')
    .append("path")
    .attr("class", "iqr dash")
    .attr('stroke', '#A1BCC4')
    .attr("d", line_q3(nested));

  svg.append('g')
    .append("path")
    .attr("class", "iqr")
    .attr('stroke', '#99D4E8')
    .attr("d", line_max(nested));

  return {
    'svg': svg,
    'line_major': line_major
  };
}
// remove added line keep basic lines
function reset_series_line_chart(g) {
  if(!g) { d3.selectAll('path.amend').remove(); }
  else { g.selectAll('path.amend').remove(); }
}
// add additional path to line chart
function amend_series_line_chart(g, line_func, obj, x_scale, y_scale, color, format_pattern) {
  reset_series_line_chart(g);

  // only pass points contain real data
  var data = obj.values.period_data
    .filter(function(d) {return !isNaN(d['datum']); });
  if (data.length === 0) { return; }

  var sub_chart_g = g.append('g')
    .attr('class', 'series')
    .append("path")
    .datum(data)
    .attr("class", 'series amend')
    .style('stroke', color)
    .attr("d", line_func);
}
// setup line chart and draw basic series
function init_series_line_chart(main_nested, other_nested, extent, ticks, svg, width, height, margin, title, format_pattern, top, color) {
  var g = svg.append('g')
    .attr('class', 'chart')
    .attr("transform", "translate(0," + top + ")");

  // setup y-axis
  var tick_values = get_tick_values(extent, ticks, false);

  var data_scale = d3.scale.linear()
    .range([(height-margin-font_margin), margin])
    .domain(extent);

  var y_axis_data = d3.svg.axis()
    .scale(data_scale)
    .orient('left')
    .innerTickSize(-width+margin)
    .tickFormat(d3.format(format_pattern))
    .tickValues(tick_values);

  // draw y-axis first as it's showing dash lines
  // draw text and grid lines too
  g.append("g")
    .attr("class", "y axis noline")
    .attr('transform', "translate(" + margin + ",0)")
    .call(y_axis_data);

  // setup and draw x-axis
  var main_period_dates = main_nested[0]['values']['period_data']
    .map(function(d){ return d['period']; });
  var period_scale = setup_year_scale_xaxis(g, main_period_dates, width, height, margin, true);

  // chart title
  g.append("text")
    .attr("x", width/2)             
    .attr("y", height - 5)
    .attr("text-anchor", "middle")  
    .text(title + ' Time Series');

  var line_func = d3.svg.line()
    .x(function(d) { return period_scale(d['period']); })
    .y(function(d) { return data_scale(d['datum']); });

  // loop through areas and plot line charts
  main_nested.forEach(function(obj) {
    var key_class = obj.key.replace(' ', '');
    var path = g.append('g')
      .attr('class', 'series')
      .append("path")
      .attr("class", 'series ' + key_class)
      .attr("d", line_func(obj['values']['period_data']));
  });

  return {
    'g': g,
    'color': color,
    'format_pattern': format_pattern,
    'line_func': line_func,
    'period_scale': period_scale,
    'data_scale': data_scale,
    'nested': other_nested
  };
}
// setup line chart and draw basic bars
function init_bar_chart(main_data, other_data, extent, ticks, svg, width, height, title, format_pattern, top, left, color) {
  var g = svg.append('g')
    .attr('class', 'chart')
    .attr("transform", "translate(" + left + "," + top + ")");

  // draw y-axis first
  var margin = 55;
  var bar_bottom = height-font_margin*2;
  //var data_scale = setup_simple_yaxis(g, bar_bottom, margin, extent);

  // setup y-axis
  var tick_values = get_tick_values(extent, 5, false);

  var data_scale = d3.scale.linear()
    .range([(bar_bottom), margin])
    .domain(extent);

  var y_axis_data = d3.svg.axis()
    .scale(data_scale)
    .orient('left')
    .innerTickSize(-width+margin)
    .tickFormat(d3.format(format_pattern))
    .tickValues(tick_values);

  // draw y-axis first as it's showing dash lines
  // draw text and grid lines too
  g.append("g")
    .attr("class", "y axis noline")
    .attr('transform', "translate(" + margin + ",0)")
    .call(y_axis_data);

  // chart title
  g.append("text")
    .attr("x", width/2)             
    .attr("y", height - 5)
    .attr("text-anchor", "middle")  
    .text(title);

  var bar_space = (width-margin)/(main_data.length+1); // leave one extra space for dynamic bar
  var bar_padding = bar_space*0.15;
  var bar_g = g.append('g');
  var bars = bar_g.selectAll('g')
    .data(main_data)
    .enter()
    .append('g')
    .attr('class', 'bar')
    .attr("transform", function(d, i) { return "translate("+(margin+i*bar_space)+",0)"; });

  bars.append("rect")
    .attr('class', function(d) { return d['region'].replace(' ', ''); })
    .attr('x', bar_padding)
    .attr('y', function(d) { return data_scale(d['datum']); })
    .attr("width", (bar_space-2*bar_padding))
    .attr("height", function(d) { return bar_bottom-data_scale(d['datum']); });

  var nice_format = get_nice_format(format_pattern);
  bars.append("text")
    .attr('text-anchor', 'middle')
    .attr("x", bar_space/2)
    .attr("y", function(d) { return data_scale(d['datum'])-font_margin/2; })
    .text(function(d) { return nice_format(d['datum']); });

  return {
    'g': bar_g,
    'space': bar_space,
    'padding': bar_padding,
    'color': color,
    'format': nice_format,
    'bar_bottom': bar_bottom,
    'data_scale': data_scale,
    'data': other_data
  };
}
// remove amended bars
function reset_bar_chart(g) {
  if(!g) { d3.selectAll('g.amend').remove(); }
  else { g.selectAll('g.amend').remove(); }
}
// add additional bar to the chart
function amend_bar_chart(g, data, data_scale, loc, bar_bottom, space, padding, color, format) {
  reset_bar_chart(g);
  var bars = g.append('g')
    .attr('class', 'bar amend')
    .attr("transform", "translate("+(55+loc*space)+",0)");
  bars.append("rect")
    .attr('x', padding)
    .attr('y', data_scale(data['datum']))
    .attr("width", (space-2*padding))
    .attr("height", (bar_bottom-data_scale(data['datum'])))
    .attr('stroke', color);
  bars.append("text")
    .attr('text-anchor', 'middle')
    .attr("x", space/2)
    .attr("y", (data_scale(data['datum'])-font_margin/2))
    .text(format(data['datum']));
}
/* draw legend under series line chart  */
function draw_common_chart_legend(svg, items, line_x_start, line_y, line_width) {
  var chart_legend_g = svg.append('g')
    .attr('class', 'series')
  var text_bbox;
  for (var i = 0; i < items.length; i++) {
    if(text_bbox) { line_x_start =  text_bbox.x + text_bbox.width + 18; }
    chart_legend_g.append('line')
      .attr('class', 'series ' + items[i].replace(' ', ''))
      .attr('x1', line_x_start)
      .attr('y1', line_y)
      .attr('x2', line_x_start + line_width)
      .attr('y2', line_y);
    var text = chart_legend_g.append('text')
      .attr('x', line_x_start + line_width + 6)
      .attr('y', line_y + 5)
      .text(Main_Areas[i]);
    text_bbox = text.node().getBBox();
  }
}
/* draw vertical-bar of gradient color to show continuous value mapping */
function draw_scale_legend_vertical(svg, colors, extent, ticks, x, y, width, height, format) {
  var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colors[1])
    .attr("stop-opacity", 1);

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colors[0])
    .attr("stop-opacity", 1);

  var g_legend = svg.append('g');

  g_legend.append("rect")
    .attr('x', x)
    .attr('y', y)
    .attr("width", width)
    .attr("height", height)
    .attr('class', 'bar_scale')
    .style("fill", "url(#gradient)");

  // get scaler mapping values to y locations and mapped ticks
  // both rounded
  var scaler = get_range_scale_linear(extent, [y + height, y], false);
  var tick_values = get_tick_values(extent, ticks, false);

  for (var i = 0; i < tick_values.length; i++) {
    // find y by value scaler 
    var y_loc = scaler(tick_values[i]);

    g_legend.append('line')
      .attr('x1', x - 1)
      .attr('y1', y_loc)
      .attr('x2', x + width*1.5)
      .attr('y2', y_loc);

    g_legend.append('text')
      .attr('x', x + width*2)
      .attr('y', y_loc + 5)
      .text(format(tick_values[i]));
  }
}