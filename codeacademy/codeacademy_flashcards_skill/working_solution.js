// Test my {language} knowledge
  function AskQuestion(attributes) {
    //return "hello" + attributes.flashcards.currentLanguage;
    var currentLanguage = attributes.flashcards.currentLanguage;
    var currentFlashcardIndex = attributes.flashcards.languages[currentLanguage].currentFlashcardIndex;
    var currentQuestion = flashcardsDictionary[currentFlashcardIndex].question;
    var formedQues = 'In ' + currentLanguage +', ' + currentQuestion;
    return formedQues;
  }


var handlers = [
'SetMyLanguageIntent': function() {
    this.attributes.flashcards.currentLanguage = this.event.request.intent.slots.languages.value;
    var currentLanguage = this.attributes.flashcards.currentLanguage

    this.response
        .speak('Okay, I will ask you some questions about ' +
        currentLanguage + '. Here is your first question.' + 
                AskQuestion(this.attributes)).listen(AskQuestion(this.attributes));
    this.emit(':responseReady');
  }
]
