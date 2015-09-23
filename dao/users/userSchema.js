var mongoose = require('mongoose');
var schema = mongoose.Schema;

var userSchema = new schema({
	userId: { type : String ,  index : true, unique : true , required :true},  // Facebook userID
	name: {type: String, default: ''}, // user's Facebook name
	profilePicture: String,  // Facebook user profile picture URL
	registrationDate: { type: Date, default: Date.now },  // a timestamp, default: current time
	regId: {type: String, default: '-1' }, // Android device registration ID
	albums: [String]	// List of album ID's the user has participated in
}, {collection: 'users'});

exports.userSchema = userSchema;