var ts = require('./ts')
  , video = require('./video')
  ;

video.migrateTag();


// String.prototype.mrRemoveNest = function(start, end) {
  // start = "\\"+start;
  // end = "\\"+end;
  // var reg = new RegExp(start+"[^"+start+end+"]*|[^"+start+end+"]*"+end, "g");
  // return this.replace(reg, '');
// }

// var test = [
  // "[abc]test[def]",
  // "test「def」",
  // "[abc]test",
  // "test[abc[def]ghi]"
// ];

// var reg =  /\[[^\[\]]*|[^\[\]]*\]/g;

// test.forEach(function(title) {
  // console.log(title.mrRemoveNest('[', ']'));
// });

