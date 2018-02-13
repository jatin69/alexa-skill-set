'use strict';

var Alexa = require('alexa-sdk');

var flashcardsDictionary = [
  {
   	'question' : 'A',
    'answer' : 'Answer of A'
  },
  {
   	'question' : 'B',
    'answer' : 'Answer of B'
  }
]

var DECK_LENGTH = flashcardsDictionary.length;

var handlers = {

  // Open Codecademy Flashcards
  'LaunchRequest': function() {
		if(Object.keys(this.attributes).length === 0) {
        this.attributes.flashcards = {
              'numberCorrect': 0,
              'currentFlashcardIndex': 0
        }
			this.response.speak(this.AskQuestion).listen(this.AskQuestion);
      } 
    else {
        var CURRENTINDEX = this.attributes.flashcards.currentFlashcardIndex;
      	var NUMBERCORRECT = this.attributes.flashcards.numberCorrect;
        this.response
            .speak('Welcome back to Flashcards. You\'re on question '
                   + CURRENTINDEX + ' and have answered ' + NUMBERCORRECT  + ' correctly.'
                   + this.AskQuestion).listen(this.AskQuestion);
      }
    this.emit(':responseReady');
  },

  // User gives an answer
  'AnswerIntent': function() {
		var userAnswer = this.event.request.intent.slots.capitals.value;
    var correctAnswer = flashcardsDictionary[this.attributes.flashcards.currentFlashcardIndex].answer;
    
    if(userAnswer === correctAnswer){
      this.response.listen('You are right. Next question is ' + this.AskQuestion);
    }
    else{
      this.response.listen('You are wrong. Better luck next time. Next question is ' + this.AskQuestion);
    }
    
    this.attributes.flashcards.currentFlashcardIndex++;
    this.emit(':responseReady');
    
  },
  
   // Test my {language} knowledge
  'AskQuestion': function() {
    var currentFlashcardIndex = this.attributes.flashcards.currentFlashcardIndex;
    var currentState = flashcardsDictionary[currentFlashcardIndex].question;

    this.response.listen('What is the capital of ' currentState);
    this.emit(':responseReady');
  },

  // Stop
  'AMAZON.StopIntent': function() {
      this.response.speak('Ok, let\'s play again soon.');
      this.emit(':responseReady');
  },

  // Cancel
  'AMAZON.CancelIntent': function() {
      this.response.speak('Ok, let\'s play again soon.');
      this.emit(':responseReady');
  },

  // Save state
  'SessionEndedRequest': function() {
    console.log('session ended!');
    this.emit(':saveState', true);
  }

};

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
  	alexa.dynamoDBTableName = 'US_capitals';
    alexa.registerHandlers(handlers);
    alexa.execute();
};
