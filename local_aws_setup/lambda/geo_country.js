/*
two modes => 
global and country specific

sample req -
https://maps.googleapis.com/maps/api/geocode/json?address=dadar&key=AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4

dynamic componenents - 
https://maps.googleapis.com/maps/api/geocode/json?address=india&key=AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4&components=

maybe also  handle
status = OVER_QUERY_LIMIT 
ZERO_RESULTS
*/

'use strict';
var _ = require('lodash');
var request = require('request');
var rp = require('request-promise');

//let place = "New York City"
//let place = "Etawah";
//let place = "New Delhi";
let place = 'dakpta'

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
        
        const jsonUserCityResponse = JSON.parse(response);
        console.log(prettyJSON(jsonUserCityResponse));

        const responseStatus = jsonUserCityResponse.status;
        //console.log(responseStatus);
        if(responseStatus!=="OK"){
        	console.log("Yo man, nothing found");
        	fail;
        	// pre maturely exit, just like die in PHP
        }
        
        /* List of places can be found at https://developers.google.com/maps/documentation/geocoding/intro  */
        const validPlacesList = [ 	'political',
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

        let matchType = jsonUserCityResponse.results[0].types
        let isvalid = matchType.some(r=> validPlacesList.includes(r))
        //let isvalid = _.includes(jsonUserCityResponse.results[0].types, locality )
        
        if(!isvalid){
        	console.log("You have failed this city.");
        }
        else{
        	console.log("Place is Valid.");
        }

        let userCity = _.find(jsonUserCityResponse.results[0].address_components,
        				 function (o) { 
                		return arrayContainsArray(o.types, jsonUserCityResponse.results[0].types)
                  		 //return _.includes(o.types, 'locality' ); 
                		});

		const userCityFullName = userCity.long_name;
		const lastLetterOfUserCity = userCityFullName.slice(-1);
		console.log("Place is :",userCityFullName, "  and last letter is :",lastLetterOfUserCity);
		console.log("Complete formatted address is : ",jsonUserCityResponse.results[0].formatted_address);
		console.log("Place ID is ",jsonUserCityResponse.results[0].place_id);
		console.log("now gotta find something starting with '",lastLetterOfUserCity,"'");


		
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


/* Returns TRUE if the first specified array contains all elements
 * from the second one. FALSE otherwise. 
 */
function arrayContainsArray (superset, subset) {
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}
