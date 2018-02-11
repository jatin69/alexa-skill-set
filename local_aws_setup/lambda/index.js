'use strict';
var Alexa = require("alexa-sdk");
var _ = require('lodash');
//var request = require('request');
var rp = require('request-promise');
var appId = 'amzn1.ask.skill.71fae2b2-318e-466b-974c-842025fa446a';
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
//    alexa.dynamoDBTableName = 'CitiesGameUsers';
    alexa.registerHandlers(newSessionHandlers, startGameHandlers, chooseModeHandlers, playModeHandlers);
    alexa.execute();
};

var states = {
    PLAYMODE: '_PLAYMODE', // User is trying to guess the number.
    CHOOSEMODE: '_CHOOSEMODE',
    STARTMODE: '_STARTMODE'  // Prompt the user to start or restart the game.
};

var MSG = {
    'END_MESSAGE': '<say-as interpret-as = "interjection"> Okay, see you next time! bye !</say-as>',
    'NOT_FOUND': '<say-as interpret-as = "interjection">Hmmmm. </say-as><break time="400ms"/> Never heard of this place,' +
            'Think of another place! <say-as interpret-as = "interjection"> Go ! </say-as>',
    'NOT_VALID': '<say-as interpret-as = "interjection">Hmmmm. </say-as>' +
            'That does not seem like a valid place. ' +
            'Think of another place! <say-as interpret-as = "interjection"> Go ! </say-as>',
    'ALREADY_USED': '<say-as interpret-as = "interjection">Oh ho! </say-as>' +
            'We have already used this place in the game. ' +
            'Think of another place, <say-as interpret-as = "interjection">GO! </say-as>',
    'RE': 'Please say the name of a place.'
};

var CARD = {
    'title': {
        'normal': "Atlas Adventure",
        'world': "Atlas Adventure : World Mode ",
        'country': "Atlas Adventure : Country Mode - "
    }
};

var newSessionHandlers = {
    'LaunchRequest': function () {
        //console.log('LaunchRequest' + JSON.stringify(this.event.request));
        console.log("Launch Request Initiated");
        this.emit('NewSession');
    },
    'NewSession': function () {
        //console.log('NewSession' + JSON.stringify(this.event.request));
        console.log("Hello Dev, Starting a brand new session.");

        this.attributes['mustStartWith'] = '-';
        this.attributes['userCityFullName'] = '';
        this.attributes['alreadyUsed'] = [];
        this.attributes['gameMode'] = '';
        this.attributes['countryModeFullName'] = '';
        this.attributes['formatted_add'] = '';
        this.attributes['prevIntentMessage'] = '';
        this.attributes['last_place_name'] = '';
        this.attributes['lifelineCount'] = 3;

        this.handler.state = states.STARTMODE;
        this.emitWithState('AMAZON.YesIntent');
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession');
        // Uses the handler in newSessionHandlers
    },
    'AMAZON.YesIntent': function () {
        let prompt = 'Hey, Welcome to Atlas adventure ! The Game has two modes, WORLD mode, and COUNTRY mode. ' +
                '<say-as interpret-as = "interjection"> In the WORLD mode, </say-as> we are free to use any place in the world. ' +
                'You can choose the world mode simply by saying <say-as interpret-as = "interjection"> world mode. </say-as>  ' +
                '<say-as interpret-as = "interjection"> whereas  </say-as> ' +
                'In country Mode, We\'ll set a country limit. All the places we say will have to be from that country. ' +
                'You can choose the country mode <say-as interpret-as = "interjection"> simply </say-as> by saying the name of the country. ' +
                'So which mode do you want to play in ? World Mode or Country mode ?';
        this.attributes['prevIntentMessage'] = prompt;
        let reprompt = "Choose a mode by saying 'World' or a country name .";
        this.handler.state = states.CHOOSEMODE;

        let cardTitle = CARD.title.normal;
        let cardContent = 'Choose a Mode\n\n\
                        Say "World Mode" , or\n\
                        Say a country name eg "US" ';
        this.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
//        this.emit(':ask', prompt, reprompt);       
    },
    'AMAZON.NoIntent': function () {
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.HelpIntent': function () {
        let prompt = 'The game will start by you telling me the name of a valid Place. ' +
                'A valid place can be a city, state, country, or even a continent ' +
                '<say-as interpret-as = "interjection">anywhere in the world. </say-as> ' +
                'Then we\'ll take turns naming valid places, <say-as interpret-as = "interjection">but</say-as> ' +
                'the place name must begin with the last letter of place name the was said previously. ' +
                'Do you want to start the game ?';
        this.attributes['prevIntentMessage'] = prompt;
        let reprompt = 'Do you want to start the game ?';
//      this.emit(':ask', prompt, reprompt);
        let cardTitle = CARD.title.normal;
        let cardContent = 'Welcome to Atlas Adventure.\n ' + "Do you want to Start the game ? \n Say yes ! ";
        this.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);

    },
    'SessionEndedRequest': function () {
        console.log('SessionEndedRequest');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.RepeatIntent': function () {
        let prompt = this.attributes['prevIntentMessage'];
        this.emit(':ask', prompt, prompt);
    },
    'defeatIntent': function () {
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'Unhandled': function () {
        let prompt = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', prompt, prompt);
    }
});

