"use strict";

var Month_Names = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
var Month_Names_Abbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* widen extent to next rounded ones */
function get_nice_extent(extent, scale, adj_min) {
  scale = scale*1.0; // make it float
  var min = extent[0];
  if (adj_min) {
    min = d3.min([extent[0], 0]);
  }
  var min_range = Math.floor(min/scale);
  var max_range = Math.ceil(extent[1]/scale);

  return [min_range*scale, max_range*scale];
};
/* get linear scaler */
function get_range_scale_linear(domain, range, round) {
	var scale_func = d3.scale.linear()
		.domain(domain)
	    .range(range);
    if (round) { scale_func.nice(); }
	return scale_func;
}
/* get array of tick values */
function get_tick_values(extent, ticks, round) {
  var price_domain = d3.scale.linear()
    .domain(extent);
  if (round) { price_domain.nice(); }

  var nice_extent = price_domain.domain();
  var tick_values = d3.range(nice_extent[0], nice_extent[1], 
  	(nice_extent[1]-nice_extent[0])/(ticks*1.0));

  tick_values.push(nice_extent[1]);

  return tick_values;
}
/* show selected or all svgs with effects*/
function show_svgs(duration, svgs, callback) {
  if (!svgs) { svgs = d3.selectAll("svg"); }

  if(duration > 0) {
    var trans = svgs
      .style("opacity", 0)
      .transition()
      .duration(duration)
      .style("opacity", 1);
    if (callback) {
      var n = 0;
      trans
        .each(function() { ++n; }) 
        .each("end", function() { if (!--n) callback(); }); 
    }
  } 
}
/* clear and remove all html and svg elements under main divs */
function clear_all(elements, duration, callback) {
	if(duration > 0) {
		var trans = elements
		  .style("opacity", 1)
		  .transition()
		  .duration(duration)
		  .style("opacity", 0)
		  .remove();

		if (callback) {
		  var n = 0;
		  trans
		    .each(function() { ++n; }) 
		    .each("end", function() { if (!--n) callback(); }); 
		}
	} else {
		elements.remove();
		if (callback) { callback(); }
	}
}
/* clear selected or all svgs with effects*/
function clear_svgs(duration, svgs, callback) {
  if (!svgs) { svgs = d3.selectAll("svg"); }

  if(duration > 0) {
    var trans = svgs
      .style("opacity", 1)
      .transition()
      .duration(duration)
      .style("opacity", 0)
      .remove();
    if (callback) {
      var n = 0;
      trans
        .each(function() { ++n; }) 
        .each("end", function() { if (!--n) callback(); }); 
    }
  } else {
    svgs.remove();
    if (callback) { callback(); }
  }
}
/* concatenate English words to A, B and C common format */
function concat_words(words) {
	if (!words) { return ""; }
	var len_words = words.length;
	if (len_words <= 1) { return words.toString(); }

	var concatenated = words.slice(0, len_words-2).join(', ') +
		(len_words >= 3 ? ', ' : '') + 
		words.slice(len_words-2, len_words).join(' and ');
	return concatenated;
}
/* get bounding box of a geo feature */
function get_bounding_box(path, feature) {
  var bounds = path.bounds(feature);

  return {
    'x': bounds[0][0],
    'y': bounds[0][1],
    'dx': bounds[1][0] - bounds[0][0],
    'dy': bounds[1][1] - bounds[0][1],
    'cx': (bounds[0][0] + bounds[1][0])/2,
    'cy': (bounds[0][1] + bounds[1][1])/2
  };
}
function get_nice_format(pattern) {
  var format;
  if (pattern === '$s') {
    // include precision and pretty print thousands and millions
    format = function(d) { 
      var format_f = d3.format('.2f');
      if (d/1e6 >= 1) {
        return '$' + format_f(d/1e6) + 'M';
      } else if (d/1e3 >= 1) {
        return '$' + format_f(d/1e3) + 'k';
      } 
    };
  } else if (pattern === '%') {
    // include precision for pop-up
    format = d3.format('.2%');
  } else {
    format = d3.format(pattern);
  }
  return format;
}