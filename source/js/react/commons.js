'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var PageHeader = React.createClass({
  render: function() {
    return (
      <h3 className='title text-center text-primary'>{this.props.children}</h3>
    );
  }
});

module.exports = {
  "PageHeader": PageHeader,
}
