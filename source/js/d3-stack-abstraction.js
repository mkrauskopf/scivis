'use strict';

var d3 = require('d3');
var d3Utils = require('./d3-utils');

var svgContainer;
var animDuration = 300;

var itemDim = {
  'startX': 4,
  'startY': 4,
  'width': 40,
  'height': 30,
  'padding': 4
}

var bodyDim = {
  'x': 80,
  'y': 60,
  'height': undefined,
  'width': undefined
}

var innerBodyFill;

function create(_svgContainer, stackSize) {
  svgContainer = prepareContainer(_svgContainer, stackSize);

  return {
    "stackSizeChanged": render
  }

}

function prepareContainer(svgContainer, stackSize) {
  // static stack body bellow
  bodyDim.height = stackSize * (itemDim.height + (itemDim.padding)) + itemDim.padding;
  bodyDim.width = itemDim.width + (itemDim.padding * 2);

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
      .attr('y', itemDim.startY + (itemDim.width / 2))
      .attr('text-anchor', 'middle')
      .text(function(d) { return d; });
  d3Utils.appendRectangle(addedItems, itemDim.startX, itemDim.startY, itemDim.width, itemDim.height, 'blue')
      .attr('fill', 'none');

  // animate push action on enter
  var computeY = function(i) {
    return getStackBottom() - ((i + 1) * (itemDim.height + itemDim.padding)) - (itemDim.startY / 2);
  }
  var targetItemX = bodyDim.x + (itemDim.padding / 2) - (itemDim.startX / 2);
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

