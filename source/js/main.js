'use strict';

var commons = require('./react/commons');

window.renderMainPage = require('./react/science-page');
window.renderCsPage = require('./react/cs-page');
window.aboutPage = require('./react/about-page');

// TODO: just to workaround fact that I do not know how to handle on-click on <a> in React
window.stackPage = require('./react/stack-page');

if(typeof window !== 'undefined') {
  window.onload = function() {
    stackPage();
  }
}
