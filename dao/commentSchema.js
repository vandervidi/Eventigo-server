var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({

	postedBy: {type: String, ref: 'userM', required: true}, // user's Facebook name
	contentText: {type: String, required: true, default: ''},  // Facebook user profile picture URL
	timestamp: {type: String, required: true, default: Date.now},
	photoId: {type: String, ref: 'commentM', required: true}
}, {collection: 'comments'});

exports.commentSchema = commentSchema;