var Album = require('../../dao').Album;

//	Creates a new album for a user
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
	
};

//	Retrieves all user albums
exports.getUserAlbums = function(req, res){
	Album.find().select('creationDate name coverPhoto location').where('creator', req.body.userId).exec(function(err,results){
		if(!err){
			res.status(200).json({success: true, data: results});
		}else{
			res.status(200).json({success: false});
		}

	}); 
};