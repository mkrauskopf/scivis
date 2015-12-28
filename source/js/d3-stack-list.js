'use strict';

var d3 = require('d3');
var d3_ = require('./d3-utils');

var svgContainer;
var animDuration;
var containerDim;

// 'undefined' to be computed based on parent container size
var itemDim = {
  'startX': 4,
  'startY': 4,
  'width': undefined,
  'height': undefined
}

var arrowLength;

function create(_svgContainer, stackSize, _animDuration) {
  svgContainer = _svgContainer;
  animDuration = _animDuration;

  computeDimensions(stackSize);

  return { "stackSizeChanged": render }
}

/** Computes item dimension based on parent container dimension. */
function computeDimensions(stackSize) {
  containerDim = d3_.computeDimension(svgContainer);

  var itemsAndArrow = (2 * stackSize - 1);
  arrowLength = itemDim.width = Math.max(0.8 * containerDim.width / itemsAndArrow);
  itemDim.height = 30;
}

/** Renders and animates stack abstraction. */
function render(stack, onFinish) {
  var gItems = svgContainer.selectAll('g').data(stack.items);
  enterNewItems(gItems.enter().append('g'));
  updateItems(gItems, stack.items.length);
  exitItems(gItems.exit(), stack.items.length);
}

function enterNewItems(addedItems) {
  addedItems.append('text')
    .attr('x', itemDim.startX + (itemDim.width / 2))
    .attr('y', itemDim.startY + (itemDim.height / 2))
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text(function(d) { return d; });

  d3_.appendRectangle(addedItems, itemDim.startX, itemDim.startY, itemDim.width, itemDim.height, 'blue')
    .attr('fill', 'none');
}

function computeX(i, currentStackLength) {
  return Math.abs(i - currentStackLength) * (itemDim.width + arrowLength);
}

function updateItems(items, currentStackLength) {
  d3_.animTransformXY(animDuration, items, function(d,i) {
   return [ computeX(i, currentStackLength) - arrowLength, (containerDim.height / 2) - (itemDim.height / 2) ];
  });
}

function exitItems(items, currentStackLength) {
  d3_.animTransformXY(animDuration, items, function(d,i) {
   return [ computeX(i, currentStackLength), 0 ];
  }).remove();
}

module.exports = create;