var chooseModeHandlers = Alexa.CreateStateHandler(states.CHOOSEMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'CityChainIntent': function () {
        console.log("Inside city chain of choose mode");
        if (this.attributes['gameMode'] !== '') {
            let prompt = 'You have already chosen a mode. Shall we begin the game ?';
            this.emit(':ask', prompt, prompt);
        }

        const city = obtainUserCity(this.event.request.intent.slots);
        if (city === "world" || city === "world mode") {
            console.log("world mode inside choose mode");
            let prompt = '<say-as interpret-as = "interjection">I see ! You have an eye on the world. </say-as>' +
                    'So shall we start the game ? ';
            this.attributes['prevIntentMessage'] = prompt;
            this.attributes['gameMode'] = 'world';
            console.log("chosen game mode is  ", this.attributes['gameMode']);
            let reprompt = 'Shall we start the game ? ';
            this.emit(':askWithCard', prompt, reprompt, CARD.title.world, "Say Yes !");
        } else {
            var validateUserInputOptions = {
                method: 'GET',
                url: 'https://maps.googleapis.com/maps/api/geocode/json',
                qs:
                        {
                            address: city,
                            key: 'AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4'
                        },
                headers:
                        {
                            'cache-control': 'no-cache'
                        }
            };
            var intent = this;
            rp(validateUserInputOptions)
                    .then(function (response) {

                        const jsonUserCityResponse = JSON.parse(response);
                        //console.log(prettyJSON(jsonUserCityResponse));
                        const responseStatus = jsonUserCityResponse.status;
                        //console.log(responseStatus);
                        let isvalid = "";
                        if (responseStatus !== "OK") {
                            console.log("Response status is Not OK. Nothing found man.");
//                            intent.attributes['shortcutChooseMode'] = '';
                            intent.emit('Unhandled');
                        } else {
                            /* List of places can be found at https://developers.google.com/maps/documentation/geocoding/intro  */
                            const validPlacesList = ['country'];
                            let matchType = jsonUserCityResponse.results[0].types;
                            isvalid = matchType.some(r => validPlacesList.includes(r));
                            if (!isvalid) {
                                let prompt = '<say-as interpret-as = "interjection">Hmmm</say-as> ' +
                                        ' I haven\'t heard about this country. ' +
                                        'Choose some other country or <say-as interpret-as = "interjection">just choose the WORLD mode.</say-as> ';
                                let reprompt = "Choose a mode by saying 'World' or a country name .";
                                intent.attributes['prevIntentMessage'] = reprompt;
                                let cardTitle = CARD.title.normal;
                                let cardContent = 'Choose a Mode\n\n\
                                                    Say "World Mode" , or\n\
                                                    Say a country name eg "US" ';
                                intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                            } else {
                                console.log("Place is Valid.");
                            }

                            let userCity = _.find(jsonUserCityResponse.results[0].address_components,
                                    function (o) {
                                        return arrayContainsArray(o.types, jsonUserCityResponse.results[0].types);
                                        //return _.includes(o.types, 'locality' ); 
                                    });
                            const alpha2Code = userCity.short_name;
                            let country_name = userCity.long_name;
                            intent.attributes['gameMode'] = alpha2Code;
                            intent.attributes['countryModeFullName'] = country_name;
                            console.log("country code is : ", alpha2Code);
                            console.log("valid country mode");
                            let prompt = '<say-as interpret-as = "interjection">I see ! You Chose ' + country_name + ' </say-as>' +
                                    'So shall we start the game ? ';
                            intent.attributes['prevIntentMessage'] = prompt;
                            let reprompt = 'Shall we start the game ? ';
                            let cardTitle = CARD.title.country + country_name;
                            let cardContent = "Say Yes !";
                            intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                        }
                    })
                    .catch(function (error) {
                        console.log('Error' + error);
                        intent.emit('Unhandled');
                    });
        }

    },
    'AMAZON.YesIntent': function () {
        console.log("inside YES");
        if (this.attributes['gameMode'] === '') {
            console.log("jump to unhandle");
            this.emit('Unhandled');
        } else {
            let prompt = 'Hello and welcome to Atlas Adventure !! ' +
                    ' Please tell me a Place name to start the game.';
            this.attributes['prevIntentMessage'] = prompt;
            let reprompt = MSG.RE;
            this.handler.state = states.PLAYMODE;

            let cardTitle = '';
            if (this.attributes['gameMode'] === "world" || this.attributes['gameMode'] === "world mode") {
                cardTitle = CARD.title.world;
            } else {
                cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
            }

            let cardContent = "Say a Place Name !";
            this.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
        }
    },
    'AMAZON.NoIntent': function () {
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.HelpIntent': function () {
        let prompt = 'Hey, Welcome to Atlas adventure ! The Game has two modes, WORLD mode, and COUNTRY mode. ' +
                '<say-as interpret-as = "interjection"> In the WORLD mode, </say-as> we are free to use any place in the world. ' +
                'You can choose the world mode simply by saying <say-as interpret-as = "interjection"> world mode. </say-as>  ' +
                '<say-as interpret-as = "interjection"> whereas  </say-as> ' +
                'In country Mode, We\'ll set a country limit. All the places we say will have to be from that country. ' +
                'You can choose the country mode <say-as interpret-as = "interjection"> simply </say-as> by saying the name of the country. ' +
                'So which mode do you want to play in ? World Mode or Country mode ?';
        this.attributes['prevIntentMessage'] = prompt;
        let reprompt = "Choose a mode by saying 'World' or a country name .";
        let cardTitle = CARD.title.normal;
        let cardContent = 'Choose a Mode\n\n\
                        Say "World Mode" , or\n\
                        Say a country name eg "US" ';
        this.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
    },
    'SessionEndedRequest': function () {
        console.log('SessionEndedRequest');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.RepeatIntent': function () {
        let prompt = this.attributes['prevIntentMessage'];
        this.emit(':ask', prompt, prompt);
    },
    'defeatIntent': function () {
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'Unhandled': function () {
        let prompt = 'Please Choose the Game Mode';
        this.emit(':ask', prompt, prompt);
    }
});

