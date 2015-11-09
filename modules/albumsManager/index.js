var Album = require('../../dao').Album;
var cloudinary = require('cloudinary');
var cloudinaryConfig = require('../../modules/cloudinaryConfig');
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
			res.status(200).json({success: true, data: doc})
		}else{
			res.status(200).json({success: false});
		}
	});
}

exports.uploadPhotoToAlbum = function(req, res){
	console.log('uploading a picture to cloudinary');
	cloudinary.uploader.upload('data:image/gif;base64,' + res.body.photoUri, 
		//	success callback
		function(result) {

			console.log("Upladed successfully a picture to cloudinary!");
			console.log(result)
		});

}