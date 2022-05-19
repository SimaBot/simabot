// const uuidv4 = require('uuid/v4');
const maxdec = 'ffffffffffffffffffffffffffffffff';
function between(r, min, max) {
  return Math.floor( r * (max - min) + min  );
}
function h(e) {
  return parseInt(e, 16);
}
exports.between = function (min, max) {
  // const token = uuidv4();
  // const i = h(token.replaceAll('-', '')) / h(maxdec);
  const i = Math.random();
  return between(i, min, max);
}
exports.securityTest = function (howmany) {
  var array = [];
  for (var i = 0; i < between; i++) {
    array.push(exports.range(0, 1000));
  }
  console.log(array);
  var n = 0;
  for (var i = 0; i < array.length; i++) {
    n += array[i];
  }
  n = n / array.length;
  console.log(n);
}
// exports.securityTest(1024 * 1024);
