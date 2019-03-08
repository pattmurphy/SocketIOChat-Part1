var express = require("express");
const bodyParser = require('body-parser');
var mongoose = require("mongoose");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});

// connect to mongodb
mongoose.connect('mongodb://root:Roos2110@ds161335.mlab.com:61335/chat_assignment',{ useNewUrlParser: true })
  .then(() => {
    console.log('Connected to Mongo database!');
  })
  .catch(err  => {
    console.error('App starting error:', err.stack);
  });

// *********** Include the Api routes ***********
const eventRoutes = require("./routes/events");
const messageRoutes = require("./routes/messages");
const roomHistoryRoutes = require("./routes/roomHistory");

// *********** Connect to Mongo  ***********
console.log('Attempting to connect to mongoose');

// ******** Setup the Api routes ***********
app.use("/api/eventlog", eventRoutes);
app.use("/api/history", messageRoutes);
//the assignment wants me to use a different route name to get individual chat history
//but it could have been done with the same one
app.use("/api/roomhistory", roomHistoryRoutes);

module.exports = app;