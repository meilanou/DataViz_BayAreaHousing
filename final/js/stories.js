"use strict";

// globle variables
var min_most_recent = 0, median_most_recent = 0, 
    cali_most_recent = 0, max_most_recent = 0;
var cali_highest_median = 0, cali_highest_year = 0;

// draw US map and interquartile line chart 
// and setup time series update
function draw_us() {
  // after loading geo jason and price csv file, process data 
  // and draw static interquartile line chart
  function fill_content(error, geo_data, price_data) {
    if (error) throw error;

    // for zooming
    var feature_cali = geo_data.features
      .filter(function(d) { return d.properties.NAME === 'California'; })[0];

    // draw static US states map
    var svg_map = d3.select('#div_chart1')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style("opacity", 0); // need to manually show it later
    var map_return = draw_us_map(geo_data, svg_map, width, height);

    // find out property median price extent
    var price_extent = d3.extent(price_data, function(d) {
      return d['Median'];
    });

    // find California's peak stats and save globally for later reference
    var data_cali = price_data.filter(function(d) { return d['RegionName'] === 'California'; });
    data_cali.sort(function(a, b) { return b['Median'] - a['Median']; })
    cali_highest_median = data_cali[0]['Median'];
    cali_highest_year =  data_cali[0]['Year'];

    // get color mapper by price extent
    var nice_extent = get_nice_extent(price_extent, pricing_unit, true);
    var color_range = ['#FFFFFF', '#FFA263'];
    var colors = range_colors(nice_extent, pricing_unit, color_range);
    var ticks = 6;

    // show color mapping scale
    draw_scale_legend_vertical(map_return.svg, color_range, nice_extent, ticks,
      1, 60, 10, 140, d3.format('$,s'));

    // show year title
    map_return.svg.append('g')
      .append('text')
      .attr('id', 'year_label')
      .attr('x', 1)
      .attr('y', 15)
      .attr('dy', '0.5em')
      .text('Monthly Medians of the Year')
      .call(wrap_text, 100);

    // aggregation function to nest raw data by timing period
    function agg_states(leaves) {
      var states = new Array();
      var medians = new Array();
      var median_major = 0;

      leaves.forEach(function(d) {
        if (d['RegionName'] === 'California') { median_major = d['Median']; }
        if (!isNaN(d['Median']) && d['Median'] > 0) { medians.push(d['Median']); }
        var s = {
          'name': d['RegionName'],
          'median': d['Median']
        };
        states.push(s);
      });

      medians.sort(function(a, b) { return a - b; });

      // specific structure used by interquartile charting function
      return {
        'year': leaves[0]['Year'],
        'month': leaves[0]['Month'],
        'period_val': leaves[0]['Year'] + leaves[0]['Month']/100.0,
        'period_date': new Date(leaves[0]['Year'], leaves[0]['Month'], 1),
        'segment': leaves[0]['Segment'], //only one segment for now
        'median_period': d3.median(medians),
        'median_max': d3.max(medians),
        'median_min': d3.min(medians),
        'median_q1': d3.quantile(medians, 0.25),
        'median_q3': d3.quantile(medians, 0.75),
        'median_major': median_major,
        'states': states
      };
    }

    // nest data by timing period for time series charting
    var nested = d3.nest()
    .key(function(d) {
        return (d['Year'] + d['Month']/100.0);
      })
    .rollup(agg_states)
    .entries(price_data);

    // plot static interquartile line chart by time series
    var svg_chart = d3.select('#div_chart2')
      .append('svg')
      .attr('width', width)
      .attr('height', height/2)
      .style("opacity", 0); // need to manually show it later
    var chart_return = draw_iqr_line_chart(nested, nice_extent, ticks,
      svg_chart, width, height/2, margin);
    var svg_chart = chart_return.svg;
    var line_major = chart_return.line_major;

    // for animation, update colors of states by prices
    function update_map_color(period_val) {
      var filtered = nested.filter(function(d) {
        return +d['key'] === period_val;
      });
      var states = filtered[0].values['states'];
      var state_names = states.map(function(d) { return d['name']; });

      function update_state_colors(d) {
        var idx = state_names.indexOf(d.properties.NAME);
        if (idx === -1) {
          return colors.color_default;
        } else {
          return colors.color_func(states[idx]['median']);
        }
      }

      map_return.g.selectAll('path')
        .transition()
        .duration(interval)
        .style('fill', update_state_colors);

      // update year title
      d3.select('#year_label')
        .text('Monthly Medians of ' + filtered[0].values['year'])
        .call(wrap_text, 100);
    }

    // for animation, update California line by prices
    function update_chart_california(period_val) {
      var period_date = nested.filter(function(d) {
        return +d['key'] === period_val;
      })[0]['values']['period_date'];
      var filtered = nested.filter(function(d) {
        return d['values']['period_date'] <= period_date;
      });
      
      svg_chart.selectAll("path.line")
        .data([filtered])
        .enter()
        .append("path")
        .attr("class","iqr major")
        .attr("d", line_major)
        .attr('stroke', '#E37419')
        .transition()
        .duration(interval);
    }

    // display wrapped text on svg
    function describe_california(feature, scale, translate) {
      // Stats needed to describe California's situation
      var most_current_key = nested.map(function(d) { return d['key']; }).sort().reverse()[0];
      var filtered = nested.filter(function(d) {
        return d['key'] === most_current_key;
      });
      var most_recent_year = filtered[0]['values']['year'];
      var most_recent_month = filtered[0]['values']['month'];
      var states_desc = filtered[0]['values']['states']
        .sort(function(a, b) { return b.median - a.median; });
      var state_names = states_desc.map(function(d) { return d['name']; })
      var cali_rank = state_names.indexOf('California') + 1;
      var min_most_recent = filtered[0]['values']['median_min'];
      var median_most_recent = filtered[0]['values']['median_period'];
      cali_most_recent = filtered[0]['values']['median_major'];
      max_most_recent = filtered[0]['values']['median_max'];

      // update year title, add month
      var curr_title = d3.select('#year_label').text();
      d3.select('#year_label')
        .text('Monthly Medians of ' + most_recent_year + 
          ' - ' + Month_Names[most_recent_month - 1])
        .call(wrap_text, 100);

      // get coordinates and width to add text
      var text_box = get_text_boundaries(map_return.path, feature, scale, translate);

      var dollar = d3.format('$,');
      var n = 0;

      // append to svg directly to avoid text zoom-in
      map_return.svg.append("text")
        .attr("x", text_box.x)
        .attr("y", text_box.y+45)
        .attr("dy", ".5em")
        .style('text-anchor', 'start')
        .html('California\'s median home price was always above 75% (3rd quartile) ' +
          'but had been fluctuating quite a bit. As of ' + 
          Month_Names[most_recent_month-1] + ' ' + most_recent_year +
          ', CA keeps the #' + cali_rank + ' highest median home price ' +
          'after ' + concat_words(state_names.slice(0, cali_rank-1)) +
          '. CA\'s current median home price is ' + dollar(cali_most_recent) +
          ' - very high comparing to min ' + dollar(min_most_recent) +
          ', median ' + dollar(median_most_recent) + ' and ' +
          'max ' + dollar(max_most_recent) + ' of all states\' medians. ')
        .call(wrap_text, text_box.width)
        .style("opacity", 0)
        .transition()
        .duration(duration/3)
        .style("opacity", 1)
        .each(function() { ++n; }) 
        .each('end', function(){ if(!--n) { // after rendering text display buttons
          var bbox = this.getBBox();
          draw_buttons(map_return.svg, bbox.x, bbox.y + bbox.height + 10, 80,
            [{label: 'Replay', func: function() { clear_svgs(duration, null, draw_us); }},
            {label: 'Continue', func: function() { clear_svgs(duration, null, draw_cali); }}]); }
        });
    }

    // animation - update map colors and price trend at designated speed
    function update() { 
      var period_vals = nested
        .map(function(d) { return d['values']['period_val']; })
        .sort();
      var period_i = 0;

      // loop through every period and update map and chart
      var year_month_interval = setInterval(function() {
        update_map_color(period_vals[period_i]);
        update_chart_california(period_vals[period_i]);

        period_i++;

        if(period_i >= period_vals.length) {
          clearInterval(year_month_interval);
          // zoome to California when finishing time series
          // after zooming in, display text to describe California condition
          setTimeout(function(){
            var factors = get_zoom_in_factors(map_return.path, feature_cali, width, height);
            zoom_in_feature(map_return.g, factors.scale, factors.translate, duration, 
              function(){ describe_california(feature_cali, factors.scale, factors.translate); });
            }, wait*3);
        }
      }, interval);
    }

    // after map and chart show up, wait for few seconds and then start animation
    show_svgs(duration, null, function() {
      setTimeout(function(){
        update();
      }, wait);
    });
  }

  // load geo json and price csv files
  queue()
    .defer(d3.json, '/data/GeoJSON/gz_2010_us_states_500k.json')
    .defer(d3.csv, '/data/Zillow_CSV/median_by_state.csv', function(d) {
      d['Median'] = +d['Median'];
      d['Year'] = +d['Year'];
      d['Month'] = +d['Month'];
      return d;
    })
    .await(fill_content);
}

