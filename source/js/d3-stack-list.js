'use strict';

var d3 = require('d3');
var d3_ = require('./d3-utils');

var svgContainer;
var animDuration;
var containerDim;
var containerXPadding = 0.1;

// 'undefined' to be computed based on parent container size
var itemDim = {
  'startX': 4,
  'startY': 4,
  'width': undefined,
  'height': undefined
};

var linkLength;

function create(_svgContainer, stackSize, _animDuration) {
  svgContainer = _svgContainer;
  animDuration = _animDuration;

  computeDimensions(stackSize);

  return { 'stackSizeChanged': render }
}

/** Computes item dimension based on parent container dimension. */
function computeDimensions(stackSize) {
  containerDim = d3_.computeDimension(svgContainer);

  var itemsAndLink = (2 * stackSize - 1);
  var containerInnerPlace = (1 - (2 * containerXPadding)) * containerDim.width;
  linkLength = itemDim.width = Math.max(containerInnerPlace / itemsAndLink);
  itemDim.height = 30;
}

/** Renders and animates stack abstraction. */
function render(stack, onRenderingFinished) {
  var gItems = svgContainer.selectAll('g.item').data(stack.items);
  var gLinks = svgContainer.selectAll('g.link').data(stack.items.slice(1));
  enterNewItems(gItems.enter().append('g').attr('class', 'item'));
  updateItems(gItems, gLinks, stack.items.length, onRenderingFinished);
  exitItems(gItems.exit(), gLinks.exit(), onRenderingFinished);
}

function enterNewItems(gItems) {
  // draw item on start position (box with text)
  d3_.appendRectangle(gItems, itemDim.startX, itemDim.startY, itemDim.width, itemDim.height, 'blue')
    .attr('fill', 'none');
  gItems.append('text')
    .attr('x', itemDim.startX + (itemDim.width / 2))
    .attr('y', itemDim.startY + (itemDim.height / 2))
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text(function(d) { return d; });
}

function updateItems(gItems, gLinks, currentStackLength, onRenderingFinished) {
  // move current items...
  var yItemDelta = containerMidY() - (itemDim.height / 2) - itemDim.startY;
  d3_.animTransformXY(animDuration, gItems, function(d,i) {
    return [ xItemDelta(i, currentStackLength), yItemDelta ];
  }).call(d3_.endAll, function() {
    // ... and append link for newly added node
    if (currentStackLength > 1) {
      drawFirstLink(onRenderingFinished);
    } else {
      onRenderingFinished();
    }
  });

  // move current links
  var linksToMove = gLinks.filter(function(d,i) {return i < currentStackLength});
  d3_.animTransformXY(animDuration, linksToMove,
      function(d,i) { return [xLinkDelta(i, currentStackLength), containerMidY()] });
}

function exitItems(gItems, gLinks, onRenderingFinished) {
  d3_.animTransformXY(animDuration, gItems, function(d,i) { return [0, 0] }).remove()
     .call(d3_.endAll, onRenderingFinished);
  gLinks.remove();
}

/** Computes x-delta  of item from start position. */
function xItemDelta(i, currentStackLength) {
  var start = containerXPadding * containerDim.width - itemDim.startX;
  var visualIndex0 = Math.abs(i + 1 - currentStackLength); // 0-based
  return start + (visualIndex0 * (itemDim.width + linkLength));
}

/** Computes x-delta of link from start position. */
function xLinkDelta(i, currentStackLength) {
  return xItemDelta(i + 1, currentStackLength) + itemDim.width + 4
}

function drawFirstLink(onRenderingFinished) {
  var linkStartX = xItemDelta(0, 1) + itemDim.width + 4;

  // main group containing arrow drawing
  var gLink = svgContainer.append('g')
      .attr('transform', d3_.translateStr(linkStartX, containerMidY()))
      .attr('class', 'link');

  // inner group initial set to zero width
  var scaledGroup = gLink.append('g').attr('transform', 'scale(0, 1)');

  // main line within scaled group
  scaledGroup.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', linkLength)
    .attr('y2', 0)
    .attr('stroke-width', 2)
    .attr('stroke', 'black');

  // enlarge scaled group from 0% to 100%
  scaledGroup
    .transition().duration(animDuration)
    .attr('transform', 'scale(1, 1)')
    .each('end', function() { onRenderingFinished() });
}

function containerMidY() {
  return containerDim.height / 2;
}

module.exports = create;
