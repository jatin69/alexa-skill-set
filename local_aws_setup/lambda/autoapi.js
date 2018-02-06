/*
demo request -
https://maps.googleapis.com/maps/api/place/autocomplete/json?input=a&key=AIzaSyAIAzhG5a8ndrquII3dNMXAXFNnYWBIcpc


fetching alpha 2 code
https://restcountries.eu/rest/v2/name/
*/

'use strict';
var _ = require('lodash');
var request = require('request');
var rp = require('request-promise');

let lastLetterOfUserCity = 'i';

// for truly random
const alphabets = 'abcdefghijklmnopqrstuvwxyz'
lastLetterOfUserCity += alphabets.charAt(Math.floor(Math.random() * alphabets.length));

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

alexaOutputOptions.qs.components = 'country:' + 'in';

rp(alexaOutputOptions)
	.then( function (response) {

		var jsonAlexaCityResponse = JSON.parse(response);
        var alexaCity = jsonAlexaCityResponse.predictions[getRandomInt(0, jsonAlexaCityResponse.predictions.length)];
		//console.log(prettyJSON(alexaCity));
		console.log("Place id is : ",alexaCity.place_id);
		console.log("located in ", alexaCity.structured_formatting.secondary_text);
        
        //intent.attributes['mustStartWith'] =	 alexaCity.structured_formatting.main_text.slice(-1);
        //let mustStartWith = intent.attributes['mustStartWith'] ;
        
        let mustStartWith = alexaCity.structured_formatting.main_text.slice(-1);

        let message = 'My city has to start with ( ' + lastLetterOfUserCity[0] + ' ) I think I\'ll go with (  ' + 
        			alexaCity.structured_formatting.main_text + ' ) ,so your city has to start with the letter (' 
        			+ mustStartWith  + ' ). Go!'
        
        console.log(message);
        //intent.emit(':ask', message);

	})
	.then(function (){
    	console.log("I am done bro");
    })
    .catch(function (error) {
        console.log('Error' + error);
        //console.log('response' + JSON.stringify(response));
        //console.log('body' + JSON.stringify(body));
        //this.emitWithState('Unhandled');
    });


/* Pretty print JSON 
*/
function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}