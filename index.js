// ____   ____                  .___  Developed by:  .__    .___.__   
// \   \ /   /____    ____    __| _/______________  _|__| __| _/|__|  
//  \   Y   /\__  \  /    \  / __ |/ __ \_  __ \  \/ /  |/ __ | |  |  
//   \     /  / __ \|   |  \/ /_/ \  ___/|  | \/\   /|  / /_/ | |  |  
//    \___/  (____  /___|  /\____ |\___  >__|    \_/ |__\____ | |__|  
//                \/     \/      \/    \/                    \/       
//                                                               
//                  	 vandervidi@gmail.com                      


var usersManager = require('./modules/usersManager');
var albumsManager = require('./modules/albumsManager');
var commentsManager = require('./modules/commentsManager');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var cors = require('cors');

//	Server port settings
app.listen(process.env.PORT || 8080 , function(){
  console.log('Eventigo server is running ');
});

//  Express.Use function means => Run this on ALL requests.(Middlewares) 
//	Setting CORS middleware
app.use( cors() );

//  Setting up the Body-Parser library
//	Manually setting data size limit to handle large picture sizes
app.use(bodyParser.json({limit: '10mb'}));         //	to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     //	to support URL-encoded bodies
  extended: true,
  limit: '10mb'
})); 


//	Router
//	Register a new user - first facebook login
app.post('/registerUser', usersManager.register);

//	Creating a new photo album
app.post('/createNewAlbum', albumsManager.createNewAlbum);

//	get list of user's albums
app.post('/getUserAlbums', usersManager.getUserAlbums);

// Get album by id
app.post('/getAlbumById', albumsManager.getAlbumById);

//	Upload a photo to an album
app.post('/uploadPhotoToAlbum', albumsManager.uploadPhotoToAlbum);

//	Join an existing album
app.post('/joinAlbum', usersManager.joinAlbum);

//	Like a photo
app.post('/likePhoto', albumsManager.toggleLike);

//	Set a cover photo to album
app.post('/setCover', albumsManager.setCover);

//	Set a cover photo to album
app.post('/deletePhoto', albumsManager.deletePhoto);

//	User leaves an album
app.post('/leaveAlbum', usersManager.leaveAlbum);

// 	User ldeletes an album
app.post('/deleteAlbum', usersManager.deleteAlbum);

//	Get photo feed messages
app.post('/getPhotoFeed', albumsManager.getPhotoFeed);

//	Get photo comments
app.post('/getPhotoComments', commentsManager.getPhotoComments);

// Get album guest list
app.post('/getAlbumGuests', albumsManager.getAlbumGuests);

//	Get photo likes list
app.post('/getPhotoLikes', albumsManager.getPhotoLikes);

//	Edit an album
app.post('/editAlbum', albumsManager.editAlbum);

//	Generate a new album short ID
app.get('/generateNewAlbumCode' ,albumsManager.generateNewAlbumCode);

//	Generate a new album short ID
app.post('/postComment' ,commentsManager.postComment);