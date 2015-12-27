'use strict';

var d3 = require('d3');
var d3Utils = require('./d3-utils');

var svgContainer;
var animDuration = 250;

// 'undefined' to be computed based on parent container size
var bodyDim = undefined;
var itemDim = {
  'startX': 4,
  'startY': 4,
  'width': undefined,
  'height': undefined,
  'padding': 3
}


var innerBodyFill;

function create(_svgContainer, stackSize) {
  svgContainer = prepareContainer(_svgContainer, stackSize);

  return {
    "stackSizeChanged": render
  }

}

function prepareContainer(svgContainer, stackSize) {
  var containerWidth = svgContainer.attr('width');
  var containerHeight = svgContainer.attr('height');

  bodyDim = { // center to parent container
    'height': 0.7 * containerHeight,
    'y': 0.15 * containerHeight,
    'width': 0.25 * containerWidth,
    'x': 0.375 * containerWidth
  }

  itemDim.width = bodyDim.width - (2 * itemDim.padding);
  itemDim.height = (bodyDim.height / stackSize) - (2 * itemDim.padding);

  // draw static stack body bellow
  // specify the path points
  var pathInfo = [{x:bodyDim.x, y:bodyDim.y},
                  {x:bodyDim.x, y:bodyDim.y + bodyDim.height},
                  {x:bodyDim.x, y:bodyDim.y + bodyDim.height},
                  {x:bodyDim.x + bodyDim.width, y:bodyDim.y + bodyDim.height},
                  {x:bodyDim.x + bodyDim.width, y:bodyDim.y}
                 ]

  var line = d3.svg.line().x(function(d){return d.x;})
                          .y(function(d){return d.y;})
                          .interpolate('linear');

  svgContainer.append('svg:path')
      .attr('d', line(pathInfo))
      .style('stroke-width', 2)
      .style('stroke', 'black')
      .style('fill', 'none');

  // fill of the stack which become visible when stack is full
  innerBodyFill = d3Utils
    .appendRectangle(svgContainer, bodyDim.x, bodyDim.y, bodyDim.width, bodyDim.height, 'none')
      .attr('fill', '#fcc')
      .attr('opacity', '0');

  return svgContainer;
}

/** Renders and animates stack abstraction part. */
function render(stack, onFinish) {
  // bind data
  var gItems = svgContainer.selectAll('g').data(stack.items);

  // enter
  var addedItems = gItems.enter().append('g');
  addedItems.append('text')
      .attr('x', itemDim.startX + (itemDim.width / 2))
      .attr('y', itemDim.startY + (itemDim.height / 2))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(function(d) { return d; });
  d3Utils.appendRectangle(addedItems, itemDim.startX, itemDim.startY, itemDim.width, itemDim.height, 'blue')
      .attr('fill', 'none');

  // animate push action on enter
  var computeY = function(i) {
    return getStackBottom() - ((i + 1) * (itemDim.height + (2 * itemDim.padding))) - (itemDim.startY / 2) + itemDim.padding
  }
  var targetItemX = bodyDim.x - itemDim.startX + itemDim.padding;
  var full = stack.isFull();
  addedItems
    .transition().duration(animDuration).attr('transform',
        function(d,i) { return 'translate(' + targetItemX + ', 0)' })
    .transition().attr('transform',
        function(d,i) { return 'translate(' + targetItemX + ', ' + computeY(i) + ')' })
    .each('end', function() { drawFullStatus(full); onFinish(); });

  // no update section - items cannot be updated. Just added or removed.

  // exit
  var transY = (getStackBottom() - (stack.items.length * (itemDim.height + itemDim.padding)));
  gItems.exit()
    .transition().duration(animDuration).attr('transform',
      'translate(' + targetItemX + ', ' + itemDim.startY + ')')
    .each('start', function() { drawFullStatus(full); })
    .transition().attr(
      'transform', 'translate(' + (2 * targetItemX) + ', 0)').style('opacity', 0)
    .each('end', function() { onFinish(); })
    .remove();
}

function drawFullStatus(isFull) {
  innerBodyFill.transition().duration(700).style('opacity', isFull ? 100 : 0);
}

function getStackBottom() {
  return bodyDim.y + bodyDim.height - 2;
}

module.exports = create;

