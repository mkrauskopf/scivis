'use strict';

var d3 = require('d3');
var d3Utils = require('./d3-utils');
var d3StackAbstr = require('./d3-stack-abstraction.js');
var _ = require('underscore');

var stackSize = 6;

function Stack(listeners) {

  var self = this;

  this.items = [];

  /**
   * Pops item from the stack.
   *
   * @param onFinish - callback which will be called on the end of the rendering phase
   */
  this.pop = function(onFinish) {
    if (!this.isEmpty()) {
      this.items.pop();
      notifySizeChanged(onFinish);
    }
  }

  /**
   * Push item to the stack.
   *
   * @param itemText - will be renderer as item's text
   * @param onFinish - callback which will be called on the end of the rendering phase
   */
  this.push = function(itemText, onFinish) {
    if (this.items.length < stackSize) {
      this.items.push(itemText);
      notifySizeChanged(onFinish);
    }
  }

  this.isFull = function() {
    return this.items.length === stackSize;
  }

  this.isEmpty = function() {
    return this.items.length === 0;
  }

  function notifySizeChanged(onFinish) {
    _.each(listeners, function(listener) { listener.stackSizeChanged(self, onFinish); });
  }

}

/**
 * Creates SVG scene with empty stack and returns a stack object.
 */
function createScene(containerSelector) {
  var containerWidth = 600, containerHeight = 400;

  var svgContainer = d3.select(containerSelector).append('svg')
                                                 .attr('height', containerHeight)
                                                 .attr('width', containerWidth);
  // main container border
  d3Utils.appendRectangle(svgContainer, 0, 0, containerWidth, containerHeight, '#ccc').style('fill', 'none');

  var stackAbstrSvg = svgContainer.append('g').attr('id', 'stackAbstr')
                                              .attr('height', containerHeight)
                                              .attr('width', 200);


  var d3StackAbstrInst = d3StackAbstr(stackAbstrSvg, stackSize);

  // vertical separators
  _.each([200, 400], function(x) {
    d3Utils.appendLine(svgContainer, x, 0, x, containerHeight, 1, '#ccc');
  });

  return new Stack([d3StackAbstrInst]);
}

module.exports = {
  'createScene' : createScene
}

