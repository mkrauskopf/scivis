'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var commons = require('./commons');
var d3stack = require('../d3-stack.js');

var stack;

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
        Below is visualization of stack data structure from three different perspecitves:
      </p>
      <ul>
        <li><em>Abstraction</em>: data structure wihtout showing how data are represented.</li>
        <li><em>Implementation based on array</em>: imlementation where stack items are kept in array data structure</li>
        <li><em>Implementation based on linked-list</em>: imlementation where stack items are kept within linked list data structure</li>
      </ul>
      <p>
        Currently stack is of fixed-size and allows two operations:
      </p>
      <ul>
        <li><em>Push</em> adds random integer onto a stack</li>
        <li><em>Pop</em> pops item from top of a stack</li>
      </ul>
      <p>
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

};

