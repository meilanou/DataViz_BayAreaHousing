# Visualization - Bay Area Housing Market

----
## Summary

Housing is a regional and local business and there are vast differences among states, counties, cities, neighborhoods, etc. From my experience, East Coast people don't necessarily know how expensive San Francisco is. And after moving to SF Bay I was surprised again some people are not aware of how different each neighborhood was in historic patterns. So I visualized Zillow data in a comprehensive and comparative way for 2 types of my assumed audience:

1. New comers want to settle in SF Bay: Each local area is different; don't just look at one price. It's important to know from different perspectives especially in this very hot region, at this argumentative time.
2. People look to move to SF Bay: Housing is much more competitive and expensive here - from San Francisco to San Jose. And some suburbs are extremely expensive.

A live demo is available at [http://dataviz.bitballoon.com/](http://dataviz.bitballoon.com/)

----
## Design

First I did exploratory data analysis majorly with Tableau: 

1. Since housing is national, regional and local, a map immediately came to my mind as an efficient way to depict the geographic information
2. A line chart would suit Zillow's time series data and explain numeric data with clear position encoding
3. And bar charts should be useful to compare states, counties, etc as those are considered categorical
4. Also small multiples should be useful to show related but different measurements together

And because Zillow's data is tabular text, nation-wide and presented by different levels, I:

1. Determined to use data of state, county, zip code levels for best coverage
2. Extracted data of related areas only to reduce complexity
3. Computed compound values to reduce complexity
4. Prioritized perspectives to guide viewers based on data importance, similarity and completeness
5. Tried out several GeoJSON sources and generated custom ones with APIs

To make the visualization more explanatory, comparison is needed. Known benchmarks include the viewer's home area and general concept. So I start with US states, CA counties and then drill down to SF Bay areas. Since the my main audience are potential home buyers, I want to focus more at SF Bay level. So I make this a martini-glass style narrative to explain the differences among states and CA counties via a quick animation and then narrow to zip codes of 6 core SF Bay counties for viewer's own exploration. 

Zillow's data is comprised with pricing indices, affordability ratios, market indices, etc continuous values, and organized by geo-levels, segments, perspectives, etc categorical values. So I decided to use gradient color saturation to encode continuous values on the top of categorical values encoded by different color hues.

First the maps are colored into choropleths for quick pricing comparison. Throughout the narrative missing data is represented by gray color (negative space) on the map to maintain consistency. 

On the author-driven part, I include a time series line chart for CA with inter-quartile lines as benchmarks. These benchmarks are drawn in dimmed and less saturate colors. And I make line of interest brighter and thicker for immediate pre-attentive processing. Throughout the narrative supporting benchmarks, notations and UI elements are in muted grayish-blue color to maintain consistency. 

In the viewer-driven part, the prioritized list is on the top to guide viewers. To compare and show each local market is special I included supporting lines and bars representing US and 2 nearby big cities on the charts. Small multiples are implemented to cater Zillow's multi-faceted data. Pre-attentive attributes of color saturation and hues are applied here as well. Here via the choropleths viewers can quickly get the idea that even in this generally expensive SF Bay Area, there are still much differences locally. And they can explore as they want.

While I showed the first working version to others, people did get a sense of SF Bay's ultra expensive and fluctuating market. But they found animation moved too fast and couldn't tell further details. So I added buttons for flow control and more description at the end for the author-driven part. For viewer-driven part people found the charts were good enough but serious house hunters would like to read more historical data. So I added mouse-over tooltip on the line chart to show values.

While working on my own I actually tried several different sketches too. For example I limited small multiples to maximum 2 rows after trying 3 on the screen. The reduced height actually made the charts harder to read and it's not much more helpful to show so much data. And I tried several subtle patterns/colors to differentiate US, San Francisco and San Jose but still put them grouped. 

While I showed the near-final version to others, I found one major problem - screen resolution. So I updated the settings to accommodate a minimum resolution of 1280x768. Another one was people found there's too much blank area on some charts which was actually due to outliers. So I included a second chart for those perspectives. 

Overall I got more feedback about interaction and information details. So more of my improvements were made on these.

----
## Feedback

**What do you notice in the visualization?**

1. Interesting animation but moving too fast
2. Color highlight makes it easy to compare
3. The drop down gives readers an overview of the topics/graphs
4. If you can reduce the huge blank space on the charts (outlier issues)
5. Can't read...charts are overlapped (resolution issue)

**What questions do you have about the data?**

1. Is the data real? That expensive?
2. Why some lines look so different? (due to missing raw data)
3. Line chart is nice but I want to know specific numbers
4. My zip code is not on the chart (data processing bug, fixed)

**What relationships do you notice?**

1. California is much pricier but what are other lines? (inter-quartile issue)
2. It's showing the dramatic up and down history over the years
3. I identified more and less expensive area immediately
4. The comparison against US, San Jose and San Francisco (multiple responses)

**What do you think is the main takeaway from this visualization?**

1. Save time in reading material or analyzing data
2. I was not looking in some areas due to prices. But after reading this I'll return to check because of possible negotiation room.
3. Already expensive areas actually grew much more expensive
4. Snapshots on topics of interests are helpful

**Is there something you don’t understand in the graphic?**

1. What do the colors mean? (very early before I added legend for gradient color)
2. What is quartile?
3. I didn't get the diverging colors immediately but after reading the description I got it
4. What is percentile?

----
## Resources

**General documentations**

* [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
* [https://developer.mozilla.org/en-US/docs/Web/SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
* [https://github.com/mbostock/d3/wiki](https://github.com/mbostock/d3/wiki)
* [http://bl.ocks.org/mbostock](http://bl.ocks.org/mbostock)
* [https://developers.google.com/maps/documentation/javascript/examples/](https://developers.google.com/maps/documentation/javascript/examples/)
* [http://stackoverflow.com/](http://stackoverflow.com/)

**Specific code blocks**

* [https://github.com/mbostock/d3/wiki/Geo-Projections](https://github.com/mbostock/d3/wiki/Geo-Projections)
* [http://bl.ocks.org/mbostock/4699541](http://bl.ocks.org/mbostock/4699541)
* [http://bl.ocks.org/mbostock/4707858](http://bl.ocks.org/mbostock/4707858)
* [http://bl.ocks.org/mbostock/7555321](http://bl.ocks.org/mbostock/7555321)
* [http://bl.ocks.org/mbostock/3902569](http://bl.ocks.org/mbostock/3902569)
* [http://tutorials.jenkov.com/svg/svg-gradients.html](http://tutorials.jenkov.com/svg/svg-gradients.html)

**Data sources**

* [http://www.zillow.com/research/data/](http://www.zillow.com/research/data/)
* [http://census.codeforamerica.org/](http://census.codeforamerica.org/)
* [http://www.zippopotam.us/](http://www.zippopotam.us/)
* [http://www.unitedstateszipcodes.org/zip-code-database/](http://www.unitedstateszipcodes.org/zip-code-database/)

**Market infomtion references**


* [http://www.zillow.com/home-values/](http://www.zillow.com/home-values/)
* [http://www.economist.com/blogs/graphicdetail/2015/11/daily-chart-0](http://www.economist.com/blogs/graphicdetail/2015/11/daily-chart-0)
* [http://observationsandnotes.blogspot.com/2011/06/us-housing-prices-since-1900.html](http://observationsandnotes.blogspot.com/2011/06/us-housing-prices-since-1900.html)
* [http://www.housingwire.com/blogs/1-rewired/post/31394-reasons-why-california-housing-is-about-to-go-bust](http://www.housingwire.com/blogs/1-rewired/post/31394-reasons-why-california-housing-is-about-to-go-bust)
* [http://www.cnbc.com/2015/10/06/housing-today-a-bubble-larger-than-2006.html](http://www.cnbc.com/2015/10/06/housing-today-a-bubble-larger-than-2006.html)