//	Generates unique short ID's
//	https://www.npmjs.com/package/shortid
var shortid = require('shortid');	

var Album = require('../../dao').Album;
var User = require('../../dao').User;
var cloudinary = require('cloudinary');
var cloudinaryConfig = require('../../modules/cloudinaryConfig').config;

//	Initializing Cloudinary configurations
cloudinary.config(cloudinaryConfig);


/**
Creates a new album for a user
@param {object} - http request object
@param {object} - http response object
*/
exports.createNewAlbum = function(req, res){
	var albumDocRef;

	//	Creating a new album schema object
	var album = new Album({
		shortId: shortid.generate(),
		creator: req.body.creator,
		name: req.body.albumData.name,
		creationDate: req.body.albumData.date,
		location: req.body.albumData.location
	});

	album.guests.push(req.body.creator);

	//	Save the new album
	var promise = album.save();
	//	Save success callback - new album is saved
	promise.then(function(albumDoc){
		console.log("[LOG] successfully saved new album in albums schema!");
		albumDocRef = albumDoc;
		return User.findOne().where({'_id': req.body.creator}).exec();
	})

	//	findOne() success callback - found a user
	.then(function(userDoc){
		userDoc.albums.unshift(albumDocRef._id);
		return userDoc.save();
	})

	.then(function(savedUserDoc){
		console.log("[LOG] successfully added the new album to the user document");
		res.status(200).json({success: true});
	})

	//	Error handler
	.catch(function(err){
		console.log("[ERROR] Failed to save the new album to the user document ");
		console.log(err);
		res.status(200).json({success: false});
	});
}



	
/**
Retrieves an album by id
@param {object} - http request object
@param {object} - http response object
*/
exports.getAlbumById = function(req, res){

	console.log("[LOG] Getting album by id: ", req.body.albumId);
	var promise = Album.findById(req.body.albumId).populate('creator photos.owner').exec();


	promise.then(function(albumDoc){
		console.log("[LOG] Album found by id: " + req.body.albumId);

		var jsDoc = albumDoc.toObject();	//	converting the document to a javascript object in order to manipulate it.
		jsDoc.photos.reverse();
		res.status(200).json({success: true, data: jsDoc});
	})
	
	//	Error handler
	.catch(function(err){
		console.log("[ERROR] Could not get album by id " + req.body.albumId);
		console.log(err);
		res.status(200).json({success: false});
	});
}

	
/**
Upload a base64 photo string to Cloudinary and save the returned photo URL in the album's document

@param {object} - http request object
@param {object} - http response object
*/
//###################################################################################
//	CALLBACK HELL !!! REWRITE THIS METHOD - use promises
//###################################################################################
exports.uploadPhotoToAlbum = function(req, res){
	
	console.log('[LOG] uploading a picture to cloudinary...');
	//	Uploading the photo to Cloudinary
	cloudinary.uploader.upload('data:image/gif;base64,' + req.body.photoUri, 
		//	success callback
		function(cloudinaryResult) {
			if(!cloudinaryResult.error){	
				console.log("[LOG] Upladed successfully a picture to cloudinary!");

				//	Save the photo to the relevant album
				var promise = Album.findById(req.body.albumId).exec();
				promise.then(function(albumDoc){
					console.log('[LOG] Album FOUND!, Pushing new photo to the photos array...');
					//	Push the new photo to album's photos array
					albumDoc.photos.push({
							owner: req.body.photoOwner,
							url: cloudinaryResult.public_id + ".jpg"
							//	The remaining variables will be 
							//	created using their default valuse as predefined in 
							//	the album schema
					});
					return albumDoc.save();
				})

				.then(function(savedAlbumDoc){
					console.log('[LOG] Album changes are SAVED!');
					res.status(200).json({success: true, data: savedAlbumDoc});
				})
				
				.catch(function(err){
					console.error('[ERROR] Could not upload photo to album');
					console.error(cloudinaryResult.error);
					res.status(200).json({success: false});
				});
					

			//	Cloudinary upload error
			}else{
				console.error('[ERROR] Cloudinary upload failure');
				console.error(cloudinaryResult.error);
				res.status(200).json({success: false});
			}
		
		}
	);

}


/**
This function toggles a user like/unlike on a single photo in an album

@param {object} - http request object
@param {object} - http response object
*/
exports.toggleLike = function(req, res){

	//	Add the user into the likes array. If it already exist there - remove it
	var promise = Album.findOneAndUpdate({'_id': req.body.albumId, 'photos._id': req.body.photoId}, {$addToSet : { 'photos.$.likes' : req.body.userId}}).exec();
	promise.then(function(albumDoc){
		//	The document returned is the one BEFORE pushing the user into the likes array.
		//	Check here if the user id is in the likes array.
		//	case 1: It is in the likes array. ==> remove it  (toggle)
			var photosLen = albumDoc.photos.length;
			for(var i=0; i<photosLen; i++){
				if(albumDoc.photos[i]._id == req.body.photoId){
					console.log("[LOG] Found matching photo")
					var indexToRemove = albumDoc.photos[i].likes.indexOf(req.body.userId);
					if (indexToRemove > -1) {
						console.log('[LOG] Removing like');
					    albumDoc.photos[i].likes.splice(indexToRemove, 1);
					    return albumDoc.save();
					}
				}
			}
		// 	case 2: The user id is not in the likes array
		//	DO NOTHING ABOUT IT. USER ID WAS INSERTED BY THE QUERY
	})

	.then(function(albumDoc){
		console.log('[LOG] Liked!');
		res.status(200).json({success: true, data: albumDoc});
	})

	//	Error handler
	.catch(function(err){
		console.log('[ERROR] Toggle like function');
		console.log(err);
		res.status(200).json({success: false});
	});
}	



