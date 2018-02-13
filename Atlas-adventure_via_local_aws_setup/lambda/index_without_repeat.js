'use strict';
var Alexa = require("alexa-sdk");
var _ = require('lodash');
var request = require('request');
var rp = require('request-promise');

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


var MSG = {
    'END_MESSAGE' : '<say-as interpret-as = "interjection"> Okay, see you next time! bye !</say-as>',

    'NOT_FOUND' : '<say-as interpret-as = "interjection">Hmmmm. </say-as>, Never heard of this place,' + 
                    'Think of another place! <say-as interpret-as = "interjection"> Go ! </say-as>',

    'NOT_VALID' : '<say-as interpret-as = "interjection">Hmmmm. </say-as>' +
                    'That does not seem like a valid place. ' + 
                    'Think of another place! <say-as interpret-as = "interjection"> Go ! </say-as>',

    'ALREADY_USED' : '<say-as interpret-as = "interjection">Oh no! </say-as>' + 
                      'We have already used this place in the game. ' + 
                      'Think of another place, <say-as interpret-as = "interjection">GO! </say-as>', 

    'RE' : 'Please say a Place name '
}
        
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
            //this.attributes['alreadyUsed'] = [];           
        }
        this.attributes['mustStartWith'] = '-';
        this.attributes['userCityFullName'] = '';
        this.attributes['alreadyUsed'] = [];

        console.log("Starting a brand new session.")

        this.handler.state = states.STARTMODE;
        this.emitWithState('AMAZON.YesIntent');
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function () {
        var message = 'The game will start by you telling me the name of a valid Place. ' +
        'A valid place can be a city, state, country, or even a continent <say-as interpret-as = "interjection">anywhere in the world. </say-as> '+
        'Then we\'ll take turns naming valid places, <say-as interpret-as = "interjection">but</say-as> ' +
        'the place name must begin with the last letter of place name the was said previously. ' +
        'Do you want to start the game ?';
        this.emit(':ask', message, MSG.re);
    },
    'AMAZON.YesIntent': function () {
        this.handler.state = states.PLAYMODE;
        this.emit(':ask', 'Hey, Welcome to Atlas Demo !! Please tell me a Place name to start the game.', 'Please say the name of a place.');
    },
    'AMAZON.NoIntent': function () {
        this.emit(':tell', MSG.END_MESSAGE);
    },
    'SessionEndedRequest': function () {
        console.log('SessionEndedRequest');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', MSG.END_MESSAGE);
    },
    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', MSG.END_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', MSG.END_MESSAGE);
    },
    'Unhandled': function () {
        var message = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', message, message);
    }
});

function obtainUserCity(slots){
    let city = 'undef';
    /*console.log("obtained slot values are ====== ");
    console.log(slots.UScity.value);
    console.log(slots.country.value);
    console.log("==========================");
    */

     
    
    city = ("value" in slots.UScity)  ? slots.UScity.value
         : ("value" in slots.USstate) ? slots.USstate.value
         : ("value" in slots.GBcity)  ? slots.GBcity.value
         : ("value" in slots.GBregion) ? slots.GBregion.value
         : ("value" in slots.EUROPEcity)  ? slots.EUROPEcity.value
         : ("value" in slots.DEregion) ? slots.DEregion.value
         : ("value" in slots.country)  ? slots.country.value
         : ("value" in slots.ATregion) ? slots.ATregion.value
         : ("value" in slots.ATcity) ? slots.ATcity.value
         : "undef"
          
    return city.toString();
}

