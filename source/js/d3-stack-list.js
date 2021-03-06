'use strict';

var d3 = require('d3');
var d3_ = require('./d3-utils');
var _ = require('lodash');
var stackCommons = require('./d3-stack-commons');

var svgContainer;
var animDuration;
var stackSize;
var itemColors;
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

function createScene(_svgContainer, _stackSize, _animDuration, _itemColors) {
  svgContainer = _svgContainer;
  animDuration = _animDuration;
  stackSize = _stackSize;
  itemColors = _itemColors;

  computeDimensions(stackSize);

  stackCommons.drawTitle(_svgContainer, "List-based Stack Implementation", 5, containerDim.height - 5);

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
  var isPush = stack.items.length > gItems.size();
  enterNewItems(gItems.enter().append('g').attr('class', 'item'));
  updateItems(gItems, gLinks, stack.items.length, isPush, onRenderingFinished);
  exitItems(gItems.exit(), gLinks.exit(), onRenderingFinished);
}

function enterNewItems(gItems) {
  // draw item on start position (box with text)
  stackCommons.appendItem(
      gItems,
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
}

function updateItems(gItems, gLinks, currentStackLength, isPush, onRenderingFinished) {
  // move current items...
  var yItemDelta = containerMidY() - (itemDim.height / 2) - itemDim.startY;
  d3_.animTransformXY(animDuration, gItems, function(d,i) {
    return [ xItemDelta(i, currentStackLength), yItemDelta ];
  }).call(d3_.endAll, function() {
    // ... and append link for newly added node
    if (isPush && currentStackLength > 1) {
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

  // draw arrow
  d3_.appendLine(scaledGroup, 0, 0, linkLength, 0, 2, 'black'); // main line of the arrow
  [5, -5].forEach(function(yDelta) { // side lines of the arrow
    d3_.appendLine(scaledGroup, linkLength - 10, yDelta, linkLength, 0, 2, 'black');
  });

  // enlarge scaled group from 0% to 100%
  scaledGroup
    .transition().duration(animDuration)
    .attr('transform', 'scale(1, 1)')
    .each('end', function() { onRenderingFinished() });
}

function containerMidY() {
  return containerDim.height / 2;
}

module.exports = createScene;
