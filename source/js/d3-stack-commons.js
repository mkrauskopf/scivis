'use strict';

var exports = {};

var d3 = require('d3');
var d3_ = require('./d3-utils');

exports.appendItem = function(d3Selection, itemRect, colorFun, textFun, stackSize) {
  // item box
  d3_.appendRectangle(d3Selection, itemRect)
      .attr('fill', function(d, i) { return colorFun(Math.abs(i - stackSize) - 1) } );

  // item text
  d3Selection.append('text')
      .attr('x', itemRect.x + (itemRect.width / 2))
      .attr('y', itemRect.y + (itemRect.height / 2))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(textFun);
};

module.exports = exports;
