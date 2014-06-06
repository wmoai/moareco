var video = require('./model/video');
var model = require('./model');

// db.videos.aggregate([{$group:{_id:'$tags', max:{$max:'$start'}}}, {$sort: {max:1}}])

model.video
.aggregate({
  $unwind : '$tags' 
}, {
  $group: {
    _id : '$tags',
    max: { $max : '$start' }
  }
},{
  $sort: { max : -1 }
},{ $project: {
    _id : 0,
    tag: '$_id'
  }
}).exec(function(err, tags) {
});


