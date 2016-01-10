"use strict";

/* get continuous gradient colors by min/max values and colors */
function range_colors(extent, scale, colors) {
  var color_default = '#E8E8E8';
  scale = scale*1.0; // make ii float
  var min_range = extent[0]/scale;
  var max_range = extent[1]/scale;

  var color_range_func = d3.scale.linear()
    .domain([min_range, max_range])
    //.interpolate(d3.interpolateRgb)
    .range(colors);

  var color_func = function(value) {
    if (isNaN(value)) {
      return color_default;
    } else {
      return color_range_func(Math.floor(value/scale));
    }
  }

  return {
    'color_default': color_default,
    'color_func' : color_func
  }
};
/* D3's way to wrap text by certain width -
   based on http://bl.ocks.org/mbostock/7555321 */
function wrap_text(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan")
          .attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
/* get top-left coords and width to display text */
function get_text_boundaries(path, feature, scale, translate) {
  var bounds = get_bounding_box(path, feature); // bounding box ignoring zooming effect
  var x = 0, y = 0;
  if (scale && translate) { 
    // find coords on a untransformed g that reflects transformed coords
    x = bounds.x*scale + translate[0];
    y = bounds.cy*scale + translate[1];
  } else {
    x = bounds.x;
    y = bounds.cy;
  }

  var text_width = Math.min(x*0.9, 250); // padded text width
  var text_top = Math.max(y - 20, 10); // padded text top

  return {
    'x': x - text_width*1.1, // leaves little padding on the left
    'y': text_top,
    'width': text_width
  }
}
