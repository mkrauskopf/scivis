'use strict';

var d3 = require('d3');
var d3Utils = require('./d3-utils');
var _ = require('underscore');

var itemDim = {
  'startX': 4,
  'startY': 4,
  'width': 40,
  'height': 30,
  'padding': 4
}

var maxNumberOfItems = 6;

var containerHeight,
    containerWidth = 600;

var stackDim = {
    'x': 80,
    'y': 60,
    'height': undefined,
    'width': undefined
}

var stackInner;

var animDuration = 300;

function createEmptyStack(svgContainer) {

  // contains SVG items representations
  var stack = [];

  // contains 'g' items currently being removed. Used to drive D3.js remove-item translation.
  var beingRemoved = [];

  var pop = function(onFinish) {
    if (stack.length == 0) {
      return;
    }
    stack.pop();
    render(onFinish);
  }

  var push = function(itemText, onFinish) {
    if (stack.length >= maxNumberOfItems) {
      return;
    }
    stack.push(itemText);
    render(onFinish);
  }

  function render(onFinish) {
    // bind data
    var gItems = svgContainer.selectAll('g').data(stack);

    // enter
    var addedItems = gItems.enter().append('g');
    addedItems.append('text')
        .attr('x', itemDim.startX + (itemDim.width / 2))
        .attr('y', itemDim.startY + (itemDim.width / 2))
        .attr('text-anchor', 'middle')
        .text(function(d) { return d; });
    addedItems.append('rect')
        .attr('x', itemDim.startX)
        .attr('y', itemDim.startY)
        .attr('width', itemDim.width)
        .attr('height', itemDim.height)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke', 'blue');

    // animate push action on enter
    var computeY = function(i) {
      return getStackBottom() - ((i + 1) * (itemDim.height + itemDim.padding)) - (itemDim.startY / 2);
    }
    var targetItemX = stackDim.x + (itemDim.padding / 2) - (itemDim.startX / 2);
    var full = isFull();
    addedItems
      .transition().duration(animDuration).attr('transform',
          function(d,i) { return 'translate(' + targetItemX + ', 0)' })
      .transition().attr('transform',
          function(d,i) { return 'translate(' + targetItemX + ', ' + computeY(i) + ')' })
      .each('end', function() { drawFullStatus(full); onFinish(); });

    // no update section - items cannot be updated. Just added or removed.

    // exit
    var transY = (getStackBottom() - (stack.length * (itemDim.height + itemDim.padding)));
    gItems.exit()
      .filter(function(i, d) { return !_.contains(beingRemoved, i); })
      .each(function(i, d) { beingRemoved.push(i); })
      .transition().duration(animDuration).attr('transform',
        'translate(' + targetItemX + ', ' + itemDim.startY + ')')
      .transition().attr(
        'transform', 'translate(' + (2 * targetItemX) + ', 0)').style('opacity', 0)
      .each('end', function() { drawFullStatus(full); onFinish(); })
      .remove();

  }

  function isFull() {
    return stack.length === maxNumberOfItems;
  }

  function isEmpty() {
    return stack.length === 0;
  }

  function drawFullStatus(isFull) {
    stackInner.transition().duration(700).style('opacity', isFull ? 100 : 0);
  }

  function randInt() {
    return Math.floor(Math.random() * 100);
  }

  function getStackBottom() {
    return stackDim.y + stackDim.height - 2;
  }

  return {
    'push': push,
    'pop': pop,
    'isFull': isFull,
    'isEmpty': isEmpty,
    'randInt': randInt
  }

}

function createScene(containerSelector) {
  stackDim.height = maxNumberOfItems * (itemDim.height + (itemDim.padding)) + itemDim.padding;
  containerHeight = stackDim.height + 100;
  var svgContainerMain = d3.select(containerSelector).append('svg')
                                                 .attr('height', containerHeight)
                                                 .attr('width', containerWidth);
  var svgContainer = svgContainerMain.append('g');
  // svg border
  d3Utils.appendRectangle(svgContainer, 0, 0, containerWidth, containerHeight, "#ccc").style('fill', 'none');

  drawStackBody(svgContainer);

  // vertical separator
  var sepX = (stackDim.x + (stackDim.width / 2)) * 2;
  d3Utils.appendLine(svgContainer, sepX, 0, sepX, containerHeight, 1, "#ccc");

  return svgContainer;
}

function drawStackBody(svgContainer) {
  stackDim.width = itemDim.width + (itemDim.padding * 2);

  // Specify the path points
  var pathInfo = [{x:stackDim.x, y:stackDim.y},
                  {x:stackDim.x, y:stackDim.y + stackDim.height},
                  {x:stackDim.x, y:stackDim.y + stackDim.height},
                  {x:stackDim.x + stackDim.width, y:stackDim.y + stackDim.height},
                  {x:stackDim.x + stackDim.width, y:stackDim.y}
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
  stackInner = d3Utils
    .appendRectangle(svgContainer, stackDim.x, stackDim.y, stackDim.width, stackDim.height, "none")
      .attr('fill', '#fcc')
      .attr('opacity', '0');

}

module.exports = {
  'createScene' : createScene,
  'createEmptyStack' : createEmptyStack
}

