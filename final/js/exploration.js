"use strict";

// globle variables
var default_lat_lng = {lat: 37.65, lng: -122.19},
	default_zoom = 9;
var gap = 10;
var default_map_color = '#B2B2B2';
var google_map, google_map_infowindow
var select_value = 'zhvi';
var map_geojson, chart_objs;
var chart_crect;

// reset and append viz description by selected perspective
function update_viz_description() {
	d3.select('#viz_description').select('span.description').remove();
	d3.select('#viz_description')
		.append('span')
		.attr('class', 'description')
		.html(get_pers_description(select_value));
}
// reset and append viz latest period by selected perspective
function update_viz_period(period_date, isSeries) {
	d3.select('#viz_description').select('span.period').remove();
	// need to move back one month because the first day of next month 
	// is used as timestamp to represent the entire month
	var d = new Date(period_date.getFullYear(), period_date.getMonth()-1, 1);
	d3.select('div#viz_description')
		.append('span')
		.attr('class', 'period')
		.html((isSeries ? 'Data up to ' : 'Data of ') + d3.time.format("%B, %Y")(d));
}
// add the dropdown list to switch among perspectives
function init_perspectives() {
	var div = d3.select('#right')
		.append('div')
		.attr('class', 'perspectives');

	div.append('div')
		.attr('class', 'perspectives_title')
		.text('Select a Market Perspective: ');

	var select = div.append('select')
		.attr('class', 'perspectives')
		.on("change", function() {
			show_loading_overlay();
	        select_value = this.options[this.selectedIndex].value;
	        reset_visualization();
	        update_viz_description();
	        load_perspective_data();
	    });

	var options = select.selectAll('option')
		.data(Perspectives)
		.enter()
		.append('option')
		.text(function (d) { return d.label; })
		.attr("value", function (d) { return d.id; });
}
// add vertical value-color mapping bar
function add_legend(svg, colors, extent, format_pattern, ticks) {
	var format = d3.format(format_pattern);
	var color_range = [colors.color_func(extent[0]), colors.color_func(extent[1])];
    draw_scale_legend_vertical(svg, color_range, extent, ticks, 10, 8, 8, 108, format);
}
// draw line for selected area
function update_line_chart(area_key) {
	chart_objs.forEach(function(c) {
		var filtered = c.nested.filter(function(d) { return d.key === area_key; })[0];
		if (filtered) {
			amend_series_line_chart(c.g, c.line_func, filtered,
				c.period_scale, c.data_scale, c.color, c.format_pattern); 
		} else {
			reset_series_line_chart(c.g);
		}
	});
}
// add or remove the additional bar
function update_bar_chart(area_key) {
	chart_objs.forEach(function(c) {
		var filtered = c.data.filter(function(d) { return d['region'] === area_key; })[0];
		if (filtered) {
			// located at 3, always te 4th bar
			amend_bar_chart(c.g, filtered, c.data_scale, 3, 
				c.bar_bottom, c.space, c.padding, c.color, c.format);
		} else {
			reset_bar_chart(c.g);
		}
	});
}
// draw GeoJSON layer on Google map and charts, display text if any
function fill_content(csv_data) {
    // draw static US states map
    var svg_charts = d3.select('#viz_charts')
      .append('svg')
      .attr('width', chart_crect.width)
      .attr('height', chart_crect.height);
    var svg_legend = d3.select('#viz_legend')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

	// different perspective data
	var all_objs;
	var ticks = 5;
	switch (select_value) {
		case 'zhvi_summary':
		all_objs = get_zhvi_summary(csv_data);
		break;
		case 'zhvi1p5m_summary':
		all_objs = get_zhvi_summary(csv_data, 1500000);
		break;
		case 'zri_summary':
		all_objs = get_zri_summary(csv_data);
		break;
		case 'zri4k_summary':
		all_objs = get_zri_summary(csv_data, 4000);
		break;
		case 'buy_sell':
		all_objs = get_buyer_seller(csv_data);
		break;
		case 'health':
		all_objs = get_market_health(csv_data);
		break;
		case 'zhvi':
		all_objs = get_zhvi(csv_data);
		break;
		case 'zhvi1p5m':
		all_objs = get_zhvi(csv_data, 1500000);
		break;
		case 'zri':
		all_objs = get_zri(csv_data);
		break;
		case 'zri4k':
		all_objs = get_zri(csv_data, 4000);
		break;
		case 'price_rent':
		all_objs = get_price_to_rent(csv_data);
		break;
		case 'inc_dec':
		all_objs = get_increasing_decreasing(csv_data);
		ticks = 4;
		break;
		case 'turnover':
		all_objs = get_turnover(csv_data);
		break;
		case 'turnover99':
		all_objs = get_turnover(csv_data, 0.99);
		break;
		case 'foreclosed':
		all_objs = get_foreclosed(csv_data);
		break;
		case 'foreclosed99':
		all_objs = get_foreclosed(csv_data, 0.99);
		break;
		case 'resales':
		all_objs = get_resales(csv_data);
		break;
	}

	var type = Perspectives.filter(function(d) { return d['id'] === select_value; })[0].type;

	if (type === 'line') {
		// one format for all charts
		var pattern = Perspectives.filter(function(d) { 
			return d['id'] === select_value; })[0].format;
		// draw line charts
		chart_objs = new Array();
		var sub_height = chart_crect.height/all_objs.length;
		var map_display_obj;
		for (var i = 0; i < all_objs.length; i++) {
			var obj = all_objs[i];
			if (i === 0) {
				// map is overlayed with first chart data
				map_display_obj = obj;
				add_legend(svg_legend, obj.colors, obj.extent, pattern, ticks);
				update_viz_period(obj.latest_period_date, true);
			}
			var main_area_nested = obj.nested.filter(function(d) { 
				return Main_Areas.indexOf(d['key']) >= 0; });
			chart_objs.push(init_series_line_chart(main_area_nested, obj.nested, 
				obj.extent, ticks, svg_charts, chart_crect.width, sub_height, 
				margin, obj['title'], pattern, i*sub_height, obj.mid_color)
			);
		}
	} else if (type === 'bar') {
		// draw bar charts
		chart_objs = new Array();
		// 2 charts per row, ideal for 2x2
		var sub_width = chart_crect.width/2;
		var sub_height = chart_crect.height/(all_objs.length/2);
		var map_display_obj;

		for (var i = 0; i < all_objs.length; i++) {
			var obj = all_objs[i];
			// diff format for each chart
			var pattern = obj.format;
			if (i === 0) {
				// map is overlayed with first chart data
				map_display_obj = obj;
				add_legend(svg_legend, obj.colors, obj.extent, pattern, ticks);
				var d = new Date(2015, 11, 1); // fixed as data source is not dynamically updated
				update_viz_period(d, false);
			}

			var main_area_data = obj.data.filter(function(d) { 
				return Main_Areas.indexOf(d['region']) >= 0; });
			chart_objs.push(init_bar_chart(main_area_data, obj.data, obj.extent, ticks, 
				svg_charts, sub_width, sub_height, obj['title'], pattern, 
				Math.floor(i/2)*sub_height, (i%2)*sub_width, obj.mid_color)
			);
		}
	}

	// add data to map
    map_geojson.features.forEach(function(element) {
    	// first reset
    	element.properties['datum'] = undefined;
    	element.properties['color'] = undefined;	

    	var zip = element.properties['zip'];   	
    	var zip_item;
    	if (type === 'line') {
    		zip_item = map_display_obj.nested.filter(function(d) {
	    		return d['key'] === zip;
	    	});
    	} else if (type === 'bar') {
    		zip_item = map_display_obj.data.filter(function(d) {
	    		return d['region'] === zip;
	    	});
    	}
    	if (!zip_item || zip_item.length == 0) { return; } // zip not found

		var val;
		if (type === 'line') {
			val = zip_item[0]['values']['latest_datum'];
		} else if (type === 'bar') {
			val = zip_item[0]['datum'];
		}
		if(val) {
	    	element.properties['datum'] = val;
	    	element.properties['color'] = map_display_obj.colors.color_func(val);
	    } 
    });

	google_map.data.addGeoJson(map_geojson);
	clear_loading_overlay();
}
// save loaded geo json and continue
function assign_geo_data(geojson) {
	map_geojson = geojson;
	load_perspective_data();
}
// load map and data from files by selected perspective
function load_perspective_data() {
	// find data file name by selected value
	var file = Perspectives.filter(function(obj) {
	  return obj.id === select_value;
	})[0].file;

	// load geo json and data csv files
	d3.csv('/data/Zillow_CSV/' + file,
		function(d) {
			d['Year'] = +d['Year'];
			d['Month'] = +d['Month'];
			d['period_date'] = new Date(d['Year'], d['Month'], 1)
	  		return d;
		},
		fill_content
	);
}
// apply geo json after Google Map is loaded
function init_map() {
	google_map = new google.maps.Map(document.getElementById('google_map'), {
		zoom: default_zoom,
		center: default_lat_lng
	});

	var transitLayer = new google.maps.TransitLayer();
	transitLayer.setMap(google_map);

	// dynamic color assignment
	google_map.data.setStyle(function(feature) {
		var custom_color = feature.getProperty('color');
		
		return /** @type {google.maps.Data.StyleOptions} */({
		  fillColor: (custom_color ? custom_color : default_map_color),
		  fillOpacity: 0.6,
		  strokeColor: '#8A8A8A',
		  strokeOpacity: 0.8,
		  strokeWeight: 1
		});
	});

	// mouseover pop-up
	google_map.data.addListener('click', function(event) {
		// close existing pop-up
		if(google_map_infowindow) { google_map_infowindow.close(); }

		var zip = event.feature.getProperty('zip');
		var filtered = Perspectives.filter(function(d) { return d['id'] === select_value; })[0];
		if (filtered.type === 'line') {
			update_line_chart(zip);
		} else if (filtered.type === 'bar') {
			update_bar_chart(zip);
		}
		var label = filtered.map_label;
		var format = get_nice_format(filtered.format);

		var datum = event.feature.getProperty('datum');

		google_map_infowindow = new google.maps.InfoWindow({
			content: 'Zip Code: ' + zip +
				'<br/>City/Place: ' + event.feature.getProperty('place') +
				'<br/>County: ' + event.feature.getProperty('county') +
				'<br/>'+label+': '+(datum ? format(datum) : 'N/A'),
			position: event.latLng
		});
		google.maps.event.addListener(google_map_infowindow, 'closeclick', function(){
		   reset_series_line_chart();
		   reset_bar_chart();
		});
		google_map_infowindow.open(google_map);
	});

	// load map geojson
	d3.json('/data/GeoJSON/bay_area_zips_full2.geo.json', assign_geo_data);
}
// load Google Map via API
function add_google_map() {
	d3.select('#viz_left_pane')
		.append('div')
		.attr('id', 'google_map')
		.style('height', '100%');

	d3.select('html')
		.append('script')
		.attr('src', 'https://maps.googleapis.com/maps/api/js?callback=init_map')
}
// set up visualization divs
function add_visualization () {
	var p_crect = d3.select('.perspectives').node().getBoundingClientRect();
	// container div
	var main_div = d3.select('#right').append('div')
		.attr('id', 'viz_main')
		.style('padding', gap + 'px 0 0 0')
		.style('height', (height*1.5 - p_crect.height - gap)+'px');
	// left pane
	var map_portion = 0.55;
	if (window.innerWidth >= 1920) {
		map_portion = 0.8;
	} else if (window.innerWidth >= 1600) {
		map_portion = 0.7;
	}
	var m_crect = main_div.node().getBoundingClientRect();
	var left_div = main_div.append('div')
		.attr('id', 'viz_left_pane')
		.style('width', width*map_portion + 'px')
  		.style('height', (m_crect.height - gap)+'px');
  	// right pane
	var l_crect = left_div.node().getBoundingClientRect();
	var r_width = m_crect.width - l_crect.width - gap*2;
	var right_div = main_div.append('div')
		.attr('id', 'viz_right_pane')
		.style('width', r_width + 'px')
		.style('height', l_crect.height + 'px');
	// legend and description
	var padding = 5;
	var lg_width = 100;
	var legend_div = right_div.append('div')
		.attr('id', 'viz_legend')
		.style('padding', padding + 'px')
		.style('width', (lg_width-padding*2) + 'px');
	right_div.append('div')
		.attr('id', 'viz_description')
		.style('padding', padding + 'px')
		.style('width', (r_width - lg_width-padding*3) + 'px');
	// legend for charts
	var chart_legend_height = 40;
	var chart_legend_svg = right_div.append('div')
		.attr('id', 'charts_legend')
		.style('height', chart_legend_height + 'px')
		.append('svg')
		.attr('width', r_width)
		.attr('height', chart_legend_height);
	// add pattern explaination at the bottom
	draw_common_chart_legend(chart_legend_svg, Main_Areas, r_width/8, chart_legend_height/2, r_width/10);
	// container for charts
	var chart_div = right_div.append('div')
		.attr('id', 'viz_charts')
		.style('bottom', chart_legend_height + 'px')
		.style('height', 
			(right_div.node().getBoundingClientRect().height - padding -
				legend_div.node().getBoundingClientRect().height - chart_legend_height)+'px');
	chart_crect = chart_div.node().getBoundingClientRect();

	// add elements to divs
	show_loading_overlay();
	add_google_map();
}
// text description for all the perspectives on the left pane
function add_overall_description() {
	var left = d3.select('#left');
	left.append('h2')
		.text('Local Market');
	left.append('p')
		.text('A given local area is only definitely under State, County and Zip Code. '+
			'The visualization is based on Zip Codes for the best Zillow data coverage.');
	left.append('p')
		.text('Housing markets in 6 Bay Area counties had generally stabilized pretty well so far. '+
			'But there are different past patterns and current situations locally. '+
			'Buying a home is a big commitment and we can\'t simply assume any area is the same. ' +
			'Even adjacent areas can be very different. '+
			'Better affordability doesn\'t always mean better long-term stability. '+
			'Better stability doesn\'t imply better rental opportunities. '+
			'In a market that there can be 10-20 bidders on a property, '+
			'more research will get home buyers more confidence in purchasing. '+
			'There are indeed extreme outliers so I set up cap for some perspectives '+
			'to make the majority data more readable.');	
	left.append('p')
		.text('You can select from the dropdown list of different perspectives '+
			'to further evaluate local markets. '+
			'The overlaid map is interactive and you can click to see more details of a Zip Code. '+
			'If time series line charts appear, you can move the mouse over the '+
			'colored line (Zip Code) to see past data.');
	add_data_resource();
}
// set up text, perspectives and visualization sections
function setup_exploration() {
	resize_for_exploration();
	add_overall_description();
	init_perspectives();
	add_visualization();
	update_viz_description();
}
// remove all map overlays, charts and information
function reset_visualization() {
	d3.select('#viz_charts').select('svg').remove();
	d3.select('#viz_legend').select('svg').remove();
	if(google_map_infowindow) { google_map_infowindow.close(); }
	google_map.data.forEach(function (feature) {
	    google_map.data.remove(feature);
	});
}