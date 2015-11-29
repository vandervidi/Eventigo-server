var User = require('../../dao').User;
var Album = require('../../dao').Album;



/**
A function that handles a new user registration

@param {object} - http request object
@param {object} - http response object
*/
exports.register = function(req, res){
	console.log('[LOG] ATTEMPT to register a user with facebook id: ' + req.body.userInfo.id);

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
			console.log('[LOG] Registered new user');
			res.status(200).json({'success': true, 'doc': doc});
		}else{
			console.log('[ERROR] : could not register the new user');
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
	 console.log("[LOG] GETTING USER ALBUMS");
	 User.findById(req.body.userId).populate('albums').exec(function(err, userDoc){
		if(!err){
			console.log("[LOG] Album found");
			res.status(200).json({success: true, data: userDoc.albums || []});
		}else{
			console.log("[ERROR] Could not find album");
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
	console.log("[LOG] Joining an album");
	var album;
	//	Find the album that the user wants to join
	var promise = Album.findOne().where({'shortId': req.body.shortId}).exec();

	//	Add the user ID to album's participants array
	promise.then(function(albumDoc){
		console.log("[LOG] Requested album found!");

		//	Check if the user already is a participant in this album...
		if(albumDoc.participants.indexOf(req.body.userId) === -1){
			albumDoc.participants.push(req.body.userId);
		}else{
			console.log("Throwing new error");
			throw new "[ERROR] User with id " + req.body.userId + " is already a participant in this album";
		}
		return albumDoc.save();
	})

	//	Find the user that wants to join the album
	.then(function(albumDoc){
		console.log('[LOG] added user id to album participants');
		album = albumDoc;
		return User.findById(req.body.userId).exec();
	})

	// Save the album ID in the user's albums array
	.then(function(userDoc){
		console.log('[LOG] User document found');
		if(userDoc.albums.indexOf(album._id) === -1){
			userDoc.albums.unshift(album._id);
		}
		else{
			throw "[ERROR] This user is already a participant in this album"
		}
		return userDoc.save();
	})

	//	Return a response
	.then(function(savedUserDoc){
		console.log('[LOG] saved album id into user\'s albums array ');
		res.status(200).json({success: true, albumId: album._id});
	})

	//	Error handler
	.catch(function(err){
		console.log(err);
		res.status(200).json({success: false});
	});
	
}



/**
Handels a use-case where a user leaves an album but does not delete it. 

@param {object} - http request object
@param {object} - http response object
*/
exports.leaveAlbum = function(req, res){
	console.log('[LOG] Leaving an album');
	var promise = User.findById(req.body.userId).exec();
	promise.then(function(userDoc){
		var indexToRemove = userDoc.albums.indexOf(req.body.albumId);
		if(indexToRemove > -1){
			console.log('[LOG] Removing album from user albums list');
		    userDoc.albums.splice(indexToRemove, 1);
		    return userDoc.save();
		}
		throw new "[Error] There is no such album ID in user's albums list"
	})

	.then(function(savedUserDoc){
		console.log('[LOG] Album ID is removed. ');
		res.status(200).json({success: true});
	})

	//	Error handler
	.catch(function(err){
		console.log('[ERROR] Could not leave album')
		console.log(err);
		res.status(200).json({success: false});
	});
}



/**
Handels a use-case where a photo creator DELETES an album. 

@param {object} - http request object
@param {object} - http response object
*/
exports.deleteAlbum = function(req, res){
	console.log(req.body);
	console.log('[LOG] Deleting an album');

	var promise = User.update({'albums': req.body.albumId}, {$pull: {'albums' : req.body.albumId }} , { multi: true }).exec();
	promise.then(function(userDocs){
		console.log('[LOG] Deleted this album from all users');
		return Album.findById(req.body.albumId);
	})

	.then(function(albumDoc){
		return albumDoc.remove();
	})

	.then(function(){
		res.status(200).json({success: true});
	})

	.catch(function(err){
		console.log('[ERROR] Could not delete this album from all users');
		console.log(err);
		res.status(200).json({success: false});
	});
}