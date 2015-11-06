var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var albumSchema = new Schema({

	activeStatus: {type: Boolean, default: true},
	creationDate: {type: Date, default: Date.now},
	creator: {type: Number, ref:'userM' , required :true},  // This is the owner's user ID

	name: {type: String, required :true, default: 'ALBUM NAME'},
	location: {type: String, default: ''},
	coverPhoto: {type: String, default: ''},
	
	photos:[{
		owner: {type: Number, ref:'userM' , default: -1},  // This is the owner's user ID
		url: {type: String, default: ''},
		creationDate: {type: Date, default: Date.now},
		rating: {
			positive: [{ type: Number, ref:'userM', default: [] }] // Array of users ID's
		},
		comments: [{type: Schema.Types.ObjectId, ref: 'commentM', default: []}],
		default: []
	}],

	participants: [{ type: Number, ref:'userM', default: [] }] 	// Array of users ID's that 
}, {collection: 'albums'});

exports.albumSchema = albumSchema;