var playModeHandlers = Alexa.CreateStateHandler(states.PLAYMODE, {
    
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },

    'CityChainIntent': function () {

        // storing current intent because it may get lost in promises
        var intent = this;

        var city = obtainUserCity(this.event.request.intent.slots);
        if(city === "undef"){
            intent.emitWithState('Unhandled');
        }

        console.log('user said: ' + city);
        var message = '';
        if (intent.attributes['mustStartWith'] !== '-') {
            if (city.substring(0, 1).toLowerCase() !== intent.attributes['mustStartWith'].toLowerCase()) {

                message = city + ' does not begin with ' + intent.attributes['mustStartWith'] + 
                '.<break strength="x-strong"/> Think of another place that starts with the letter ' +
                    intent.attributes['mustStartWith'] + '.<break strength="x-strong"/>  Go!';
                console.log(message);
                intent.emit(':ask', message, MSG.RE + 'that starts with the letter ' + intent.attributes['mustStartWith'] );
            }
        }

        var place = city

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


        rp(validateUserInputOptions)
            .then(function (response) {
                
                var jsonUserCityResponse = JSON.parse(response);
                console.log('Entire city log is ::::::::::::::::::::::::::::::: done');
                //console.log(prettyJSON(jsonUserCityResponse));
                //console.log(':::::::::::::::::::::::::::::::::::::::::::::::::::');

                var responseStatus = jsonUserCityResponse.status;
                console.log("Google API returned response : ", responseStatus);
                
                if(responseStatus!=="OK"){
                    intent.emit(':ask', MSG.NOT_FOUND);
                }
                
                /* 
                List of places can be found at https://developers.google.com/maps/documentation/geocoding/intro  
                */
                var validPlacesList = [   'political',
                                            'country'  ,
                                            'administrative_area_level_1',
                                            'administrative_area_level_2',
                                            'administrative_area_level_3',
                                            'administrative_area_level_4',
                                            'administrative_area_level_5',
                                            'colloquial_area',
                                            'locality',
                                            'continent',
                                            'natural_feature'
                                        ]

                var foundType = jsonUserCityResponse.results[0].types
                var isvalid = foundType.some(r=> validPlacesList.includes(r))
                //var isvalid = _.includes(jsonUserCityResponse.results[0].types, locality )
                
                if(!isvalid){
                    console.log("You have failed this city. This isn't a valid place.");
                    intent.emit(':ask', MSG.NOT_VALID);
                }
                else{
                    console.log("Place is Valid. Moving forward.");
                }

                var userCity = _.find(jsonUserCityResponse.results[0].address_components,
                                 function (o) { 
                                return arrayContainsArray(o.types, jsonUserCityResponse.results[0].types)
                                 //return _.includes(o.types, 'locality' ); 
                                });

                var userCityFullName = userCity.long_name;
                var user_place_id = jsonUserCityResponse.results[0].place_id;

                console.log("already used is : ", this.attributes['alreadyUsed'], ":::::::::::::::::::");
                
                //var arr = intent.attributes['alreadyUsed'] ;
                if(intent.attributes['alreadyUsed'] == undefined){
                    intent.attributes['alreadyUsed'] = [];
                }

                console.log("already used is : ", intent.attributes['alreadyUsed'], ":::::::::::::::::::");
                var foundPosition = intent.attributes['alreadyUsed'].indexOf(user_place_id.toString());
                if(foundPosition!==-1){
                    // exists
                    console.log('place id already exists');
                    var message = 'You said ' + userCityFullName + '. ';
                    intent.emit(':ask', message + MSG.ALREADY_USED);
                }


                intent.attributes['userCityFullName'] = userCityFullName;
                var lastLetterOfUserCity = userCityFullName.slice(-1);
                
                intent.attributes['alreadyUsed'].push(user_place_id);
                console.log("Place ID is ",user_place_id);
                
                console.log("Complete formatted address is : ",jsonUserCityResponse.results[0].formatted_address);
                console.log("Place is :",userCityFullName, "  and last letter is :",lastLetterOfUserCity);
                
                

                // for truly random
                var alphabets = 'abcdefghijklmnopqrstuvwxyz'
                lastLetterOfUserCity += alphabets.charAt(Math.floor(Math.random() * alphabets.length));


                // find a guess for alexa
                var alexaOutputOptions = {
                                    method: 'GET',
                                    url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
                                    qs:
                                    {
                                        input: lastLetterOfUserCity,
                                        types: '(cities)',
                                        //components: 'country:us',
                                        key: 'AIzaSyAIAzhG5a8ndrquII3dNMXAXFNnYWBIcpc'
                                    },
                                    headers:
                                    {
                                        'cache-control': 'no-cache'
                                    }
                                };


                rp(alexaOutputOptions)
                    .then( function (response) {

                        var jsonAlexaCityResponse = JSON.parse(response);

                        var alexafoundPosition = -2;
                        var alexaCity = 'undef';
                        var guessedPlaceID = 'undef';
                        var alexa_place_id = 'undef';
                        
                        while(alexafoundPosition!==-1){
                            alexaCity = jsonAlexaCityResponse.predictions[getRandomInt(0, jsonAlexaCityResponse.predictions.length)];
                            guessedPlaceID = alexaCity.place_id;
                            alexa_place_id = guessedPlaceID;
                            alexafoundPosition = intent.attributes['alreadyUsed'].indexOf(alexa_place_id);
                            if(alexafoundPosition!==-1){
                                // exists
                                console.log('ALEXA FOUND A PLACE WHOSE place id already exists. ::: RE PICKING');
                                //this.emit(':ask',MSG.ALREADY_USED);
                            }
                        }

                        var guessedPlace = alexaCity.structured_formatting.main_text;
                        var locatedIn = alexaCity.structured_formatting.secondary_text;
                        

                        intent.attributes['alreadyUsed'].push(alexa_place_id);
                        console.log("Place ID is ",alexa_place_id);
                        
                        console.log('Entire GUESS city is ::::::::::::::::::::::::::::::: ');
                        //console.log(prettyJSON(alexaCity));
                        console.log("Place id is : ",guessedPlaceID);
                        console.log("located in ", locatedIn);
                        console.log(':::::::::::::::::::::::::::::::::::::::::::');

                        var mustStartWith = guessedPlace.slice(-1);
                        intent.attributes['mustStartWith'] = mustStartWith;

                        var message = 'You said ' + intent.attributes['userCityFullName'] + '. so my city has to start with the letter ' 
                        + lastLetterOfUserCity[0] + '. I think I\'ll go with ' + guessedPlace + '. So your city has to start with the letter ' 
                        + mustStartWith  + '. Go!'
                        
                        console.log(message);
                        intent.emit(':ask', message);

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
    'AMAZON.HelpIntent': function () {
        var message = 'The game will start by you telling me the name of a valid Place. ' +
        'A valid place can be a city, state, country, or even a continent <say-as interpret-as = "interjection">anywhere in the world. </say-as> '+
        'The place name must begin with the last letter of place name the was said previously. Try saying a place name ';
        if (this.attributes['mustStartWith'] !== '-') {
            this.emit(':ask', message + 'that begins with ' + this.attributes['mustStartWith'],
                'Try saying a place name that begins with ' + this.attributes['mustStartWith']);
        } else {
            this.emit(':ask', message, 'Try saying a Place name, may it be a city, state or <say-as interpret-as = "interjection">even a country ! </say-as> ');
        }
        
    },
    'SessionEndedRequest': function () {
        console.log('SessionEndedRequest');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', MSG.END_MESSAGE);
    },
    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', MSG.END_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', MSG.END_MESSAGE);
    },
    'Unhandled': function () {
        if (this.attributes['mustStartWith'] !== '-') {
            this.emit(':ask', 'Sorry, I didn\'t get that. Please say a place name that begins with ' + this.attributes['mustStartWith'],
                'Try saying a place name that begins with ' + this.attributes['mustStartWith']);
        } else {
            var reprompt = 'Try saying a place name.';
            this.emit(':ask', 'Sorry, I didn\'t get that. ' + reprompt, reprompt);
        }
    }
});


/* 
Pretty print JSON 
*/
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
function arrayContainsArray (superset, subset) {
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}