/**
This function sets a custom cover photo to an album

@param {object} - http request object
@param {object} - http response object
*/
exports.setCover = function(req, res){
	console.log(req.body.url);
	var promise = Album.findOneAndUpdate({'_id': req.body.albumId}, {'coverPhoto': req.body.photoUrl}, {new: true}).exec();
	promise.then(function(albumDoc){
		console.log(albumDoc);
		albumDoc.coverPhoto = req.body.url;
		return albumDoc.save();
	})

	.then(function(savedDoc){
		console.log(savedDoc);
		console.log("[LOG] Successfully set album cover photo");
		res.status(200).json({success: true});
	})

	//	Error handler
	.catch(function(err){
		console.log('[ERROR] Could not set album cover photo');
		console.log(err);
		res.status(200).json({success: false});
	});
}



/**
This function deletes a photo from an album

@param {object} - http request object
@param {object} - http response object
*/
exports.deletePhoto = function(req, res){
	console.log("[LOG] Deleteing a photo");
	var promise = Album.findById(req.body.albumId).exec();
	promise.then(function(albumDoc){
		albumDoc.photos.pull({'_id' : req.body.photoId});
		return albumDoc.save();
	})

	//	Saving changes
	.then(function(savedAlbumDoc){
		console.log("[LOG] Successfully deleted a photo from an album");
		res.status(200).json({success: true});
	})

	//	Error handler
	.catch(function(err){
		console.log('[ERROR] Could not delete photo from album');
		console.log(err);
		res.status(200).json({success: false});
	})
}



/**
This function returns an album's feed

@param {object} - http request object
@param {object} - http response object
*/
exports.getPhotoFeed = function(req, res){

}



/**
This function returns an album's guests list

@param {object} - http request object
@param {object} - http response object
*/
exports.getAlbumGuests = function(req, res){
	console.log("[LOG] Getting album guests list...");
	var promise = Album.findById(req.body.albumId).populate('guests').exec();

	promise.then(function(albumDoc){
		console.log("[LOG] successfully found album. returning guests list");
		res.status(200).json({success: true, guests: albumDoc.guests});
	})

	//	Error handler
	.catch(function(err){
		console.error('[ERROR] Could not get album Guests');
		console.error(err);
		res.status(200).json({success: false});
	});
}



/**
This function returns an album's likes list

@param {object} - http request object
@param {object} - http response object
*/
exports.getPhotoLikes = function(req, res){
	console.log('PhotoID: ', req.body.photoId);

	var promise = Album.findById(req.body.albumId).populate('photos.likes').exec();

	promise.then(function(albumDoc){
		console.log("[LOG] successfully found album with id: ", req.body.albumId);

		var photosLen = albumDoc.photos.length;
		for(var i=0; i<photosLen; i++){
			if(albumDoc.photos[i]._id == req.body.photoId){
				console.log("[LOG] successfully returning likes list from album: ", req.body.albumId);
				res.status(200).json({success: true, likes: albumDoc.photos[i].likes });
			}
		}
	})

	//	Error handler
	.catch(function(err){
		console.error('[ERROR] Could not get photo likes');
		console.error(err);
		res.status(200).json({success: false});
	});
}



/**
This function returns an album's comments

@param {object} - http request object
@param {object} - http response object
*/
exports.getPhotoComments = function(req, res){

}



/**
This function saves updates the user made to an album.

@param {object} - http request object
@param {object} - http response object
*/
exports.editAlbum = function(req, res){
	console.log('[LOG] Editing album with id: ' + req.body.albumId);
	var promise = Album.findById(req.body.albumId).exec();

	//	Save changes to the found album document
	promise.then(function(albumDoc){
		albumDoc.name = req.body.name;
		albumDoc.location = req.body.location;
		albumDoc.creationDate = new Date(req.body.date);
		albumDoc.coverPhoto = req.body.coverPhoto;
		albumDoc.activeStatus = req.body.activeStatus;
		albumDoc.shortId = req.body.shortId;
		return albumDoc.save();
	})

	.then(function(savedAlbumDoc){
		console.log('[LOG] Edited album. changes are saved');
		res.status(200).json({success: true});
	})

	//	Error handler
	.catch(function(err){
		console.error('[ERROR] Failure while an attempt to edit the album.');
		console.error(err);
		res.status(200).json({success: false});
	});
}



/**
This function generates a new short ID and returns it as a http response

@param {object} - http request object
@param {object} - http response object
*/
exports.generateNewAlbumCode = function(req, res){
	try{
		var shortId = shortid.generate();
		res.status(200).json({success: false, shortId: shortid.generate()});
	}catch(err){
		console.error('[ERROR] Could not generate short ID');
		console.error(err);
		res.status(200).json({success: false});
	}
}