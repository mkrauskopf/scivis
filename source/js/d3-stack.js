'use strict';

var d3 = require('d3');
var d3_ = require('./d3-utils');
var d3StackAbstr = require('./d3-stack-abstraction.js');
var d3StackList = require('./d3-stack-list.js');
var d3StackArray = require('./d3-stack-array.js');
var _ = require('lodash');

var stackSize = 6;
var animDuration = 250;

function Stack(listeners) {

  var self = this;

  this.items = [];

  /**
   * Pops item from the stack.
   *
   * @param onRenderingFinished - callback which will be called on the end of the rendering phase
   */
  this.pop = function(onRenderingFinished) {
    if (!this.isEmpty()) {
      this.items.pop();
      notifySizeChanged(onRenderingFinished);
    }
  };

  /**
   * Push item to the stack.
   *
   * @param itemText - will be renderer as item's text
   * @param onRenderingFinished - callback which will be called on the end of the rendering phase
   */
  this.push = function(itemText, onRenderingFinished) {
    if (this.items.length < stackSize) {
      this.items.push(itemText);
      notifySizeChanged(onRenderingFinished);
    }
  };

  this.isFull = function() {
    return this.items.length === stackSize;
  };

  this.isEmpty = function() {
    return this.items.length === 0;
  };

  /**
   * Notifies all renderers about stack size change such that they can redraw their scene. When all renderers are done
   * with reacting to the event 'onRenderingFinished' callback is called.
   */
  function notifySizeChanged(onRenderingFinished) {
    var nOfFinished = 0;
    function onOneFinish() {
      if (++nOfFinished == listeners.length) {
        onRenderingFinished();
      }
    }
    _.each(listeners, function(listener) {
      listener.stackSizeChanged(self, onOneFinish);
    });
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
  var contW3 = contW / 3;
  d3_.appendLine(svgContainer, contW3, 0, contW3, contH, 1, '#ccc'); // vertical
  d3_.appendLine(svgContainer, contW3, contH/2, contW, contH/2, 1, '#ccc'); // horizontal

  // main container border
  d3_.appendRectangle(svgContainer, 0, 0, contW, contH, '#ccc').style('fill', 'none');

  var stackAbstrSvg = svgContainer.append('g').attr('id', 'stackAbstr')
                                              .attr('height', contH)
                                              .attr('width', contW3);

  var stackListSvg = d3_.appendGroup(svgContainer, contW3, 0, contW / 1.5, contH / 2)
                        .attr('id', 'stackList');

  var stackArraySvg = d3_.appendGroup(svgContainer, contW3, contH / 2, contW / 1.5, contH / 2)
                         .attr('id', 'stackArray');

  return new Stack([
      d3StackAbstr(stackAbstrSvg, stackSize, animDuration),
      d3StackList(stackListSvg, stackSize, animDuration),
      d3StackArray(stackArraySvg, stackSize, animDuration)
  ]);
}

module.exports = {
  'createScene' : createScene
};

