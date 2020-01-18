/* eslint-disable  func-names */
/* eslint-disable  no-console */
// IMPORTANT: Please note that this template uses Dispay Directives,
// Display Interface for your skill should be enabled through the Amazon
// developer console See this screenshot - https://alexa.design/enabledisplay


// make changes here only

const SKILL_NAME = 'surprise me';
const GET_FACT_MESSAGE = '';
const HELP_MESSAGE =
  'You can say, surprise me, or, you can say bye to exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
  // quotes
  'Dr. Suess said, Don\'t cry because it\'s over, smile because it happened.',
  'Oscar Wilde said, Be yourself; everyone e\'lse is already taken.',
  'Alber Einstein once jokingly said, Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe.',
  'Be who you are and say what you feel, because those who mind don\'t matter, and those who matter don\'t mind.',
  'Mae West said, You only live once, but if you do it right, once is enough.',
  'Mahatma Gandhi said, Be the change that you wish to see in the world.',
  'Mahatma Gandhi said, Live as if you were to die tomorrow. Learn as if you were to live forever.',
  'Remind yourself that, If you tell the truth, you don\'t have to remember anything.',
  'A friend is someone who knows all about you and still loves you.',
  'Oscar Wilde said, To live is the rarest thing in the world. Most people exist, that is all.',
  'Tom Magliozzi said, Never let the facts stand in the way of a good answer.',

  // facts
  'More than one million Earths could fit inside the Sun.',
  'A baby fetus develops fingerprints at eighteen weeks.',
  'sixty cows can produce a ton of milk each day',
  'It is possible to lead a cow upstairs but not downstairs.',
  'A hippo can open its mouth wide enough to fit a 4 foot tall child inside.',
  'Some ribbon worms will eat themselves if they can\'t find any food.',
  'Recycling one glass jar saves enough energy to watch TV for 3 hours.',
  'Quizzing Game shows are designed to make us feel better about the random, useless facts that are all we have left of our education.',
  'Time does\'nt exist. Clocks exists.',
  'I think sex is better than logic, but I can\'t prove it.',
  'Cockroaches can live for weeks without their heads until they die of hunger.',
  'Humans share 50% of their DNA with bananas.',
  'Bill Clinton sent only two mail during his entire presidency.',
  'Elephants are terrified of bees, and actually they have a distinct, special vocalization for "run away, the bees are angry".',

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
        title: 'Surprise !',
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