'use strict';

var d3 = require('d3');

var itemDim = {
  'startX': 0,
  'startY': 0,
  'width': 40,
  'height': 30,
  'padding': 4
}

var maxNumberOfItems = 6;

var stackX = 80,
    stackY = 60,
    stackHeight;

function createEmptyStack(svgContainer) {

  var operations = [];

  var toAddQueue = [];
  var gStack = [];

  var runDemo = function (item) {
    toAddQueue.push(10);
    toAddQueue.push(2);
    toAddQueue.push(10);
    toAddQueue.push(5);
    toAddQueue.push(4);
    toAddQueue.push(100);
    refreshUI();
  }

  var push = function (item) {
    toAddQueue.push(item);
    refreshUI();
  }

  var pop = function () {
    var gItem = gStack.pop();
    if (!gItem) {
      return;
    }

    var stackBottom = stackY + stackHeight;
    var transY = (stackBottom - (gStack.length * (itemDim.height + itemDim.padding)));
    var transX = stackX + itemDim.padding;
    gItem.transition().duration(500).attr('transform', 'translate(' + transX + ', ' + itemDim.startY + ')')
         .transition().duration(500).attr('transform', 'translate(' + (2 * transX) + ', 0)').style('opacity', 0)
         .each('end', function() {refreshUI()});
  }

  return {
    'push': push,
    'pop': pop,
    'runDemo': runDemo
  }

  function refreshUI() {
    if (gStack.length >= maxNumberOfItems) {
      console.log("stack is full");
      return;
    }
    var item = toAddQueue.shift()
    if (!item) {
      return;
    }

    var gItem = svgContainer.append('g');
    appendRectangle(gItem, itemDim.startX, itemDim.startY, itemDim.width, itemDim.height, 'blue');
    appendText(gItem, itemDim.startX, itemDim.startY, itemDim.width, item);
    gStack.push(gItem);

    var stackBottom = stackY + stackHeight;
    var transY = (stackBottom - ((gStack.length) * (itemDim.height + itemDim.padding)));
    var transX = stackX + itemDim.padding;
    gItem.transition().duration(500).attr('transform', 'translate(' + transX + ', 0)')
         .transition().attr('transform', 'translate(' + transX + ', ' + transY + ')')
         .each('end', function() {refreshUI()});
  }
}

function appendText(svgContainer, x, y, w, text) {
  svgContainer.append('text')
    .attr('x', x + (w / 2))
    .attr('y', y + (w / 2))
    .attr('text-anchor', 'middle')
    .text(text);
}

function appendSquare(svgContainer, x, y, w, color) {
  return appendRectangle(svgContainer, x, y, w, w, color);
}

function appendRectangle(svgContainer, x, y, w, h, color) {
  return svgContainer
    .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('height', h)
      .attr('width', w)
      .attr('stroke-width', 2)
      .attr('stroke', color ? color : 'black')
      .attr('fill', 'white');
}

function createScene(containerSelector) {
  // stack body
  var stackWidth = itemDim.width + (itemDim.padding * 2);
  stackHeight = maxNumberOfItems * (itemDim.height + (itemDim.padding)) + itemDim.padding;

  var svgContainer = d3.select(containerSelector).append('svg').attr('height', stackHeight + 100);
  appendRectangle(svgContainer, stackX, stackY, stackWidth, stackHeight, 'green');

  return svgContainer;
}

module.exports = {
  'createScene' : createScene,
  'createEmptyStack' : createEmptyStack
}

