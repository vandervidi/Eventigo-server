var Album = require('../../dao').Album;
var cloudinary = require('cloudinary');
var cloudinaryConfig = require('../../modules/cloudinaryConfig').config;
cloudinary.config(cloudinaryConfig);

/**
Creates a new album for a user
@param {object} - http request object
@param {object} - http response object
*/
exports.createNewAlbum = function(req, res){
	
	var album = new Album({
		creator: req.body.creator,
		name: req.body.albumData.name,
		date: req.body.albumData.date,
		location: req.body.albumData.location
	});

	album.save()
	.then(function(doc){
		console.log("successfully saved new album!");
		res.status(200).json({success: true});
	},
	//	Error while saving
	function(err){
		console.log("There was an error while saving new album object to mongo");
		console.log(err);
		res.status(200).json({success: false});
	});
	
}


/**
Retrieves all user albums
@param {object} - http request object
@param {object} - http response object
*/
exports.getUserAlbums = function(req, res){
	Album.find().select('_id creationDate name coverPhoto location').where('creator', req.body.userId).exec(function(err,results){
		if(!err){
			res.status(200).json({success: true, data: results});
		}else{
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





// Album.findByIdAndUpdate(
//        req.body.albumId,
//         {
//         	$push: {'photos': {
// 						owner: req.body.photoOwner,
// 						url: cloudinaryResult.url
// 						//	The remaining variables will be 
// 						//	created using their default valuse predefines int 
// 						//	the album schema
// 					}
// 				}
// 			},
//         {safe: true, upsert: true, new : true},
//         function(err, newDoc) {
//           if(!err){
// 				console.log('Album SAVED!');
// 				res.status(200).json({success: true, data: newDoc});
// 			}else{
// 				console.log('ERROR saving album');
// 				res.status(200).json({success: false});
// 			}
//         }
//     );





			//	Save the photo to the relevant album
			Album.findById(req.body.albumId).exec(function(err, doc){
				if (!err){
					console.log('Album FOUND!, Modifying...');
					//	Edit the found document
					doc.photos.push({
						owner: req.body.photoOwner,
						url: cloudinaryResult.url
						//	The remaining variables will be 
						//	created using their default valuse predefines int 
						//	the album schema
					});

					//	Save the changes
					doc.save(function(err, doc){
						if(!err){
							console.log('Album SAVED!');
							res.status(200).json({success: true, data: "some data??????????/"});
						}else{
							console.log('ERROR saving album');
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