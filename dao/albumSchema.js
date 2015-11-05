var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var albumSchema = new Schema({

	activeStatus: {type: Boolean, default: true},
	creationDate: {type: Date, required :true},
	_creator: {type: Number, ref:'userM' , required :true},  // This is the owner's user ID

	title: {type: String, required :true, default: 'ALBUM NAME'},
	location: {
		country: {type: String, default: ''},
		city: {type: String, default: ''},
		street: {type: String, default: ''}
	},

	photos:[{
		url: {type: String, unique: true, required :true, default: ''},
		_creator: {type: Number, ref:'userM' , required :true},  // This is the owner's user ID
		creationDate: {type: Date, required :true},
		rating: {
			positive: [{ type: Number, ref:'userM', default: [] }], // Array of users ID's
			negative: [{ type: Number, ref:'userM', default: [] }]	 // Array of users ID's
		}
	}],

	participants: [{ type: Number, ref:'userM', default: [] }] 	// Array of users ID's that 
}, {collection: 'albums'});

exports.albumSchema = albumSchema;