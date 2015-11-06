// ____   ____                  .___  developed by   .__    .___.__   
// \   \ /   /____    ____    __| _/______________  _|__| __| _/|__|  
//  \   Y   /\__  \  /    \  / __ |/ __ \_  __ \  \/ /  |/ __ | |  |  
//   \     /  / __ \|   |  \/ /_/ \  ___/|  | \/\   /|  / /_/ | |  |  
//    \___/  (____  /___|  /\____ |\___  >__|    \_/ |__\____ | |__|  
//                \/     \/      \/    \/                    \/       
//                                                               
//                  	 vandervidi@gmail.com                      


var usersManager = require('./modules/usersManager');
var albumsManager = require('./modules/albumsManager');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var cors = require('cors');
app.listen(process.env.PORT || 8080 , function(){
  console.log('Snapify server is running ');
});

//  Express.Use function means => Run this on ALL requests.(Middlewares) 
//	Setting CORS middleware
app.use(cors());

//  Setting up the Body-Parser library
app.use(bodyParser.json());         //	to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     //	to support URL-encoded bodies
  extended: true
})); 


//	Router
//	Register a new user - first facebook login
 app.post('/registerUser', usersManager.register);

//	Creating a new photo album
 app.post('/createNewAlbum', albumsManager.createNewAlbum);

 //	get list of user's albums
 app.post('/getUserAlbums', albumsManager.getUserAlbums);