'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var commons = require('./commons');
var d3stack = require('../d3-stack.js');

var stack;

var PageHeader = React.createClass({
  render: function() {
    return (
      <h3 className='title text-center text-primary'>{this.props.children}</h3>
    );
  }
});

var StackButtons = React.createClass({

  getInitialState() {
    return { pushDisabled: false, popDisabled: true };
  },

  enableUI: function() {
    this.setState({ pushDisabled: stack.isFull(), popDisabled: stack.isEmpty() });
  },

  disableUI: function() {
    this.setState({ pushDisabled: true, popDisabled: true });
  },

  handlePush: function(event) {
    this.disableUI();
    var rand100 = Math.floor(Math.random() * 100);
    stack.push(rand100, this.enableUI);
  },

  handlePop: function(event) {
    this.disableUI();
    stack.pop(this.enableUI);
  },


  render: function() {
    return (
      <div>
        <button disabled={this.state.pushDisabled} className='btn btn-block' onClick={this.handlePush}>Push random</button>
        <button disabled={this.state.popDisabled} className='btn btn-block' onClick={this.handlePop}>Pop</button>
      </div>
    )
  }

});

module.exports = function() {

  ReactDOM.render(
    <commons.PageHeader><strong>Stack</strong> data structure <small>visualization</small></commons.PageHeader>,
    document.getElementById('heading')
  );

  ReactDOM.render(
    <div>
      <p>
        Visualization of <em>stack</em> data structure abstraction (fixed-size for now).
        Use <em>push</em> and <em>pop</em> buttons to manage stack items.<br/>
        Stack checks and indicates when it becomes full.
      </p>
      <div className='row'>
        <div className='col-md-2'>
          <StackButtons/>
        </div>
        <div id='stackContainer' className='col-md-10 vis-container'></div>
      </div>
    </div>,
    document.getElementById('container')
  );

  stack = d3stack.createScene('#stackContainer');

}

