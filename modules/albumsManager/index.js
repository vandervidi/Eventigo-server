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
	
	var album = new Album({
		shortId: shortid.generate(),
		creator: req.body.creator,
		name: req.body.albumData.name,
		date: req.body.albumData.date,
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
	Album.findById(req.body.id).exec(function(err, doc){
		if(!err){
			res.status(200).json({success: true, data: doc});
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
			console.log("Upladed successfully a picture to cloudinary!");
			console.log(cloudinaryResult);

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
					console.log('Error : Could not find the desired album');
					console.log(err);
					res.status(200).json({success: false});
				}

			});
		});

}

