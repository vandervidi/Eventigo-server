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
//	CALLBACK HELL !!! REWRITE THIS METHOD - divide callbacks to individual functions
//###################################################################################
exports.createNewAlbum = function(req, res){
	console.log("#################################");
	console.log(req.body.albumData.date);
	console.log(new Date(req.body.albumData.date));

	var album = new Album({
		shortId: shortid.generate(),
		creator: req.body.creator,
		name: req.body.albumData.name,
		creationDate: req.body.albumData.date,
		location: req.body.albumData.location
	});

	album.save(function(err, albumDoc){
		if(!err){
			console.log("successfully saved new album in albums schema!");

					
					User.findOne().where({'_id': req.body.creator}).exec(function(err, userDoc){
							if(!err){
								//	Add the new album ID to the user
								console.log(userDoc);
								console.log('userDoc.albums: ' + userDoc.albums );
								console.log('albumDoc._id: ' + albumDoc._id);
								userDoc.albums.unshift(albumDoc._id);

							

									//	Save changes
									userDoc.save(function(err, doc){
										if(!err){
											res.status(200).json({success: true});
										}else{
											console.log(err);
											res.status(200).json({success: false});
										}
									});



							}else{
								console.log('Could not find a user by the requested id');
								res.status(200).json({success: false});
							}
					});


		}else{
			console.log("There was an error while saving new album object to mongo");
			console.log(err);
			res.status(200).json({success: false});
		}
	});
}



	
/**
Retrieves an album by id
@param {object} - http request object
@param {object} - http response object
*/
exports.getAlbumById = function(req, res){

	console.log("Getting album by id");
	Album.findById(req.body.id).populate('creator photos.owner').exec(function(err, doc){
		if(!err){
			var jsDoc = doc.toObject();	//	converting the document to a javascript object in order to manipulate it.
			jsDoc.photos.sort(function(a, b){
				return a._id - b._id;	//	
			});

			res.status(200).json({success: true, data: jsDoc});
		}else{
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
exports.uploadPhotoToAlbum = function(req, res){
	
	console.log('uploading a picture to cloudinary');
	//	Uploading the photo to Cloudinary
	cloudinary.uploader.upload('data:image/gif;base64,' + req.body.photoUri, 
		//	success callback
		function(cloudinaryResult) {
			if(!cloudinaryResult.error){	
				console.log("Upladed successfully a picture to cloudinary!");

				//	Save the photo to the relevant album
				Album.findById(req.body.albumId).exec(function(err, doc){
					if (!err){
						console.log('Album FOUND!, Modifying...');
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
								console.log('Album SAVED!');
								res.status(200).json({success: true, data: doc});
							}else{
								console.log('ERROR saving album');
								console.log(err);
								res.status(200).json({success: false});
							}
						})
					
					//	Error while getting an album by id	
					}else{
						console.error('ERROR : Could not find the desired album');
						console.error(err);
						res.status(200).json({success: false});
					}

				});
			//	Cloudinary upload error
			}else{
				console.error('ERROR: Cloudinary upload');
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
					console.log("Found matching photo")
					var indexToRemove = albumDoc.photos[i].likes.indexOf(req.body.userId);
					if (indexToRemove > -1) {
						console.log('Removing item');
					    albumDoc.photos[i].likes.splice(indexToRemove, 1);
					    return albumDoc.save();
					}
				}
			}
		// 	case 2: The user id is not in the likes array
		//	DO NOTHING ABOUT IT. USER ID WAS INSERTED BY THE QUERY
	})

	.then(function(albumDoc){
		console.log('Liked!');
		res.status(200).json({success: true, data: albumDoc});
	})

	//	Handle promise erorrs
	.catch(function(err){
		console.log('ERROR: Toggle like function');
		console.log(err);
		res.status(200).json({success: false});
	});
}	


