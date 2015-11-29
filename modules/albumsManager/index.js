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
//###################################################################################
//	CALLBACK HELL !!! REWRITE THIS METHOD - use promises
//###################################################################################
exports.createNewAlbum = function(req, res){
	var albumDoc;
	//	Creating a new album schema object
	var album = new Album({
		shortId: shortid.generate(),
		creator: req.body.creator,
		name: req.body.albumData.name,
		creationDate: req.body.albumData.date,
		location: req.body.albumData.location
	});

	album.guests.push(req.body.creator);

	//	Saving the new album
	var promise = album.save();
		//	Save success callback - new album is saved
		promise.then(function(albumDoc){
			console.log("[LOG] successfully saved new album in albums schema!");
			albumDoc = albumDoc;
			return User.findOne().where({'_id': req.body.creator}).exec();
		})

		//	findOne() success callback - found a user
		.then(function(userDoc){
			userDoc.albums.unshift(albumDoc._id);
			return userDoc.save();
		})

		.then(function(savedUserDoc){
			console.log("[LOG] seccessfully added the new album to the user document");
			res.status(200).json({success: true});
		})

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
	Album.findById(req.body.albumId).populate('creator photos.owner').exec(function(err, doc){
		if(!err){
			var jsDoc = doc.toObject();	//	converting the document to a javascript object in order to manipulate it.
			jsDoc.photos.reverse();
			console.log("[LOG] Album found by id " + req.body.albumId)
			res.status(200).json({success: true, data: jsDoc});
		}else{
			console.log("[ERROR] Could not get album by id " + req.body.albumId);
			console.log(err);
			res.status(200).json({success: false});
		}
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
				Album.findById(req.body.albumId).exec(function(err, doc){
					if (!err){
						console.log('[LOG] Album FOUND!, Modifying...');
						//	Edit the found document
						doc.photos.push({
							owner: req.body.photoOwner,
							url: cloudinaryResult.public_id + ".jpg"
							//	The remaining variables will be 
							//	created using their default valuse as predefined in 
							//	the album schema
						});

						//	Save the changes
						doc.save(function(err, doc){
							if(!err){
								console.log('[LOG] Album SAVED!');
								res.status(200).json({success: true, data: doc});
							}else{
								console.log('[ERROR] saving album');
								console.log(err);
								res.status(200).json({success: false});
							}
						})
					
					//	Error while getting an album by id	
					}else{
						console.error('[ERROR] Could not find the desired album');
						console.error(err);
						res.status(200).json({success: false});
					}

				});
			//	Cloudinary upload error
			}else{
				console.error('[ERROR] Cloudinary upload');
				console.error(cloudinaryResult.error);
			}
		});

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
						console.log('[LOG] Removing item');
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

	//	Handle promise erorrs
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
		console.log("[LOG] successfully set album cover photo");
		res.status(200).json({success: true});
	})

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
		console.log("[LOG] successfully deleted a photo from an album");
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
	var promise = Album.findById(req.body.albumId).populate('guests').exec();

	promise.then(function(albumDoc){
		console.log("[LOG] successfully found album. returning guests list");
		res.status(200).json({success: true, guests: albumDoc.guests});
	})

	.catch(function(err){
		console.log('[ERROR] Could not get album Guests');
		console.log(err);
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

	.catch(function(err){
		console.log('[ERROR] Could not get photo likes');
		console.log(err);
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