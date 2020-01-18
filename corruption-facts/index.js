/* eslint-disable  func-names */
/* eslint-disable  no-console */
// IMPORTANT: Please note that this template uses Dispay Directives,
// Display Interface for your skill should be enabled through the Amazon developer console
// See this screenshot - https://alexa.design/enabledisplay

const Alexa = require('ask-sdk');

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const factArr = data;
    const factIndex = Math.floor(Math.random() * factArr.length);
    const randomFact = factArr[factIndex];
    const speechOutput = GET_FACT_MESSAGE + randomFact;
 if (supportsDisplay(handlerInput) ) {
      const myImage1 = new Alexa.ImageHelper()
        .addImageInstance(DisplayImg1.url)
        .getImage();

      const myImage2 = new Alexa.ImageHelper()
        .addImageInstance(DisplayImg2.url)
        .getImage();

      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(speechOutput)
        .getTextContent();

      handlerInput.responseBuilder.addRenderTemplateDirective({
        type: 'BodyTemplate1',
        token: 'string',
        backButton: 'HIDDEN',
        backgroundImage: myImage2,
        // image: myImage1,
        title: "corruption facts",
        textContent: primaryText,
      });

}


    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {

          if (supportsDisplay(handlerInput)) {


      handlerInput.responseBuilder.addVideoAppLaunchDirective("https://s3.amazonaws.com/media.dabblelab.com/video/visual-escape-01.mp4", "Video from pixabay.com",
        "Used under creative commons.");
        
      return handlerInput.responseBuilder.speak("Heres your video").getResponse();

}
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {

    if (supportsDisplay(handlerInput) ) {
      const myImage1 = new Alexa.ImageHelper()
        .addImageInstance(DisplayImg1.url)
        .getImage();

      const myImage2 = new Alexa.ImageHelper()
        .addImageInstance(DisplayImg2.url)
        .getImage();

      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(STOP_MESSAGE)
        .getTextContent();

      handlerInput.responseBuilder.addRenderTemplateDirective({
        type: 'BodyTemplate7',
        token: 'string',
        backButton: 'HIDDEN',
        backgroundImage: myImage2,
        image: myImage1,
        title: "corruption facts",
        // textContent: STOP_MESSAGE,
      });

}

    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Corruption Facts';
const GET_FACT_MESSAGE = 'It is a fact that ';
const HELP_MESSAGE = 'You can say, tell me a corruption fact, or, you can say exit.. What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
  'The most creative step was taken by 5th Pillar for the creation of the zero rupee note (to give to corrupt officials when they request bribes).',
 'There is currently no exclusive legislation to check corruption in the private sector in India.',
  'Corruption is often strong in countries with the smallest per capita incomes. Sadly India is one of them having low per capita income.',
  'Because corruption is willfully hidden, it is impossible to measure it directly.',
  'It is estimated that around one trillion US dollars is paid in bribes each year worldwide.'
];

const skillBuilder = Alexa.SkillBuilders.standard();

/* INTERCEPTOR */

const logResponseInterceptor = {
  process(handlerInput, response) {
      console.log('in logResponseInterceptor');
      console.log(JSON.stringify(handlerInput.responseBuilder.getResponse(), null, 2));
  },
};

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addResponseInterceptors(logResponseInterceptor)
  .lambda();

/* HELPER FUNCTIONS */

// returns true if the skill is running on a device with a display (show|spot)
function supportsDisplay(handlerInput) {
  var hasDisplay =
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display

  console.log("Supported Interfaces are" + JSON.stringify(handlerInput.requestEnvelope.context.System.device.supportedInterfaces));
  return hasDisplay;
}

const DisplayImg1 = {
  title: 'Jet Plane',
  url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
};
const DisplayImg2 = {
  title: 'Starry Sky',
  url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

};
