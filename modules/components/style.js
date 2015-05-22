'use strict';

var createMarkupForStyles = require('../create-markup-for-styles');
var prefix = require('../prefix');

var React = require('react');

var buildCssString = function (selector, rules) {
  if (!selector || !rules) {
    return;
  }

  var prefixedRules = prefix(rules, 'css');
  var serializedRules = createMarkupForStyles(prefixedRules);

  return selector + '{' + serializedRules + '}';
};

var Style = React.createClass({

  propTypes: {
    scopeSelector: React.PropTypes.string,
    rules: React.PropTypes.arrayOf(React.PropTypes.object)
  },

  getDefaultProps: function () {
    return {
      scopeSelector: ''
    };
  },

  _buildStyles: function (stylesArr) {
    var styles = stylesArr.reduce((accumulator, item) => {
      var selector = Object.keys(item)[0];
      var rules = item[selector];

      if (selector === 'mediaQueries') {
        accumulator += this._buildMediaQueryString(rules);
      } else {
        var completeSelector = (this.props.scopeSelector ?
          this.props.scopeSelector + ' ' :
          '') +
          selector;
        accumulator += buildCssString(completeSelector, rules);
      }

      return accumulator;
    }, '');

    return styles;
  },

  _buildMediaQueryString: function (mediaQueryObj) {
    var contextMediaQueries = this._getContextMediaQueries();
    var mediaQueryString = '';

    Object.keys(mediaQueryObj).forEach(function (query) {
      var completeQuery = contextMediaQueries[query] ?
        contextMediaQueries[query] :
        query;
      mediaQueryString += '@media ' + completeQuery + '{' +
        this._buildStyles(mediaQueryObj[query]) +
      '}';
    }.bind(this));

    return mediaQueryString;
  },

  _getContextMediaQueries: function () {
    var contextMediaQueries = {};
    if (this.context && this.context.mediaQueries) {
      Object.keys(this.context.mediaQueries).forEach(function (query) {
        contextMediaQueries[query] = this.context.mediaQueries[query].media;
      }.bind(this));
    }

    return contextMediaQueries;
  },

  render: function () {
    if (!this.props.rules) {
      return null;
    }

    var styles = this._buildStyles(this.props.rules);

    return (
      <style dangerouslySetInnerHTML={{__html: styles}} />
    );
  }
});

module.exports = Style;
