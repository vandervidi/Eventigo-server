var mongoose = require('mongoose');
var schema = mongoose.Schema;
var albumSchema = new schema({

	activeStatus: {type: Boolean, default: true},
	creationDate: {type: Date, required :true},
	owner: {type: String, required :true},  // This is the owner's user ID

	title: {type: String, default: 'ALBUM NAME', required :true},
	location: {
		country: {type: String, default: ''},
		city: {type: String, default: ''},
		street: {type: String, default: ''}
	},

	photos:[{
		url: {type: String, required :true, unique: true},
		owner: {type: String, required :true},
		creationDate: {type: Date, required :true},
		rating: {
			positive: {type: [String], default: []}, // Array of users ID's
			negative: {type: [String], default: []}	 // Array of users ID's
		}
	}],

	participants: {type: [String], default: []} 	// Array of users ID's that 
}, {collection: 'albums'});

exports.albumSchema = albumSchema;