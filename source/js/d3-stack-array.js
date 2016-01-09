'use strict';

var d3 = require('d3');
var d3_ = require('./d3-utils');

var svgContainer;
var animDuration;
var containerDim;
var containerXPadding = 0.1;

// 'undefined' to be computed based on parent container size
var bodyDim, innerBodyFill;
var itemDim = {
  'startX': 4,
  'exitX': undefined,
  'startY': 4,
  'width': undefined,
  'height': undefined,
  'padding': 4
};

function create(_svgContainer, stackSize, _animDuration) {
  svgContainer = _svgContainer;
  animDuration = _animDuration;

  computeDimensions(stackSize);
  drawArrayContainer();

  return { 'stackSizeChanged': render }
}

/** Computes dimensions for array container based on parent container dimension. */
function computeDimensions(stackSize) {
  containerDim = d3_.computeDimension(svgContainer);

  var width = 0.75, height = 0.25;
  bodyDim = { // center to parent container
    'x': (0.5 - (width / 2)) * containerDim.width,
    'y': (0.5 - (height / 2)) * containerDim.height,
    'width': width * containerDim.width,
    'height': height * containerDim.height
  };

  itemDim.width = ((bodyDim.width - itemDim.padding) / stackSize) - itemDim.padding;
  itemDim.height = bodyDim.height - (2 * itemDim.padding);
  itemDim.exitX = containerDim.width - itemDim.width;
  console.log("MK>   itemDim: ", itemDim);
}

function drawArrayContainer() {
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

/** Renders and animates stack array items. */
function render(stack, onRenderingFinished) {
  // bind data
  var gItems = svgContainer.selectAll('g').data(stack.items);

  // D3 ENTER
  var addedItems = gItems.enter().append('g');
  addedItems.append('text')
      .attr('x', itemDim.startX + (itemDim.width / 2))
      .attr('y', itemDim.startY + (itemDim.height / 2))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(function(d) { return d; });
  d3_.appendRectangle(addedItems, itemDim.startX, itemDim.startY, itemDim.width, itemDim.height, 'blue')
     .attr('fill', 'none');

  // animate push action on enter
  var computeX = function(i) {
    return getStackLeft() + (i * (itemDim.width + (itemDim.padding))) - (itemDim.startX / 2) + (itemDim.padding / 2);
  };
  var targetItemY = bodyDim.y - itemDim.startY + itemDim.padding;
  var full = stack.isFull();

  d3_.animTransformXY(animDuration, addedItems, [
      function(d,i) { return [computeX(i), 0] },
      function(d,i) { return [computeX(i), targetItemY] }
  ]).each('end', function() { drawFullStatus(full); onRenderingFinished(); });

  // D3 UPDATE: no update section - items cannot be updated. Just added or removed.

  // D3 EXIT
  d3_.animTransformXY(animDuration, gItems.exit(),
      function(d,i) { return [computeX(i), itemDim.startY] })
    .each('start', function() { drawFullStatus(full); })
    .transition().attr('transform', d3_.translateStr(itemDim.exitX, itemDim.startX)).style('opacity', 0)
    .each('end', function() { onRenderingFinished(); })
    .remove();
}

function drawFullStatus(isFull) {
  innerBodyFill.transition().duration(700).style('opacity', isFull ? 100 : 0);
}

function getStackLeft() {
  return bodyDim.x;
}

function containerMidY() {
  return containerDim.height / 2;
}

module.exports = create;