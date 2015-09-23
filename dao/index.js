var mongoose = require('mongoose');

// Configuring connection to mongoLab
mongoose.connect('mongodb://vandervidi:vandervidi87@ds055862.mongolab.com:55862/heroku_9ddcq9zq');

// Import schema modules
var userSchema = require('./users/userSchema').userSchema;
var albumSchema = require('./albums/albumSchema').albumSchema;

// Configure the imported schema as a model and give it an alias
exports.User = mongoose.model('userM' , userSchema);
exports.Album = mongoose.model('albumM' , albumSchema);

// Mongoose connection instance object
var conn = mongoose.connection;

// Print error message 
conn.on('error', function(err){
  console.log('connection error:' + err);
});

// Once a connection is initiated - do the following
conn.once('open' , function(){
  console.log('connected to mongoLab');
  
});

// When the node proccess is terminated (Ctrl+c is pressed) , close the connection to the DB.
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});
