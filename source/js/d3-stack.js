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

var stackInner;

function createEmptyStack(svgContainer) {

  // contains SVG items representations
  var gStack = [];

  var pop = function() {
    if (gStack.length == 0) {
      return;
    }

    // animate pop action
    var transY = (getStackBottom() - (gStack.length * (itemDim.height + itemDim.padding)));
    var transX = stackX + itemDim.padding;
    gStack.pop().transition().duration(500).attr('transform', 'translate(' + transX + ', ' + itemDim.startY + ')')
                .transition().duration(500).attr('transform', 'translate(' + (2 * transX) + ', 0)').style('opacity', 0);

    drawFullStatus(isFull());
  }

  var push = function(itemText) {
    if (gStack.length >= maxNumberOfItems) {
      return;
    }
    var gItem = drawItem(itemText);
    gStack.push(gItem);
    var full = isFull();

    // animate push action
    var transY = (getStackBottom() - ((gStack.length) * (itemDim.height + itemDim.padding)));
    var transX = stackX + itemDim.padding;
    gItem.transition().duration(500).attr('transform', 'translate(' + transX + ', 0)')
         .transition().attr('transform', 'translate(' + transX + ', ' + transY + ')')
         .each('end', function() { drawFullStatus(full) });
  }

  function isFull() {
    return gStack.length === maxNumberOfItems;
  }

  function drawFullStatus(isFull) {
    stackInner.transition().duration(100).style('opacity', isFull ? 100 : 0);
  }

  function drawItem(itemText) {
    var gItem = svgContainer.append('g');
    appendRectangle(gItem, itemDim.startX, itemDim.startY, itemDim.width, itemDim.height, 'blue')
                   .attr('fill', 'none');
    appendText(gItem, itemDim.startX, itemDim.startY, itemDim.width, itemText);
    return gItem;
  }

  function randInt() {
    return Math.floor(Math.random() * 100);
  }

  function getStackBottom() {
    return stackY + stackHeight;
  }

  return {
    'push': push,
    'pop': pop,
    'randInt': randInt
  }

}

function appendText(svgContainer, x, y, w, text) {
  svgContainer.append('text')
    .attr('x', x + (w / 2))
    .attr('y', y + (w / 2))
    .attr('text-anchor', 'middle')
    .text(text);
}

function appendRectangle(svgContainer, x, y, w, h, color) {
  return svgContainer
    .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('height', h)
      .attr('width', w)
      .attr('stroke-width', 2)
      .attr('stroke', color ? color : 'black');
}

function createScene(containerSelector) {
  stackHeight = maxNumberOfItems * (itemDim.height + (itemDim.padding)) + itemDim.padding;
  var svgContainer = d3.select(containerSelector).append('svg').attr('height', stackHeight + 100);
  drawStackBody(svgContainer);
  return svgContainer;
}

function drawStackBody(canvas) {
  var stackWidth = itemDim.width + (itemDim.padding * 2);

  // Specify the path points
  var pathInfo = [{x:stackX, y:stackY},
                  {x:stackX, y:stackY + stackHeight},
                  {x:stackX, y:stackY + stackHeight},
                  {x:stackX + stackWidth, y:stackY + stackHeight},
                  {x:stackX + stackWidth, y:stackY}
                 ]

  var line = d3.svg.line().x(function(d){return d.x;})
                            .y(function(d){return d.y;})
                            .interpolate('linear');

  canvas.append('svg:path')
      .attr('d', line(pathInfo))
      .style('stroke-width', 2)
      .style('stroke', 'black')
      .style('fill', 'none');

  // fill of the stack which become visible when stack is full
  stackInner = appendRectangle(canvas, stackX, stackY, stackWidth, stackHeight, "none")
                              .attr('fill', '#fcc')
                              .attr('opacity', '0');

}

module.exports = {
  'createScene' : createScene,
  'createEmptyStack' : createEmptyStack
}

