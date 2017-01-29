/*!
 * load-less-helpers <https://github.com/jonschlinkert/load-less-helpers>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');
var extend = require('extend-shallow');
var merge = require('mixin-deep');

function Register(less, options) {
  if (!isObject(less) || typeof less.render !== 'function') {
    throw new Error('expected an intance of less as the first argument');
  }
  if (!(this instanceof Register)) {
    return new Register(less, options);
  }

  var opts = this.options = extend({}, options);
  var render = less.render;
  less.options = merge({}, less.options, opts);
  less.helper = this.helper.bind(this);
  less.helpers = this.helpers.bind(this);
  less.render = function(str, options, cb) {
    return render.call(less, str, merge({}, opts, options), cb);
  };
  this.less = less;
}

Register.prototype.helper = function(name, options, fn) {
  if (typeof name !== 'string') {
    throw new TypeError('expected name to be a string');
  }

  if (typeof options === 'function') {
    return this.helper(name, fn, options);
  }

  if (typeof fn !== 'function') {
    throw new TypeError('expected a helper function');
  }

  var key = name.toLowerCase();
  var opts = extend({}, this.options, options);
  var less = this.less;
  var file = opts.file;
  var data = opts.data;

  delete opts.data;
  delete opts.file;

  if (opts.strict && less.helpers.hasOwnProperty(key.toLowerCase())) {
    return this;
  }

  // Create the context for helper functions to use
  function wrapped(node) {
    this.less = less;

    if (!('options' in this)) {
      this.options = opts;
    }
    if (!('data' in this)) {
      this.data = data || {};
    }
    if (!('file' in this)) {
      this.file = file || less.file || {};
    }

    var val = fn.call(this, node, less.file);
    return !isObject(val) ? new less.tree.Anonymous(val) : val;
  }

  less.functions.functionRegistry.add(key, wrapped);
  less.helpers[key] = wrapped;
  return this;
};

Register.prototype.helpers = function(helpers, options) {
  if (!isObject(helpers)) {
    throw new TypeError('expected "helpers" to be an object');
  }
  for (var name in helpers) {
    this.helper(name, options, helpers[name]);
  }
  return this;
};

module.exports = Register;
