var User = require('../../dao').User;
var Album = require('../../dao').Album;
var Promise = require("bluebird");


/**
A function that handles a new user registration

@param {object} - http request object
@param {object} - http response object
*/
exports.register = function(req, res){
	console.log('ATTEMPT to register a user with facebook id: ' + req.body.userInfo.id);

	var query = {'_id': req.body.userInfo.id};

	var update = {
		'_id': req.body.userInfo.id ,  					// Facebook userID
		'name': req.body.userInfo.name, 				// user's Facebook name
		'profilePicture': req.body.userInfo.profilePic, // Facebook user profile picture URL
	};

	var options = {
		upsert: true,				//	Create a new document if the query finds zero documents matching the query.
		setDefaultsOnInsert : true,	//	When creating a new document, include schema default values. 
		new: true
	};

	User.findOneAndUpdate(query, update, options).exec(function(err ,doc){
		if(!err){
			console.log('REGISTERED!: ' , JSON.stringify(doc));
			res.status(200).json({'success': true, 'doc': doc});
		}else{
			console.log(err);
			res.status(200).json({'success': false});
		}
		
	});
};



/**
Retrieves list of user albums

@param {object} - http request object
@param {object} - http response object
*/
exports.getUserAlbums = function(req, res){
	console.log("GETTING USER ALBUMS");
	console.log('UserID: ' + req.body.userId );
	 User.findById(req.body.userId).populate('albums').exec(function(err, userDoc){
		console.log(userDoc);
		if(!err){
			console.log(userDoc);userDoc.album
			res.status(200).json({success: true, data: userDoc.albums || []});
		}else{
			res.status(200).json({success: false});
		}
	}); 

}


/**
Join an existing album.
We recieve a short code representing an album.

@param {object} - http request object
@param {object} - http response object
*/
exports.joinAlbum = function(req, res){
	//	Find the album that the user wants to join
	var promise = Album.findOne().where({'shortId': req.body.shortId}).exec();

	//	Add the user ID to album's participants array
	promise.then(function(albumDoc){
		//	Check if the user already is a participant in this album...
		if(albumDoc.participants.indexOf(req.body.userId) > -1){
			albumDoc.participants.push(req.body.userId);
		}else{
			throw new Error("ERROR: User with id " + req.body.userId + " is already a participant in this album");
		}
		return albumDoc.save();
	})

	//	Find the user that wants to join the album
	.then(function(){
		return User.findById(req.body.userId).exec();
	})

	// Save the album ID in the user's albums array
	.then(function(userDoc){
		userDoc.albums.unshift(albumDoc._id);
		return userDoc.save();
	})

	//	Return a response
	.then(function(){
		res.status(200).json({success: true});
	})

	//	Error handler
	.catch(function(err){
		console.log(err);
		res.status(200).json({success: false});
	});



	//	Get the album ID.
	//Album.findOne().where({'shortId': req.body.shortId}).exec(function(err, albumDoc){
		// if(!err){
		// 	console.log("######### JOIN ALBUM ########")
		// 	//	Add the user to the album participants array
		// 	//	Before that, first check if he already is a participant

		// 	if(albumDoc.participants.indexOf(req.body.userId) > -1){
		// 		albumDoc.participants.push(req.body.userId);
		// 	}else{
		// 		res.status(200).json({success: true});
		// 	}

		// 	//	save changes
		// 	albumDoc.save(function(err, newAlbumdoc){
		// 		if(!err){

		// 				// Save the album ID in the user's albums array
		// 				User.findById(req.body.userId).exec(function(err, userDoc){
		// 					//	Push to albums array
		// 					userDoc.albums.unshift(albumDoc._id);
		// 					//	Save
		// 					userDoc.save(function(err, modifiedUserDoc){
		// 						if(!err){
		// 							res.status(200).json({success: true});
		// 						}else{
		// 							console.log('There was an error saving the user document');
		// 							res.status(200).json({success: false});
		// 						}
		// 					});
		// 				});

		// 		}else{
		// 			console.log('There was an error adding the user to albums participants array and saving changes');
		// 			res.status(200).json({success: false});
		// 		}
		// 	});


		// }else{
		// 	console.log('There was an error finding the wanted album');
		// 	res.status(200).json({success: false});
		// }

	//});


	
}