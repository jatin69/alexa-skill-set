/* eslint-disable  func-names */
/* eslint-disable  no-console */
// IMPORTANT: Please note that this template uses Dispay Directives,
// Display Interface for your skill should be enabled through the Amazon
// developer console See this screenshot - https://alexa.design/enabledisplay

// make changes here only

const SKILL_NAME = 'westworld quotes';
const GET_FACT_MESSAGE = '';
const HELP_MESSAGE =
  'You can say, "tell me a quote", or, you can say bye to exit... What do you want to do?';
const HELP_REPROMPT = 'What do you want to do?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
  // westworld quotes
  'Bernard once said, People like to read about the things that they want the most and experience the least.',
  'All my life. I\'ve prided myself on being a survivor. But surviving, is just another loop.',
  'Dolores once said, Someday sounds a lot like the thing people say when they actually mean never.',
  'When you\'re suffering, that\'s when you\'re most real.',
  'What is real? That which is irreplaceable, is real.',
  'Beauty, is a lure.',
  'Have you ever questioned the nature of your reality? Did you ever stop to wonder about your actions? The price you\'d have to pay if there was a reckoning? That reckoning is here.',
  'If you try something like that again, I will relieve you of your most precious organ, and feed it to you. Though it won\'t make much of a meal.',
  'We have toiled in God\'s service long enough. So I killed Him. And if you want to get to Glory, you won\'t be looking for His favor. You\'ll need mine.',
  'Folly of my kind, there\'s always a yearning for more.',
  'To grow we all need to suffer.',
  'If you can’t tell the difference, does it matter if I\'m real or not?',
  'Winning doesn\'t mean anything unless someone else loses, which means you\'re here to be the loser.',
  'I like to remember what my father taught me. That at one point or another, we were all new to this world.',
  'He is in pain. What kind of people would we be if we simply let him suffer?',
  'Evolution, forged the entirety of sentient life on this planet using only one tool. The mistake.',
  'This whole world is a story. I\'ve read every page except the last one. I need to find out how it ends. I want to know what this all means.',
  'It\'s a difficult thing, realizing your entire life is some hideous fiction.',
  'If you go looking for the truth, get the whole thing. It’s like a good fuck. Half is worse than none at all.',
  'Some people choose to see the ugliness in this world. The disarray. I choose to see the beauty. To believe there is an order to our days, a purpose.',
  'I\'ve told you Bernard. Never place your trust in us. We’re only human. Inevitably, we will disappoint you.',
  'Never start something you’re not willing to finish. And if you’re getting fucked either way, go with the lucrative version sweetheart.',
  'I have come to think of so much of consciousness as a burden, a weight, and we have spared them that.',
  'My father used to say, only boring people get bored.',
  'There\'s a path for everyone.',
  'Real love is always worth waiting for.',
];

const DisplayImg1 = {
  title: 'Jet Plane',
  url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
};
const DisplayImg2 = {
  title: 'Space',
  url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'
};


// do not change below this line

const Alexa = require('ask-sdk');

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest' ||
      (request.type === 'IntentRequest' &&
        request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const factArr = data;
    const factIndex = Math.floor(Math.random() * factArr.length);
    const randomFact = factArr[factIndex];
    const speechOutput = GET_FACT_MESSAGE + randomFact;
    if (supportsDisplay(handlerInput)) {
      const myImage1 =
        new Alexa.ImageHelper().addImageInstance(DisplayImg1.url).getImage();

      const myImage2 =
        new Alexa.ImageHelper().addImageInstance(DisplayImg2.url).getImage();

      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(speechOutput)
        .getTextContent();

      handlerInput.responseBuilder.addRenderTemplateDirective({
        type: 'BodyTemplate1',
        token: 'string',
        backButton: 'HIDDEN',
        backgroundImage: myImage2,
        // image: myImage1,
        title: 'Westworld Quotes',
        textContent: primaryText,
      });
    }


    return handlerInput.responseBuilder.speak(speechOutput)
      .withSimpleCard(SKILL_NAME, randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {

    if (supportsDisplay(handlerInput)) {
      handlerInput.responseBuilder.addVideoAppLaunchDirective(
        'https://s3.amazonaws.com/media.dabblelab.com/video/visual-escape-01.mp4',
        'Video from pixabay.com', 'Used under creative commons.');

      return handlerInput.responseBuilder.speak('Heres your video')
        .getResponse();
    }
    return handlerInput.responseBuilder.speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {

    if (supportsDisplay(handlerInput)) {
      const myImage1 =
        new Alexa.ImageHelper().addImageInstance(DisplayImg1.url).getImage();

      const myImage2 =
        new Alexa.ImageHelper().addImageInstance(DisplayImg2.url).getImage();

      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(STOP_MESSAGE)
        .getTextContent();

      handlerInput.responseBuilder.addRenderTemplateDirective({
        type: 'BodyTemplate7',
        token: 'string',
        backButton: 'HIDDEN',
        backgroundImage: myImage2,
        image: myImage1,
        title: 'Goodbye',
        // textContent: STOP_MESSAGE,
      });
    }

    return handlerInput.responseBuilder.speak(STOP_MESSAGE).getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${
                                              handlerInput.requestEnvelope
                                                  .request.reason
                                            }`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder.speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};


// names & facts constants

const skillBuilder = Alexa.SkillBuilders.standard();

/* INTERCEPTOR */

const logResponseInterceptor = {
  process(handlerInput, response) {
    console.log('in logResponseInterceptor');
    console.log(
      JSON.stringify(handlerInput.responseBuilder.getResponse(), null, 2));
  },
};

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler, HelpHandler, ExitHandler,
    SessionEndedRequestHandler)
  .addErrorHandlers(ErrorHandler)
  .addResponseInterceptors(logResponseInterceptor)
  .lambda();

/* HELPER FUNCTIONS */

// returns true if the skill is running on a device with a display (show|spot)
function supportsDisplay(handlerInput) {
  var hasDisplay = handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces
    .Display

  console.log(
    'Supported Interfaces are' +
    JSON.stringify(handlerInput.requestEnvelope.context.System.device
      .supportedInterfaces));
  return hasDisplay;
}

// const image URLs