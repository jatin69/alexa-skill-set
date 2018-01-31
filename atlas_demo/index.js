'use strict';
var Alexa = require("alexa-sdk");
var _ = require('lodash');
var request = require('request');

var appId = 'amzn1.ask.skill.71fae2b2-318e-466b-974c-842025fa446a';


exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
//    alexa.dynamoDBTableName = 'CitiesGameUsers';
    alexa.registerHandlers(newSessionHandlers, startGameHandlers, playModeHandlers);
    alexa.execute();
};

var states = {
    PLAYMODE: '_PLAYMODE', // User is trying to guess the number.
    STARTMODE: '_STARTMODE'  // Prompt the user to start or restart the game.
};

var newSessionHandlers = {
    'LaunchRequest': function () {
        console.log('LaunchRequest' + JSON.stringify(this.event.request));
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'NewSession': function () {
        console.log('NewSession' + JSON.stringify(this.event.request));

        if (Object.keys(this.attributes).length === 0) {
            this.attributes['endedSessionCount'] = 0;
            this.attributes['gamesPlayed'] = 0;
        }
        this.attributes['mustStartWith'] = '-';

        this.handler.state = states.STARTMODE;
        this.emitWithState('AMAZON.YesIntent');
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function () {
        var message = 'The game will start by you telling me the name of the US city, then we\'ll take turns naming us cities, ' +
            'but the city name must begin with the last letter of city name the was said previosly. Do you want to start the game?';
        this.emit(':ask', message, message);
    },
    'AMAZON.YesIntent': function () {
        this.handler.state = states.PLAYMODE;
        this.emit(':ask', 'Welcome to Cities Game! Please tell me a US City name to start the game.', 'Please say a US City name.');
    },
    'AMAZON.NoIntent': function () {
        this.emit(':tell', 'Ok, see you next time!');
    },
    'SessionEndedRequest': function () {
        console.log('SessionEndedRequest');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', 'Ok, see you next time!');
    },
    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', 'Ok, see you next time!');
    },
    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', 'Ok, see you next time!');
    },
    'Unhandled': function () {
        var message = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', message, message);
    }
});

var playModeHandlers = Alexa.CreateStateHandler(states.PLAYMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'CityChainIntent': function () {
        var intent = this;
        var city = this.event.request.intent.slots.city.value.toString();
        console.log('user said: ' + city);
        var message = '';
        if (intent.attributes['mustStartWith'] !== '-') {
            if (city.substring(0, 1).toLowerCase() !== intent.attributes['mustStartWith'].toLowerCase()) {
                message = city + ' does not begin with ' + intent.attributes['mustStartWith'] + '.<break strength="x-strong"/> Think of another city that starts with the letter ' +
                    intent.attributes['mustStartWith'] + '.<break strength="x-strong"/>  Go!';
                console.log(message);
                intent.emit(':ask', message);
            }
        }

        var validateUserInputOptions = {
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            qs:
            {
                address: city,
                components: 'country:US|locality',
                key: 'AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4'
            },
            headers:
            {
                'cache-control': 'no-cache'
            }
        };

        request(validateUserInputOptions, function (error, response, body) {
            if (error) {
                console.log('Error' + JSON.stringify(error));
                console.log('response' + JSON.stringify(response));
                console.log('body' + JSON.stringify(body));
                this.emitWithState('Unhandled');
            } //throw new Error(error);

            var jsonUserCityResponse = JSON.parse(body);
            var userCity = _.find(jsonUserCityResponse.results[0].address_components, function (o) { return _.includes(o.types, 'locality'); });

            if (userCity && (userCity.long_name.toLowerCase().indexOf(city.toLowerCase()) >= 0 || city.toLowerCase().indexOf(userCity.long_name.toLowerCase()) >= 0)) {
                var userCityName = userCity.long_name;
                var lastLetterOfUserCity = userCityName.slice(-1);

                var alexaOutputOptions = {
                    method: 'GET',
                    url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
                    qs:
                    {
                        input: lastLetterOfUserCity,
                        types: '(cities)',
                        components: 'country:us',
                        key: 'AIzaSyAIAzhG5a8ndrquII3dNMXAXFNnYWBIcpc'
                    },
                    headers:
                    {
                        'cache-control': 'no-cache'
                    }
                };

                request(alexaOutputOptions, function (error, response, body) {
                    if (error) {
                        console.log('Error' + JSON.stringify(error));
                        console.log('response' + JSON.stringify(response));
                        console.log('body' + JSON.stringify(body));
                        this.emitWithState('Unhandled');
                    } //throw new Error(error);

                    var jsonAlexaCityResponse = JSON.parse(body);
                    var alexaCity = jsonAlexaCityResponse.predictions[getRandomInt(0, jsonAlexaCityResponse.predictions.length)];
                    intent.attributes['mustStartWith'] = alexaCity.structured_formatting.main_text.slice(-1);
                    message = 'You said ' + userCity.long_name + '<break strength="x-strong"/> so my city has to start with the letter ' + lastLetterOfUserCity + '. ' +
                        'Hmmm <break strength="x-strong"/> I think I\'ll go with ' + alexaCity.structured_formatting.main_text +
                        ',<break strength="x-strong"/> so your city has to start with the letter ' + intent.attributes['mustStartWith'] + '. Go!'
                    console.log(message);
                    intent.emit(':ask', message);
                });

            }
            else {
                message = 'Hmm <break strength="x-strong"/> . ' + city +
                    ' <break strength="x-strong"/> never heard of that city. <break strength="x-strong"/> Think of another city that starts with the letter ' +
                    intent.attributes['mustStartWith'] + '. <break strength="x-strong"/>  Go!';
                console.log(message);
                if (intent.attributes['mustStartWith'] !== '-') {
                    intent.emit(':ask', message, 'Please say the name of the US city that starts with the letter ' + intent.attributes['mustStartWith']);
                } else {
                    intent.emit(':ask', 'Hmm <break strength="x-strong"/> . ' + city +
                        ' <break strength="x-strong"/> never heard of that city. <break strength="x-strong"/> Think of another US city name. <break strength="x-strong"/>  Go!',
                        'Please say the name of the US city');
                }
            }
        });

    },
    'AMAZON.HelpIntent': function () {
        var message = 'The game will start by you telling me the name of the US city, then we\'ll take turns naming us cities, ' +
            'but the city name must begin with the last letter of city name the was said previosly. Try saying a US city name ';
        if (this.attributes['mustStartWith'] !== '-') {
            this.emit(':ask', message + 'that begins with ' + this.attributes['mustStartWith'],
                'Try saying a city name that begins with ' + this.attributes['mustStartWith']);
        } else {
            this.emit(':ask', message, 'Try saying a city name.');
        }
    },
    'SessionEndedRequest': function () {
        console.log('SessionEndedRequest');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', 'Ok, see you next time!');
    },
    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', 'Ok, see you next time!');
    },
    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', 'Ok, see you next time!');
    },
    'Unhandled': function () {
        if (this.attributes['mustStartWith'] !== '-') {
            this.emit(':ask', 'Sorry, I didn\'t get that. Please say a US city name that begins with ' + this.attributes['mustStartWith'],
                'Try saying a US city name that begins with ' + this.attributes['mustStartWith']);
        } else {
            this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a US city name.', 'Try saying a US city name.');
        }
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}