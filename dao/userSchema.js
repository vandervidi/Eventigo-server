var mongoose = require('mongoose');
var schema = mongoose.Schema;

var userSchema = new schema({

	//	index: true => Tells mongo to index this paramater because it is used frequently. It makes querying faster
	userId: { type : String ,  index : true, unique : true , required : true},  // Facebook userID
	name: {type: String, default: '', required: true}, // user's Facebook name
	profilePicture: {type: String, required: true},  // Facebook user profile picture URL
	registrationDate: { type: Date, default: Date.now },  // a timestamp, default: current time
	regId: {type: String, default: '-1', required: true }, // Android device registration ID
	albums: {type: [String], default: []}	// List of album ID's the user has participated in
}, {collection: 'users'});

exports.userSchema = userSchema;