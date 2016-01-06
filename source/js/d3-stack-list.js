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
  var lineLinks = svgContainer.selectAll('line.link').data(stack.items.slice(1));
  enterNewItems(gItems.enter().append('g').attr('class', 'item'));
  updateItems(gItems, lineLinks, stack.items.length, onRenderingFinished);
  exitItems(gItems.exit(), lineLinks.exit(), onRenderingFinished);
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

function updateItems(gItems, lineLinks, currentStackLength, onRenderingFinished) {
  // move current items
  var yItemDelta = containerMidY() - (itemDim.height / 2) - itemDim.startY;
  d3_.animTransformXY(animDuration, gItems, function(d,i) {
    return [ xItemDelta(i, currentStackLength), yItemDelta ];
  }).call(d3_.endAll, function() {
    if (currentStackLength > 1) {
      drawFirstLink(onRenderingFinished);
    } else {
      onRenderingFinished();
    }
  });

  // move current links
  var lineStartX = xItemDelta(0, 1) + itemDim.width + 4;
  lineLinks
    .filter(function(d,i) {return i < currentStackLength})
    .transition().duration(animDuration)
    .attr("x1", function(d, i) { return xLinkDelta(i, currentStackLength) })
    .attr("x2", function(d, i) { return xLinkDelta(i, currentStackLength) + linkLength });
}

function exitItems(gItems, lineLinks, onRenderingFinished) {
  d3_.animTransformXY(animDuration, gItems, function(d,i) { return [0, 0] }).remove()
     .call(d3_.endAll, onRenderingFinished);
  lineLinks.remove();
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
  var lineStartX = xItemDelta(0, 1) + itemDim.width + 4;
  var lineLinks = svgContainer.append('line')
    .attr('class', 'link')
    .attr("x1", lineStartX)
    .attr("y1", containerMidY())
    .attr("x2", lineStartX)
    .attr("y2", containerMidY())
    .attr("stroke-width", 2)
    .attr("stroke", "black")
    .transition().duration(animDuration)
    .attr("x2", lineStartX + linkLength)
    .each('end', function() { onRenderingFinished(); });
}

function containerMidY() {
  return containerDim.height / 2;
}

module.exports = create;
