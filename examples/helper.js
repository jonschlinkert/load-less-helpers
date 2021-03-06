'use strict';

var fs = require('fs');
var less = require('less');
var merge = require('mixin-deep');
var register = require('../')(less);

register.helper('assets', function(path) {
  console.log(this.options)
  return 'dist/' + path.value + '/assets/css';
});
register.helper('multiple-args', function(arg1, arg2) {
  return ((arg1.value * 1) + (arg2.value)) + arg1.unit.numerator[0];
});
register.helper('string-result', function(less) {
  return "\"Hello\"";
});
register.helper('to-rgb', function(color) {
  return 'rgb(' + color.rgb + ')';
});
register.helper('to-rgba', function(color) {
  return 'rgba(' + color.rgb + ',' + color.alpha + ')';
});
register.helper('to-hex', function(r, g, b) {
  r = r.value;
  g = g.value;
  b = b.value;
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
});


render('test/fixtures/assets.less', {assets: 'dist/assets'}, function(err, css) {
  if (err) return console.log(err);
  console.log(css);
});

function render(fp, options, cb) {
  var str = fs.readFileSync(fp, 'utf8');
  var opts = merge({
    globalVars: {a: 'a', b: 'b', c: 'c'},
    filename: fp,
    rootpath: 'test/fixtures'
  }, options);

  less.render(str, opts, function(err, res) {
    if (err) return console.log(err);
    cb(null, res.css);
  });
}
