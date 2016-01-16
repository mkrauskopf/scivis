'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var commons = require('./commons');

var stackPage = require('./stack-page');

var SubMenu = React.createClass({

  render: function() {
    return(
       <div>
         <div className='row'>
           <div className='col-md-1'>Bag</div>
           <div className='col-md-1'>
             <a href="#" onClick={stackPage}>Stack</a>
           </div>
           <div className='col-md-1'>Queue</div>
         </div>
       </div>
    )
  }

});

module.exports = function() {

  ReactDOM.render(
     <commons.PageHeader>Computer Science <small>Visualization</small></commons.PageHeader>,
     document.getElementById('heading')
  );

  ReactDOM.render(
     <SubMenu/>,
     document.getElementById('container')
  );

};

