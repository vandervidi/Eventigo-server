var mongoose = require('mongoose');
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');

// Configuring connection to mongoLab
mongoose.connect('mongodb://admin:admin@ds053784.mongolab.com:53784/snapify');


// Import schema modules
var userSchema = require('./userSchema').userSchema;
var albumSchema = require('./albumSchema').albumSchema;
var commentSchema = require('./commentSchema').commentSchema;

// Configure the imported schema as a model and give it an alias
exports.User = mongoose.model('userM' , userSchema);
exports.Album = mongoose.model('albumM' , albumSchema);
exports.Comment = mongoose.model('commentM', commentSchema);


// Mongoose connection instance object
var conn = mongoose.connection;


// Report Mongoose connection errors
conn.on('error', function(err){
  console.log('connection error:' + err);
});


// On connection event handler
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
