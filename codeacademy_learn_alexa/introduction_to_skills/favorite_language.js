
"use strict";

var Alexa = require("alexa-sdk");

var handlers = {
  "HelloIntent": function () {
    this.response.speak("Hello, Jatin"); 
    this.emit(':responseReady');
  },
  "myFavoriteLanguageIntent": function () {
    this.response.speak("Your favourite language is Javascript."); 
    this.emit(':responseReady');
  },
  "LaunchRequest": function () {
    this.response.speak("Jatin, Welcome to Codecademy"); 
    this.emit(':responseReady');
  }
};

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};