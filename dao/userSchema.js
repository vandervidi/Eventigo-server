var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({

	//	index: true => Tells mongo to index this paramater because it is used frequently. It makes querying faster
	_id: {type: Number, unique: true},  // Facebook userID

	name: {type: String, default: '', required: true}, // user's Facebook name

	profilePicture: {type: String, required: true},  // Facebook user profile picture URL

	registrationDate: { type: Date, default: Date.now },  // a timestamp, default: current time

	regId: {type: String, default: '-1', required: true }, // Android device registration ID

	albums: [{ type: Schema.Types.ObjectId, ref: 'albumM' , default: []}]	// List of album ID's the user has participated in

}, {collection: 'users'});

exports.userSchema = userSchema;