'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var commons = require('./commons');

module.exports = function() {

  ReactDOM.render(
     <commons.PageHeader>About...</commons.PageHeader>,
     document.getElementById('heading')
  );

  ReactDOM.render(
      <div>
      </div>,
     document.getElementById('container')
  );

}

