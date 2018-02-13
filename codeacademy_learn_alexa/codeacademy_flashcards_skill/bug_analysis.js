'use strict';

var Alexa = require('alexa-sdk');

var flashcardsDictionary = [
    {
      question: 'How do you find the length of a string?',
      rubyAnswer: 'length',
      pythonAnswer: 'Len',
      javascriptAnswer: 'length'
    },
    {
      question: 'How do you print to the console or terminal?',
      rubyAnswer: 'puts',
      pythonAnswer: 'print',
      javascriptAnswer:'console.log'
    },
    {
       question:'Are the boolean terms true and false capitalized?',
       rubyAnswer: 'no',
       pythonAnswer: 'yes',
       javascriptAnswer: 'no'
     }];

var DECK_LENGTH = flashcardsDictionary.length;

var handlers = {

  // Open Codecademy Flashcards
  'LaunchRequest': function() {
        this.response
            .listen('Welcome to Flashcards. Do you want to test your knowledge' +
            'in Ruby, Python, or Javascript?',
            'Which language would you like to practice?');

    
    this.emit(':responseReady');
  },

  'SetMyLanguageIntent': function() {
    this.attributes.flashcards.currentLanguage = this.event.request.intent.slots.languages.value;
    var currentLanguage = this.attributes.flashcards.currentLanguage

    this.response
        .speak('Okay, I will ask you some questions about ' +
        currentLanguage + '. Here is your first question.' + 
                this.AskQuestion).listen(this.AskQuestion);
    this.emit(':responseReady');
  },

  // User gives an answer
  'AnswerIntent': function() {
    var currentLanguage = this.attributes.flashcards.currentLanguage;
    var currentFlashcardIndex = this.attributes.flashcards.languages[currentLanguage].currentFlashcardIndex;
    var userAnswer = this.event.request.intent.slots.answer.value;
    var languageAnswer = currentLanguage + 'Answer';
    var correctAnswer = flashcardsDictionary[currentFlashcardIndex][languageAnswer];

    if (userAnswer == correctAnswer){
        this.attributes.flashcards.languages[currentLanguage].numberCorrect++;
        var numberCorrect = this.attributes.flashcards.languages[currentLanguage].numberCorrect;
        this.response
          .speak('Nice job! The correct answer is ' + correctAnswer + '. You ' +
            'have gotten ' + numberCorrect + ' out of ' + DECK_LENGTH + ' ' +
            currentLanguage + ' questions correct. Here is your next question. ' + this.AskQuestion)
          .listen(this.AskQuestion);
    } else {
        var numberCorrect = this.attributes.flashcards.languages[currentLanguage].numberCorrect;
        this.response
          .speak('Sorry, the correct answer is ' + correctAnswer + '. You ' +
          'have gotten ' + numberCorrect + ' out of ' + DECK_LENGTH + ' ' +
          currentLanguage + ' questions correct. Here is your next question.' + 
                 this.AskQuestion).listen(this.AskQuestion);
    }

    this.attributes.flashcards.languages[currentLanguage].currentFlashcardIndex++;
    this.emit(':responseReady');
  },
  
   // Test my {language} knowledge
  'AskQuestion': function() {
    return "hello world";
    /*
    var currentLanguage = this.attributes.flashcards.currentLanguage;
    var currentFlashcardIndex = this.attributes.flashcards.languages[currentLanguage].currentFlashcardIndex;
    var currentQuestion = flashcardsDictionary[currentFlashcardIndex].question;

    this.response.listen('In ' + currentLanguage +', ' + currentQuestion);
    */
    this.response.listen('hello world jatin');
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
    alexa.dynamoDBTableName = 'CodecademyFlashcards';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

/*
In this lesson, you learned how to use DynamoDB to give your skill "long-term memory" — 
so it can remember session attributes across sessions.

To integrate a DynamoDB table into your Lambda function, remember the following:

We learned that adding DynamoDB to our skill takes only one line of code
.emit(‘:responseReady’) will save updated session attributes to DynamoDB.
To ensure that a session saves if a user quits or a session times out, 
include this.emit(‘:saveState’, true) in the SessionEndedRequest handler.
Provide your Lambda function IAM permissions so it has full access to DynamoDB.

*/
