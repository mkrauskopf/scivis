'use strict';

var d3 = require('d3');
var d3_ = require('./d3-utils');
var _ = require('lodash');
var stackCommons = require('./d3-stack-commons');

var svgContainer;
var animDuration;
var stackSize;
var itemColors;

// 'undefined' to be computed based on parent container size
var bodyDim, innerBodyFill;
var itemDim = {
  'startX': 4,
  'startY': 4,
  'width': undefined,
  'height': undefined,
  'padding': 4
};

function create(_svgContainer, _stackSize, _animDuration, _itemColors) {
  svgContainer = _svgContainer;
  animDuration = _animDuration;
  stackSize = _stackSize;
  itemColors = _itemColors;

  computeDimensions(stackSize);
  drawStackBody();

  return { "stackSizeChanged": render }
}

/** Computes stack body and item dimensions based on parent container dimension. */
function computeDimensions(stackSize) {
  var containerDim = d3_.computeDimension(svgContainer);

  var width = 0.25, height = 0.65;
  bodyDim = { // center to parent container
    'x': (0.5 - (width / 2)) * containerDim.width,
    'y': (0.5 - (height / 2)) * containerDim.height,
    'width': width * containerDim.width,
    'height': height * containerDim.height
  };

  itemDim.width = bodyDim.width - (2 * itemDim.padding);
  itemDim.height = ((bodyDim.height - itemDim.padding) / stackSize) - itemDim.padding;
}

function drawStackBody() {
  // draw static stack body bellow
  // specify the path points
  var pathInfo = [{x:bodyDim.x, y:bodyDim.y},
                  {x:bodyDim.x, y:bodyDim.y + bodyDim.height},
                  {x:bodyDim.x, y:bodyDim.y + bodyDim.height},
                  {x:bodyDim.x + bodyDim.width, y:bodyDim.y + bodyDim.height},
                  {x:bodyDim.x + bodyDim.width, y:bodyDim.y}
                 ];

  var line = d3.svg.line().x(function(d){return d.x;})
                          .y(function(d){return d.y;})
                          .interpolate('linear');

  svgContainer.append('svg:path')
      .attr('d', line(pathInfo))
      .style('stroke-width', 2)
      .style('stroke', 'black')
      .style('fill', 'none');

  // fill of the stack which become visible when stack is full
  innerBodyFill = d3_
    .appendRectangle(svgContainer, bodyDim.x, bodyDim.y, bodyDim.width, bodyDim.height, 'none')
      .attr('fill', '#fcc')
      .attr('opacity', '0');
}

/** Renders and animates stack abstraction. */
function render(stack, onRenderingFinished) {
  // bind data
  var gItems = svgContainer.selectAll('g').data(stack.items);

  // D3 ENTER
  var addedItems = gItems.enter().append('g');

  stackCommons.appendItem(
      addedItems,
      {
        'x': itemDim.startX,
        'y': itemDim.startY,
        'width': itemDim.width,
        'height': itemDim.height
      },
      itemColors,
      _.identity,
      stackSize
  );

  // animate item on push action after entered
  var computeY = function(i) {
    return getStackBottom() - ((i + 1) * (itemDim.height + (itemDim.padding))) - (itemDim.startY / 2) + (itemDim.padding / 2);
  };
  var targetItemX = bodyDim.x - itemDim.startX + itemDim.padding;
  var full = stack.isFull();

  d3_.animTransformXY(animDuration, addedItems, [
      function(d,i) { return [targetItemX, 0] },
      function(d,i) { return [targetItemX, computeY(i)] }
  ]).each('end', function() { drawFullStatus(full); onRenderingFinished(); });

  // D3 UPDATE: no update section - items cannot be updated. Just added or removed.

  // D3 EXIT
  gItems.exit()
    .transition().duration(animDuration).attr('transform',
      d3_.translateStr(targetItemX, itemDim.startY))
    .each('start', function() { drawFullStatus(full); })
    .transition().attr('transform', d3_.translateStr(2 * targetItemX, 0)).style('opacity', 0)
    .each('end', function() { onRenderingFinished(); })
    .remove();
}

function drawFullStatus(isFull) {
  innerBodyFill.transition().duration(700).style('opacity', isFull ? 100 : 0);
}

function getStackBottom() {
  return bodyDim.y + bodyDim.height - 2;
}

module.exports = create;

