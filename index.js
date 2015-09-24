// ____   ____                  .___                 .__    .___.__   
// \   \ /   /____    ____    __| _/______________  _|__| __| _/|__|  
//  \   Y   /\__  \  /    \  / __ |/ __ \_  __ \  \/ /  |/ __ | |  |  
//   \     /  / __ \|   |  \/ /_/ \  ___/|  | \/\   /|  / /_/ | |  |  
//    \___/  (____  /___|  /\____ |\___  >__|    \_/ |__\____ | |__|  
//                \/     \/      \/    \/                    \/       
//                                ____                                
//                               /  _ \         vandervidi@gmail.com                      
//                               >  _ </\       avishayHajbi@gmail.com                      
//                              /  <_\ \/                             
//                              \_____\ \                             
//                                     \/                             
//                   .__                _____.   .__                  
//                   |  |__ _____      |__\_ |__ |__|                 
//                   |  |  \\__  \     |  || __ \|  |                 
//                   |   Y  \/ __ \_   |  || \_\ \  |                 
//                   |___|  (____  /\__|  ||___  /__|                 
//                        \/     \/\______|    \/                     


var fbAppId = 684914754979228;  //SongThief Facebook application ID.

var dao = require('./dao');
var express = require('express');
var app = express();
app.listen(8080);

// Setting an Express middleware to handle Origin authorization
app.use(function(req,res,next){
	//Setting headers for external requests
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Header", "Origin, X-Requested-With,Content-Type, Accept");
	next();
});


// Express router

// Route to return the GrooPix Facebook application ID number.
app.post('/getAppId' ,function(req, res){
	res.json({appId: fbAppId});
});

// Route that handles a user login
app.post('/connect' , users.connect ,function(req, res){
});

