'use strict';

var d3 = require('d3');

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

module.exports = {
  'appendRectangle' : appendRectangle,
  'appendLine' : appendLine
}

