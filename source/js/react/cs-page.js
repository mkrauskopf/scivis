'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var commons = require('./commons');

module.exports = function() {

  ReactDOM.render(
     <commons.PageHeader>Computer Science <small>Visualization</small></commons.PageHeader>,
     document.getElementById('heading')
  );

  ReactDOM.render(
      <div>
        <div className='row'>
          <div className='col-md-1'>Bag</div>
          <div className='col-md-1'><a href="#" onclick="{this.handleClick}">Stack</a></div>
          <div className='col-md-1'>Queue</div>
        </div>
      </div>,
     document.getElementById('container')
  );

};

