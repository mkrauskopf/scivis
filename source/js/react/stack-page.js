'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var commons = require('./commons');
var d3stack = require('../d3-stack.js');

var stackSvg;
var stack;

var PageHeader = React.createClass({
  render: function() {
    return (
      <h3 className='title text-center text-primary'>{this.props.children}</h3>
    );
  }
});

// TODO: get rid of copy-paste. Make generic button for Push, Pop and RunDemo buttons.
var PushButton = React.createClass({
  handleClick: function(event) {
    stack.push(10);
  },

  render: function() {
    return (
      <button className='btn btn-block' onClick={this.handleClick}>Push</button>
    )
  }
});

var PopButton = React.createClass({
  handleClick: function(event) {
    stack.pop();
  },

  render: function() {
    return (
      <button className='btn btn-block' onClick={this.handleClick}>Pop</button>
    )
  }
});

var DemoButton = React.createClass({
  handleClick: function(event) {
    stack.runDemo();
  },

  render: function() {
    return (
      <button className='btn btn-block' onClick={this.handleClick}>Run Demo</button>
    )
  }
});

module.exports = function() {

  ReactDOM.render(
    <commons.PageHeader><strong>Stack</strong> data structure <small>visualization</small></commons.PageHeader>,
    document.getElementById('heading')
  );

  ReactDOM.render(
    <div className='row'>
      <div className='col-md-2'>
        <PushButton/>
        <PopButton/>
        <DemoButton/>
      </div>
      <div id='stackContainer' className='col-md-10 vis-container'></div>
    </div>,
    document.getElementById('container')
  );

  stackSvg = d3stack.createScene('#stackContainer');
  stack = d3stack.createEmptyStack(stackSvg);

}