function obtainUserCity(slots) {
    let city = 'undef';
    city = ("value" in slots.UScity) ? slots.UScity.value
            : ("value" in slots.USstate) ? slots.USstate.value
            : ("value" in slots.GBcity) ? slots.GBcity.value
            : ("value" in slots.GBregion) ? slots.GBregion.value
            : ("value" in slots.EUROPEcity) ? slots.EUROPEcity.value
            : ("value" in slots.DEregion) ? slots.DEregion.value
            : ("value" in slots.country) ? slots.country.value
            : ("value" in slots.ATregion) ? slots.ATregion.value
            : ("value" in slots.ATcity) ? slots.ATcity.value
            : "undef";
    return city.toString();
}
var playModeHandlers = Alexa.CreateStateHandler(states.PLAYMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'CityChainIntent': function () {

        // storing current intent because it may get lost in promises
        const intent = this;
        var city = obtainUserCity(this.event.request.intent.slots);
        if (city === "undef") {
            intent.emitWithState('Unhandled');
        }

        console.log('user said: ' + city);
        if (intent.attributes['mustStartWith'] !== '-') {
            if (city.substring(0, 1).toLowerCase() !== intent.attributes['mustStartWith'].toLowerCase()) {

                let prompt = city + ' does not begin with ' + intent.attributes['mustStartWith'] +
                        '. <break strength="x-strong"/> Think of another place that starts with the letter ' +
                        intent.attributes['mustStartWith'] + '.<break strength="x-strong"/> Go!';
                let reprompt = MSG.RE + 'that starts with the letter ' + intent.attributes['mustStartWith'];
                intent.attributes['prevIntentMessage'] = reprompt;
                console.log(prompt);

                let cardTitle = '';
                let cardContent = reprompt;
                if (this.attributes['gameMode'] === "world" || this.attributes['gameMode'] === "world mode") {
                    cardTitle = CARD.title.world;
                } else {
                    cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                }
                intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
            }
        }

        var place = city;
        // validate user guess
        var validateUserInputOptions = {
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            qs:
                    {
                        address: place,
                        //play worldwide
                        //components: 'country:US',
                        //components: 'country:INDIA',
                        key: 'AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4'
                    },
            headers:
                    {
                        'cache-control': 'no-cache'
                    }
        };
        console.log("game mode is ", intent.attributes['gameMode']);
        if (intent.attributes['gameMode'] === '') {
            console.log("empty mode");
            intent.handler.state = states.CHOOSEMODE;
            intent.emitWithState('Unhandled');
        } else if (intent.attributes['gameMode'] === 'world') {
            console.log("world mode");
        } else {
            validateUserInputOptions.qs.components = 'country:' + intent.attributes['gameMode'];
        }

        rp(validateUserInputOptions)
                .then(function (response) {
                    var jsonUserCityResponse = JSON.parse(response);
                    //console.log('Entire city log is ::::::::::::::::::::::::::::::: done');
                    //console.log(prettyJSON(jsonUserCityResponse));

                    var responseStatus = jsonUserCityResponse.status;
                    console.log("Google API returned response : ", responseStatus);
                    if (responseStatus !== "OK") {
                        let prompt = MSG.NOT_FOUND;
                        let reprompt = MSG.RE;
                        intent.attributes['prevIntentMessage'] = reprompt;
                        let cardTitle = '';
                        let cardContent = reprompt;
                        if (this.attributes['gameMode'] === "world" || this.attributes['gameMode'] === "world mode") {
                            cardTitle = CARD.title.world;
                        } else {
                            cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                        }
                        intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                    }

                    /* 
                     List of places can be found at https://developers.google.com/maps/documentation/geocoding/intro  
                     */
                    var validPlacesList = ['political',
                        'country',
                        'administrative_area_level_1',
                        'administrative_area_level_2',
                        'administrative_area_level_3',
                        'administrative_area_level_4',
                        'administrative_area_level_5',
                        'colloquial_area',
                        'locality',
                        'continent',
                        'natural_feature'
                    ];
                    var foundType = jsonUserCityResponse.results[0].types;
                    var isvalid = foundType.some(r => validPlacesList.includes(r));
                    //var isvalid = _.includes(jsonUserCityResponse.results[0].types, locality )

                    if (!isvalid) {
                        console.log("You have failed this city. This isn't a valid place.");
                        let prompt = MSG.NOT_VALID;
                        let reprompt = MSG.RE;
                        intent.attributes['prevIntentMessage'] = reprompt;
                        let cardTitle = '';
                        let cardContent = reprompt;
                        if (this.attributes['gameMode'] === "world" || this.attributes['gameMode'] === "world mode") {
                            cardTitle = CARD.title.world;
                        } else {
                            cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                        }
                        intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);

                    } else {
                        console.log("Place is Valid. Moving forward.");
                    }

                    console.log("setting last_place_name to blank as new turn now.");
                    intent.attributes['last_place_name'] = '';
                    var userCity = _.find(jsonUserCityResponse.results[0].address_components,
                            function (o) {
                                return arrayContainsArray(o.types, jsonUserCityResponse.results[0].types);
                            });

                    // if place is invalid => crashes to catch => unhandled intent
                    var userCityFullName = userCity.long_name;
                    if (intent.attributes['mustStartWith'] !== '-') {
                        /// test
                        if (userCityFullName.substring(0, 1).toLowerCase() !== intent.attributes['mustStartWith'].toLowerCase()) {

                            console.log("failed to match first character in google map api check.");
                            let prompt = userCityFullName + ' does not begin with ' + intent.attributes['mustStartWith'] +
                                    '. <break strength="x-strong"/> Think of another place that starts with the letter ' +
                                    intent.attributes['mustStartWith'] + '.<break strength="x-strong"/> Go!';
                            let reprompt = MSG.RE + 'that starts with the letter ' + intent.attributes['mustStartWith'];
                            intent.attributes['prevIntentMessage'] = reprompt;
                            console.log(prompt);
                            let cardTitle = '';
                            let cardContent = reprompt;
                            if (this.attributes['gameMode'] === "world" || this.attributes['gameMode'] === "world mode") {
                                cardTitle = CARD.title.world;
                            } else {
                                cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                            }
                            intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                        }
                    }



                    var user_place_id = jsonUserCityResponse.results[0].place_id;
//                    console.log("already used is : ", intent.attributes['alreadyUsed'], ":::::::::::::::::::");
                    //var arr = intent.attributes['alreadyUsed'] ;
                    if (intent.attributes['alreadyUsed'] === undefined) {
                        console.log("emptying already used array");
                        intent.attributes['alreadyUsed'] = [];
                    }

//                    console.log("already used is : ", intent.attributes['alreadyUsed'], ":::::::::::::::::::");
                    var foundPosition = intent.attributes['alreadyUsed'].indexOf(user_place_id.toString());
                    if (foundPosition !== -1) {
                        // exists
                        console.log('place id already exists');
                        let prompt = 'You said ' + userCityFullName + '. ' + MSG.ALREADY_USED;
                        let reprompt = 'We have already used this place in the game. \nThink of another place, Go !';

                        let cardTitle = '';
                        let cardContent = reprompt;
                        if (this.attributes['gameMode'] === "world" || this.attributes['gameMode'] === "world mode") {
                            cardTitle = CARD.title.world;
                        } else {
                            cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                        }
                        intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                    }


                    intent.attributes['userCityFullName'] = userCityFullName;
                    var lastLetterOfUserCity = userCityFullName.slice(-1);
                    intent.attributes['alreadyUsed'].push(user_place_id);
                    console.log("Place ID is ", user_place_id);

                    console.log("Complete formatted address is : ", jsonUserCityResponse.results[0].formatted_address);
                    console.log("Place is :", userCityFullName, "  and last letter is :", lastLetterOfUserCity);
                    // for truly random => think some other way if possible [imp]
                    let alphabets = 'abcdefghijklmnopqrstuvwxyz';
//                     commonly sound cities
//                    let alphabets = 'abcdefghijklmnoprstuv';
                    lastLetterOfUserCity += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
                    console.log("last letter identified and is ", lastLetterOfUserCity);
                    // find a guess for alexa
                    var alexaOutputOptions = {
                        method: 'GET',
                        url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
                        qs:
                                {
                                    input: lastLetterOfUserCity,
                                    types: '(cities)',
//                                    types: '(regions)',
                                    //components: 'country:us',
                                    key: 'AIzaSyAIAzhG5a8ndrquII3dNMXAXFNnYWBIcpc'
                                },
                        headers:
                                {
                                    'cache-control': 'no-cache'
                                }
                    };
                    if (intent.attributes['gameMode'] === '') {
                        this.handler.state = states.CHOOSEMODE;
                        intent.emitWithState('Unhandled');
                    } else if (intent.attributes['gameMode'] === 'world') {

                    } else {
                        alexaOutputOptions.qs.components = 'country:' + intent.attributes['gameMode'];
                    }

                    rp(alexaOutputOptions)
                            .then(function (response) {

                                var jsonAlexaCityResponse = JSON.parse(response);
                                const responseStatusAlexa = jsonAlexaCityResponse.status;
                                //console.log(responseStatus);
                                if (responseStatusAlexa === "ZERO_RESULTS") {
                                    console.log("Response status is ", responseStatusAlexa);
                                    let prompt = 'I can\'t find a city starting with ' + intent.attributes['mustStartWith'] +
                                            '. You won. <say-as interpret-as = "interjection"> Congratulations !! </say-as> ' +
                                            '<break time="1s"/> I\'ll see you later <say-as interpret-as = "interjection"> Bye !! </say-as>';

                                    let cardTitle = '';
                                    let cardContent = 'Congratulations ! \nYou Won !!';
                                    if (this.attributes['gameMode'] === "world" || this.attributes['gameMode'] === "world mode") {
                                        cardTitle = CARD.title.world;
                                    } else {
                                        cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                                    }
                                    intent.emit(':tellWithCard', prompt, cardTitle, cardContent);

                                }

                                var alexafoundPosition = -2;
                                var alexaCity = 'undef';
                                var alexa_place_id = 'undef';
//                                var found_city = "";
                                var count = 7;
                                while (alexafoundPosition !== -1) {
                                    if (count === 0) {
                                        console.log("Loop Failure.");
                                        intent.emit('Unhandled');
                                    }
                                    alexaCity = jsonAlexaCityResponse.predictions[getRandomInt(0, jsonAlexaCityResponse.predictions.length)];
                                    alexa_place_id = alexaCity.place_id;
                                    alexafoundPosition = intent.attributes['alreadyUsed'].indexOf(alexa_place_id);
                                    if (alexafoundPosition !== -1) {
                                        // exists
                                        console.log('ALEXA FOUND A PLACE WHOSE place id already exists. ::: RE PICKING');
                                        count = count - 1;
                                        //this.emit(':ask',MSG.ALREADY_USED);
                                    }
                                }

                                var found_city = alexaCity.structured_formatting.main_text;
                                var guessedPlace = found_city.replace(/[^a-zA-Z ]/g, "");
                                intent.attributes['last_place_name'] = guessedPlace;
//                              var guessedPlace = alexaCity.structured_formatting.main_text;
                                //var guessedPlace = found_city;
                                var locatedIn = alexaCity.structured_formatting.secondary_text;
                                intent.attributes['alreadyUsed'].push(alexa_place_id);
                                console.log('Entire GUESS city is ::::::::::::::::::::::::::::::: ');
                                //console.log(prettyJSON(alexaCity));
                                console.log("Place ID is ", alexa_place_id);

                                // store alpha 2 code, wanna do this to open
                                intent.attributes['formatted_add'] = locatedIn;
                                console.log("located in ", locatedIn);
                                console.log(':::::::::::::::::::::::::::::::::::::::::::');
                                var mustStartWith = guessedPlace.slice(-1);
                                intent.attributes['mustStartWith'] = mustStartWith;
                                let prompt = 'You said ' + intent.attributes['userCityFullName'] + '. so my city has to start with the letter '
                                        + lastLetterOfUserCity[0] + '. I think I\'ll go with ' + found_city + '. So your city has to start with the letter '
                                        + mustStartWith + '. Go!';
                                intent.attributes['prevIntentMessage'] = prompt;
                                console.log(prompt);
                                let reprompt = 'Your city has to start with the letter ' + mustStartWith + '. Go!';

                                let cardTitleLast = '';
                                let cardContent = 'You said ' + intent.attributes['userCityFullName'] + "\n"
                                        + 'I say ' + found_city + "\n\nSay a place with the letter " + mustStartWith;
                                if (intent.attributes['gameMode'] === "world" || intent.attributes['gameMode'] === "world mode") {
                                    cardTitleLast = CARD.title.world;
                                } else {
                                    cardTitleLast = CARD.title.country + intent.attributes['countryModeFullName'];
                                }
                                intent.emit(':askWithCard', prompt, reprompt, cardTitleLast, cardContent);

                            })
                            .catch(function (error) {
                                console.log('Error' + error);
                                //console.log('response' + JSON.stringify(response));
                                //console.log('body' + JSON.stringify(body));
                                intent.emitWithState('Unhandled');
                            });
                })
                .catch(function (error) {
                    console.log('Error' + error);
                    //console.log('response' + JSON.stringify(response));
                    //console.log('body' + JSON.stringify(body));
                    intent.emitWithState('Unhandled');
                });
    },

    'LifeLineIntent': function () {
        console.log("Inside life Line Intent");
        let availableLife = this.attributes['lifelineCount'];
        if (availableLife > 0) {

            let lastLetterOfUserCity = this.attributes['mustStartWith'];
//            let alphabets = 'abcdefghijklmnopqrstuvwxyz';
//            lastLetterOfUserCity += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
            console.log("last letter identified and is ", lastLetterOfUserCity);
            // find a guess for alexa
            var alexaOutputOptions = {
                method: 'GET',
                url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
                qs: {
                    input: lastLetterOfUserCity,
                    types: '(cities)',
                    //types: '(regions)',
                    //components: 'country:us',
                    key: 'AIzaSyAIAzhG5a8ndrquII3dNMXAXFNnYWBIcpc'
                },
                headers:
                        {
                            'cache-control': 'no-cache'
                        }
            };
            if (this.attributes['gameMode'] === '') {
                this.handler.state = states.CHOOSEMODE;
                this.emitWithState('Unhandled');
            } else if (this.attributes['gameMode'] === 'world') {

            } else {
                alexaOutputOptions.qs.components = 'country:' + this.attributes['gameMode'];
            }

            var intent = this;
            rp(alexaOutputOptions)
                    .then(function (response) {

                        var jsonAlexaCityResponse = JSON.parse(response);
                        const responseStatusAlexa = jsonAlexaCityResponse.status;
                        //console.log(responseStatus);
                        if (responseStatusAlexa === "ZERO_RESULTS") {
                            console.log("Response status is ", responseStatusAlexa);
                            let prompt = '<say-as interpret-as = "interjection"> Hmmm !! </say-as> That\'s a tough one. ' +
                                    '<break time="400ms"/>I don\'t know that either. <break time="300ms"/> You are own your own for now. ';
                            let cardTitle = CARD.title.normal + " : lifeline ";
                            let cardContent = "I don't know that either. \n" + 'You are own your own for now.';
                            this.emit(':askWithCard', prompt, prompt, cardTitle, cardContent);
                        }
                        var alexafoundPosition = -2;
                        var alexaCity = 'undef';
                        var alexa_place_id = 'undef';
                        var count = 7;
                        while (alexafoundPosition !== -1) {
                            if (count === 0) {
                                console.log("Loop Failure.");
                                intent.emit('Unhandled');
                            }
                            alexaCity = jsonAlexaCityResponse.predictions[getRandomInt(0, jsonAlexaCityResponse.predictions.length)];
                            alexa_place_id = alexaCity.place_id;
                            alexafoundPosition = intent.attributes['alreadyUsed'].indexOf(alexa_place_id);
                            if (alexafoundPosition !== -1) {
                                console.log('ALEXA FOUND A PLACE WHOSE place id already exists. ::: RE PICKING');
                                count = count - 1;
                            }
                        }

                        var found_city = alexaCity.structured_formatting.main_text;
                        var guessedPlace = found_city.replace(/[^a-zA-Z ]/g, "");
                        intent.attributes['last_place_name'] = guessedPlace;
                        var location = alexaCity.structured_formatting.secondary_text;
                        intent.attributes['formatted_add'] = location;

                        var spell = guessedPlace.split(" ").map(function (str) {
                            return str.toUpperCase().split("").join(". ");
                        }).join(' <break time="300ms"/> ');


                        if (location[2] === ',') {
                            console.log("Lifeline mode");
                            var full_name = location.substring(0, 2);
                            console.log("inside if : city = ", full_name);

                            // find full name from google.
                            var validateUserInputOptions = {
                                method: 'GET',
                                url: 'https://maps.googleapis.com/maps/api/geocode/json',
                                qs:
                                        {
                                            address: location,
                                            key: 'AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4'
                                        },
                                headers:
                                        {
                                            'cache-control': 'no-cache'
                                        }
                            };
//                console.log("options done");
                            rp(validateUserInputOptions)
                                    .then(function (response) {
                                        console.log("lifeline intent, find long name");
                                        const jsonUserCityResponse = JSON.parse(response);
//                                        console.log(prettyJSON(jsonUserCityResponse));
                                        const responseStatus = jsonUserCityResponse.status;
                                        if (responseStatus !== "OK") {
                                            console.log("Response status is Not OK. Nothing found man.");
                                            // just leave it
                                        } else {
                                            full_name = jsonUserCityResponse.results[0].address_components[0].long_name;
                                            console.log("setting full name as ", full_name);
                                        }

                                        location = full_name + location.substring(2);
                                        let prompt = '<say-as interpret-as = "interjection"> Let\' see !! </say-as>' +
                                                ' I found a place called, ' + guessedPlace + ' <break time="300ms"/> located in <break time="250ms"/> '
                                                + location + '. <break time="350ms"/> And, It is spelled as, <break time="250ms"/> ' +
                                                spell + '<break time="600ms"/>. Say ' + guessedPlace + ' to continue the game !';
                                        let reprompt = 'Say ' + guessedPlace + 'to continue the game !';
                                        console.log("Lifeline success.");
                                        intent.attributes['lifelineCount'] = availableLife - 1;
                                        let cardTitle = "";
                                        let cardContent = 'lifeline activated ! \n The place is ' + guessedPlace + '\n and, it is located in ' + location;
                                        let currMode = intent.attributes['gameMode'];
                                        if (currMode === 'world') {
                                            cardTitle = CARD.title.world;
                                        } else {
                                            cardTitle = CARD.title.country + intent.attributes['countryModeFullName'];
                                        }
                                        intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                                    })
                                    .catch(function (error) {
                                        console.log("Error is : ", error);
                                        let prompt = '<say-as interpret-as = "interjection"> Let\' see !! </say-as>' +
                                                ' I found a place called, ' + guessedPlace + ' <break time="300ms"/> located in <break time="250ms"/> '
                                                + location + '. <break time="350ms"/> And, It is spelled as, <break time="250ms"/> ' +
                                                spell + '<break time="600ms"/>. Say ' + guessedPlace + ' to continue the game !';
                                        let reprompt = 'Say ' + guessedPlace + 'to continue the game !';
                                        console.log("Lifeline success.");
                                        intent.attributes['lifelineCount'] = availableLife - 1;
                                        let cardTitle = "";
                                        let cardContent = 'lifeline activated ! \n The place is ' + guessedPlace + '\n and, it is located in ' + location;
                                        let currMode = intent.attributes['gameMode'];
                                        if (currMode === 'world') {
                                            cardTitle = CARD.title.world;
                                        } else {
                                            cardTitle = CARD.title.country + intent.attributes['countryModeFullName'];
                                        }
                                        intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                                    });
                        } else {
                            let prompt = '<say-as interpret-as = "interjection"> Let\' see !! </say-as>' +
                                    ' I found a place called, ' + guessedPlace + ' <break time="300ms"/> located in <break time="250ms"/> '
                                    + location + '. <break time="350ms"/> And, It is spelled as, <break time="250ms"/> ' +
                                    spell + '<break time="600ms"/>. Say ' + guessedPlace + ' to continue the game !';
                            let reprompt = 'Say ' + guessedPlace + 'to continue the game !';
                            console.log("Lifeline success.");
                            intent.attributes['lifelineCount'] = availableLife - 1;

                            let cardTitle = "";
                            let cardContent = 'lifeline activated ! \n The place is ' + guessedPlace + '\n and, it is located in ' + location;
                            let currMode = intent.attributes['gameMode'];
                            if (currMode === 'world') {
                                cardTitle = CARD.title.world;
                            } else {
                                cardTitle = CARD.title.country + intent.attributes['countryModeFullName'];
                            }
                            intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                        }
                    })
                    .catch(function (error) {
                        console.log('Error' + error);
                        //console.log('response' + JSON.stringify(response));
                        //console.log('body' + JSON.stringify(body));
                        intent.emitWithState('Unhandled');
                    });
        } else {
            let reprompt = 'Think of a place starting with ' + this.attributes['mustStartWith'] +
                    '<break time="400ms"/> or, Accept your defeat. ';
            let prompt = 'You have already used up all your Lifelines. ' + reprompt;
            let cardTitle = CARD.title.normal + " : lifeline ";
            let cardContent = "No Lifeline remaining. \n" + 'Think of a place starting with ' + this.attributes['mustStartWith'];
            this.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
        }
    },
    'spellingIntent': function () {
        console.log('spelling Intent');
        if (this.attributes['last_place_name'] !== '') {
            var place = this.attributes['last_place_name'];

            var spell = place.split(" ").map(function (str) {
                return str.toUpperCase().split("").join(". ");
            }).join(' <break time="300ms"/> ');

            var location = this.attributes['formatted_add'];

            console.log("location is '", location, "'");
            var intent = this;

            if (location[2] === ',') {
                var full_name = location.substring(0, 2);
                console.log("inside if : city = ", full_name);

                // find full name from google.
                var validateUserInputOptions = {
                    method: 'GET',
                    url: 'https://maps.googleapis.com/maps/api/geocode/json',
                    qs:
                            {
                                address: location,
                                key: 'AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4'
                            },
                    headers:
                            {
                                'cache-control': 'no-cache'
                            }
                };
                rp(validateUserInputOptions)
                        .then(function (response) {
                            console.log("spelling intent, find long name");
                            const jsonUserCityResponse = JSON.parse(response);
//                            console.log(prettyJSON(jsonUserCityResponse));
                            const responseStatus = jsonUserCityResponse.status;
                            if (responseStatus !== "OK") {
                                console.log("Response status is Not OK. Nothing found man.");
                                // just leave it
                            } else {
                                full_name = jsonUserCityResponse.results[0].address_components[0].long_name;
                                console.log("setting full name as ", full_name);
                            }
                            location = full_name + location.substring(2);

                            let reprompt = ' To resume the game, Simply say a place name starting with ' + intent.attributes['mustStartWith'] + ' .';
                            let prompt = 'The place is ' + place + ' <break time="300ms"/> and, it is located in <break time="250ms"/> '
                                    + location + '. <break time="350ms"/> And, It is spelled as, <break time="250ms"/> '
                                    + spell + '. <break time="700ms"/>' + reprompt;
                            intent.attributes['prevIntentMessage'] = prompt;

                            let cardTitle = "";
                            let cardContent = 'The place is ' + place + '\n and, it is located in ' + location;
                            let currMode = intent.attributes['gameMode'];
                            if (currMode === 'world') {
                                cardTitle = CARD.title.world;
                            } else {
                                cardTitle = CARD.title.country + intent.attributes['countryModeFullName'];
                            }
                            intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                        })
                        .catch(function (error) {
                            console.log("Error is ", error);
                            let reprompt = ' To resume the game, Simply say a place name starting with ' + intent.attributes['mustStartWith'] + ' .';
                            let prompt = 'The place is ' + place + ' <break time="300ms"/> and, it is located in <break time="250ms"/> '
                                    + location + '. <break time="350ms"/> And, It is spelled as, <break time="250ms"/> '
                                    + spell + '. <break time="700ms"/>' + reprompt;
                            intent.attributes['prevIntentMessage'] = prompt;
                            let cardTitle = "";
                            let cardContent = 'The place is ' + place + '\n and, it is located in ' + location;
                            let currMode = intent.attributes['gameMode'];
                            if (currMode === 'world') {
                                cardTitle = CARD.title.world;
                            } else {
                                cardTitle = CARD.title.country + intent.attributes['countryModeFullName'];
                            }
                            intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
                        });
            } else {
                let reprompt = ' To resume the game, Simply say a place name starting with ' + this.attributes['mustStartWith'] + ' .';
                let prompt = 'The place is ' + place + ' <break time="300ms"/> and, it is located in <break time="250ms"/> '
                        + location + '. <break time="350ms"/> And, It is spelled as, <break time="250ms"/> '
                        + spell + '. <break time="700ms"/>' + reprompt;
                this.attributes['prevIntentMessage'] = prompt;
                let cardTitle = "";
                let cardContent = 'The place is ' + place + '\n and, it is located in ' + location;
                let currMode = intent.attributes['gameMode'];
                if (currMode === 'world') {
                    cardTitle = CARD.title.world;
                } else {
                    cardTitle = CARD.title.country + intent.attributes['countryModeFullName'];
                }
                intent.emit(':askWithCard', prompt, reprompt, cardTitle, cardContent);
            }
        } else {
            console.log("Spelling called with empty field.");
            this.emit('Unhandled');
        }

    },
    'AMAZON.HelpIntent': function () {
        // first time
        if (this.attributes['mustStartWith'] === '-') {
            if (this.attributes['gameMode'] === 'world') {
                let prompt = 'The game will start by you telling me the name of a valid Place. ' +
                        'A valid place can be a city, state, country, or even a continent ' +
                        ' <say-as interpret-as = "interjection">anywhere in the world. </say-as> ' +
                        'The place name must begin with the last letter of place name the was said previously.' +
                        ' Try saying a place name ';
                this.attributes['prevIntentMessage'] = prompt;
                let reprompt = ' Try saying a place name ';
                this.emit(':askWithCard', prompt, reprompt, CARD.title.world, reprompt);
            } else if (this.attributes['gameMode'] === '') {
                this.handler.state = states.CHOOSEMODE;
                this.emitWithState('AMAZON.HelpIntent');
            } else {
                let prompt = 'The game will start by you telling me the name of a valid Place. ' +
                        'A valid place can be a city, state, or region from ' + this.attributes['countryModeFullName'] +
                        'The place name must begin with the last letter of place name the was said previously.' +
                        ' Try saying a place name from ' + this.attributes['countryModeFullName'];
                this.attributes['prevIntentMessage'] = prompt;
                let reprompt = ' Try saying a place name from ' + this.attributes['countryModeFullName'];
                let cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                this.emit(':askWithCard', prompt, reprompt, cardTitle, reprompt);
            }
        } else {
            let prompt = "";
            let cardTitle = "";

            if (this.attributes['gameMode'] === 'world') {
                prompt = ' Try saying a place name that begin with ' + this.attributes['mustStartWith'];
                cardTitle = CARD.title.world;
            } else if (this.attributes['gameMode'] === '') {
                this.handler.state = states.CHOOSEMODE;
                this.emitWithState('AMAZON.HelpIntent');
            } else {
                prompt = ' Try saying a place name from ' + this.attributes['countryModeFullName'] +
                        ' that being with ' + this.attributes['mustStartWith'];
                cardTitle = CARD.title.country + this.attributes['countryModeFullName'];

            }
            this.attributes['prevIntentMessage'] = prompt;
            this.emit(':askWithCard', prompt, prompt, cardTitle, prompt);
        }

    },
    'SessionEndedRequest': function () {
        console.log('SessionEndedRequest');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent');
        this.emit(':tellWithCard', MSG.END_MESSAGE, CARD.title.normal, "Good Bye !");
    },
    'AMAZON.RepeatIntent': function () {
        let prompt = this.attributes['prevIntentMessage'];
        this.emit(':ask', prompt, prompt);
    },
    'defeatIntent': function () {
        console.log("accepting defeat");
        let prompt = 'You played Well. <break time="500ms"/> ' +
                'A smart player knows, when to try harder, and when to quit the game. ' +
                '<say-as interpret-as = "interjection"> Good luck ! </say-as> ' +
                'I\'ll see you next time. <say-as interpret-as = "interjection"> Bye !! </say-as>';
        let cardContent = "You Played Well ! \n\nSee you next time. Bye !";
        this.emit(':tellWithCard', prompt, CARD.title.normal, cardContent);
    },
    'Unhandled': function () {
        if (this.attributes['mustStartWith'] === '-') {
            if (this.attributes['gameMode'] === 'world') {
                let prompt = 'Sorry, I didn\'t get that. Try saying a place name ';
                this.attributes['prevIntentMessage'] = prompt;
                let reprompt = ' Try saying a place name ';
                this.emit(':askWithCard', prompt, reprompt, CARD.title.world, reprompt);

            } else if (this.attributes['gameMode'] === '') {
                this.handler.state = states.CHOOSEMODE;
                this.emitWithState('AMAZON.HelpIntent');
            } else {
                let prompt = 'Sorry, I didn\'t get that. Try saying a place name from ' + this.attributes['countryModeFullName'];
                this.attributes['prevIntentMessage'] = prompt;
                let reprompt = ' Try saying a place name from ' + this.attributes['countryModeFullName'];
                let cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                this.emit(':askWithCard', prompt, reprompt, cardTitle, reprompt);
            }
        } else {
            let prompt = "";
            let reprompt = "";
            let cardTitle = "";
            if (this.attributes['gameMode'] === 'world') {
                prompt = 'Sorry, I didn\'t get that.  Try saying a place name that begin with ' + this.attributes['mustStartWith'];
                cardTitle = CARD.title.world;
                reprompt = 'Try saying a place name that begin with ' + this.attributes['mustStartWith'];
            } else if (this.attributes['gameMode'] === '') {
                this.handler.state = states.CHOOSEMODE;
                this.emitWithState('AMAZON.HelpIntent');
            } else {
                prompt = 'Sorry, I didn\'t get that. Try saying a place name from ' + this.attributes['countryModeFullName'] +
                        ' that being with ' + this.attributes['mustStartWith'];
                cardTitle = CARD.title.country + this.attributes['countryModeFullName'];
                reprompt = 'Try saying a place name from ' + this.attributes['countryModeFullName'] +
                        ' that being with ' + this.attributes['mustStartWith'];
            }

            this.attributes['prevIntentMessage'] = prompt;
            this.emit(':askWithCard', prompt, reprompt, cardTitle, reprompt);
        }
    }
});


/* Pretty print JSON  */
function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

/*
 Generate a random number from 0 to n-1
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/* Returns TRUE if the first specified array contains all elements
 * from the second one. FALSE otherwise. 
 */
function arrayContainsArray(superset, subset) {
    return subset.every(function (value) {
        return (superset.indexOf(value) >= 0);
    });
}
