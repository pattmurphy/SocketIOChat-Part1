const express = require("express");
const MessageModel = require('../models/message');
const mongoose = require('mongoose');
const router = express.Router();

//----------------------------------------------------------------
//----------------------------------------------------------------
//Get All Events Log
router.get('', (req, res, next) => {

    MessageModel.find(function(err,messages){
      if(err){
        res.send(err);
      }
      else{
        res.setHeader('Content-Type',"application/json"); 
        res.end(JSON.stringify(messages, null, 3));
      }
    })
  });

//----------------------------------------------------------------
//----------------------------------------------------------------
//Insert Event
router.post('', (req, res, next) => {

    console.log('INSERT: an Event occured: ');
  
    var message = req.body;//JSON.stringify(req.body, null, 3);
     console.log(message);
     if(!message.socket_id || !message.username || !message.message || !message.room){
       res.status(400);
       console.log('Bad Data for New Message  INSERT:'+message);
     }
     else{
        MessageModel.create(message);
    }
  });
  //----------------------------------------------------------------

module.exports = router;