var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({

	postedBy: {type: Schema.Types.ObjectId, ref: 'userM', required: true}, // user's Facebook name
	contentText: {type: String, required: true, default: ''}  // Facebook user profile picture URL
}, {collection: 'comments'});

exports.commentSchema = commentSchema;