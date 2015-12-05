var Comment = require('../../dao').Comment;
var Album = require('../../dao').Album;


/**
posts a comment in a photo
@param {object} - http request object
@param {object} - http response object
*/
exports.postComment = function(req, res){
   console.log("[LOG] Creating a new comment");
 
	var comment = new Comment({
		postedBy: req.body.userId,
		contentText: req.body.comment,
		timestamp: req.body.timestamp,
		photoId: req.body.photoId
	});

	console.log("[LOG] Trying to save comment...");
	var promise = comment.save();
	 	promise.then(function(savedCommentDoc){
	 	console.log("[LOG] New comment is saved successfully");
	 	return  Album.findOneAndUpdate({'_id': req.body.albumId, 'photos._id': req.body.photoId}, {$addToSet : { 'photos.$.comments' : savedCommentDoc._id}}).exec();
	 })

		.then(function(modifiedAlbumDoc){
			console.log("[LOG] New comment is pushed into comments array in its album");
			res.status(200).json({'success': true});
		})

		.catch(function(err){
			console.error('[ERROR] Could not save new comment');
			console.error(err);
			res.status(200).json({'success': false});
		});

}

/**
Returns photo comments
@param {object} - http request object
@param {object} - http response object
*/
exports.getPhotoComments = function(req, res){
console.log("[LOG] Getting comments!");
console.log("[LOG] Requesting comments for photo: " + req.body.photoId);

   var promise = Comment.find({photoId : req.body.photoId}).populate('postedBy').exec();

   promise.then(function(arrayOfCommentDocs){
   		console.log("[LOG] Found: " + arrayOfCommentDocs.length + " comments" );
   		res.status(200).json({success: true, comments: arrayOfCommentDocs });
   })

	// Error handler
	.catch(function(err){
		console.error('[ERROR] Could not get photo comments');
		console.error(err);
		res.status(200).json({success: false});
	});
}