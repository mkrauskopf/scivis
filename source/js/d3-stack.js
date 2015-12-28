'use strict';

var d3 = require('d3');
var d3_ = require('./d3-utils');
var d3StackAbstr = require('./d3-stack-abstraction.js');
var d3StackList = require('./d3-stack-list.js');
var _ = require('lodash');

var stackSize = 6;
var animDuration = 250;

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
  var contW = 700, contH = 300;

  var svgContainer = d3.select(containerSelector).append('svg')
                                                 .attr('height', contH)
                                                 .attr('width', contW);
  d3_.appendLine(svgContainer, contW/3, 0, contW/3, contH, 1, '#ccc'); // vertical
  d3_.appendLine(svgContainer, contW/3, contH/2, contW, contH/2, 1, '#ccc'); // horizontal

  // main container border
  d3_.appendRectangle(svgContainer, 0, 0, contW, contH, '#ccc').style('fill', 'none');

  var stackAbstrSvg = svgContainer.append('g').attr('id', 'stackAbstr')
                                              .attr('height', contH)
                                              .attr('width', contW/3);

  var stackListSvg = svgContainer.append('g').attr('id', 'stackList')
                                             .attr('height', contH / 2)
                                             .attr('width', contW / 1.5)
                                             .attr('transform', d3_.translateStr(contW/3, 0));


  return new Stack([
      d3StackAbstr(stackAbstrSvg, stackSize, animDuration),
      d3StackList(stackListSvg, stackSize, animDuration)
  ]);
}

module.exports = {
  'createScene' : createScene
}

