'use strict';

var d3 = require('d3');
var _ = require('lodash');

function appendRectangle(svgContainer, x, y, w, h, color) {
  return svgContainer
    .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('height', h)
      .attr('width', w)
      .attr('stroke-width', 2)
      .attr('stroke', color ? color : 'black');
}

function appendLine(svgContainer, x1, y1, x2, y2, strokeWidth, color) {
  return svgContainer
    .append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke-width", strokeWidth)
      .attr("stroke", color);
}

function computeDimension(svgElement) {
  return {
    'width': svgElement.attr('width'),
    'height': svgElement.attr('height')
  }
}

function translateStr(x, y) {
  return 'translate(' + x + ', ' + y + ')';
}

function animTransformXY(dur, d3Selection, xyComputations) {
  if (typeof xyComputations === "function") {
    // allow to pass a function as well as array of functions
    xyComputations = [xyComputations]
  }
  _.forEach(xyComputations, function(xyComputation) {
    d3Selection = d3Selection.transition().duration(dur).attr('transform',
        function(d,i) { 
          var xy = xyComputation(d, i);
          return translateStr(xy[0], xy[1]);
        });
  });
  return d3Selection;
}

module.exports = {
  'appendRectangle' : appendRectangle,
  'appendLine' : appendLine,
  'computeDimension' : computeDimension,
  'translateStr' : translateStr,
  'animTransformXY' : animTransformXY
}

