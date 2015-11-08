var User = require('../../dao').User;


exports.register = function(req, res){
	
	var query = {_id: req.body.userInfo.id};
	var update = {
		_id: req.body.userInfo.id ,  // Facebook userID
		name: req.body.userInfo.name, // user's Facebook name
		profilePicture: req.body.userInfo.profilePic,  // Facebook user profile picture URL
	};
	var options = {
		upsert: true,	//	Create a new document if the query finds zero documents matching the query.
		setDefaultsOnInsert : true	//	When creating a new document, include schema default values. 
	};

	User.findOneAndUpdate(query, update, options).then(function(doc){
		console.log(doc);
		res.status(200).json({'success': true, 'doc': doc});
	},
	function(err){
		console.log(err);
		res.status(200).json({'success': false});
	});
};