// draw California state map with pricing stats
function draw_cali() {
  // after loading geo json and price csv files
  // process data and show stats
  function fill_content(error, geo_data, price_data) {
    if (error) throw error;

    // get path projection setup 
    var svg_map = d3.select('#div_chart1')
      .append('svg')
      .attr('width', width)
      .attr('height', height*1.5)
      .style("opacity", 0); // need to manually show it later
    var map_return = draw_state_map (
      geo_data, svg_map, width, height*1.5, 120, -37);

    // extract county-price map
    var price_mapping = d3.map();
    price_data.map(function(d) { price_mapping.set(d['RegionName'], +d['Median']); });
    var price_mapping_bay_area = d3.map(); // bay area 6 counties
    price_data.map(function(d) { 
      if (Bay_Area_Counties.indexOf(d['RegionName']) !== -1) {
        price_mapping_bay_area.set(d['RegionName'], +d['Median']); 
      }});

    // find out property median price extent
    var price_extent = d3.extent(price_mapping.values());
    var price_extent_bay_area = d3.extent(price_mapping_bay_area.values());

    // get color mapper by price extent
    var nice_extent = get_nice_extent(price_extent, pricing_unit, true);
    var color_range = ['#FFFFFF', '#F06000'];
    var colors = range_colors(nice_extent, pricing_unit, color_range);
    var ticks = 6;

    // show color mapping scale
    draw_scale_legend_vertical(map_return.svg, color_range, nice_extent, ticks,
      1, 60, 10, 140, d3.format('$,s'));

    // show year title
    map_return.svg.append('g')
      .append('text')
      .attr('id', 'year_label')
      .attr('x', 1)
      .attr('y', 15)
      .attr('dy', '0.5em')
      .text('Medians of ' + Month_Names[price_data[0]['Month']-1] + 
        ' ' + price_data[0]['Year'])
      .call(wrap_text, 100);

    // circle area and display wrapped text on svg
    function highlight_bay_area() {
      // place image and text outside and adjacent to bounding box
      var feature_sf = geo_data.features
        .filter(function(d) { // geo feature of San Francisco County
          return d.properties.name === 'San Francisco County, CA'; })[0];
      var bounds = get_bounding_box(map_return.path, feature_sf);

      // use a png to circle SF Bay Area, centered at SF county
      // gradually show the circle, slightly faster then text
      var img_size = Math.max(bounds.dx, bounds.dy)*3.0;
      map_return.svg
        .append("svg:image")
        .attr("xlink:href", "/resource/Image/Chalk_circle_2.png")
        .attr("width", img_size)
        .attr("height", img_size)
        .attr("x", bounds.cx - img_size/3)
        .attr("y", bounds.cy - img_size/2)
        .style("opacity", 0)
        .transition()
        .duration(duration/3)
        .style("opacity", 1);

      // place wrpped text on the left of SF county with padding
      // gradually show up text
      var text_box = get_text_boundaries(map_return.path, feature_sf);
      var dollar = d3.format('$,');
      var n = 0;
      map_return.svg.append("text")
        .attr("x", text_box.x)
        .attr("y", text_box.y)
        .attr("dy", ".5em")
        .style('text-anchor', 'start')
        .html('In California, ' +
          'San Francisco Bay Area\'s ' + Bay_Area_Counties.length + 
          ' major adjacent counties - ' + concat_words(Bay_Area_Counties) +
          ' - have median home prices (by county) ranging from ' + 
          dollar(price_extent_bay_area[0]) + ' to ' + dollar(price_extent_bay_area[1]) + 
          ' as of ' + Month_Names[price_data[0]['Month'] - 1] + ' ' + price_data[0]['Year'] +
          '. Which are in the upper half of all California counties\' medians from ' + dollar(price_extent[0]) +
          ' to ' + dollar(price_extent[1]) + ' and contributes to California State\'s high median ' + 
          dollar(cali_most_recent) + '. But with strong job market, property market is still hot ' +
          'in Bay Area. Buying a home requires more research. Let\'s dig into more details.')
        .call(wrap_text, text_box.width)
        .style("opacity", 0)
        .transition()
        .duration(duration/3)
        .style("opacity", 1)
        .each(function() { ++n; })
        .each("end", function() { if (!--n) { // after rendering text display buttons
          var bbox = this.getBBox();
          draw_buttons(map_return.svg, bbox.x, bbox.y + bbox.height + 10, 80,
            [{label: 'Replay', func: function() { clear_svgs(duration, null, draw_us); }},
            {label: 'Continue', func: function() { 
              clear_all(d3.selectAll("#left, #right"), duration, setup_exploration); 
            }}]); }
        }); 
    }

    //gradually show svg elements
    show_svgs(duration, null, highlight_bay_area);

    //gradually show map colored by price
    var n = 0;
    map_return.g.selectAll('path')
      .style("opacity", 0)
      .transition()
      .duration(duration)
      .style("opacity", 1)
      .style('fill', function(d) { 
        return colors.color_func(price_mapping.get(
          d.properties.name.replace(' County, CA', ''))); })
      .each(function() { ++n; }) 
      .each('end', function(){ if(!--n){ highlight_bay_area(); } });
  }

  // load geo json and price csv files
  queue()
    .defer(d3.json, '/data/GeoJSON/cali_counties.json')
    .defer(d3.csv, '/data/Zillow_CSV/median_by_county.csv')
    .await(fill_content);
}