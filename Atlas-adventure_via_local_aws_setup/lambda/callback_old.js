'use strict';
var _ = require('lodash');
var request = require('request');
var rp = require('request-promise');

let place = "gobar in UP india"

var validateUserInputOptions = {
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            qs:
            {
                address: place,
                //play worldwide
                //components: 'country:US|locality',
                key: 'AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4'
            },
            headers:
            {
                'cache-control': 'no-cache'
            }
        };

rp(options)
    .then(function (repos) {
        console.log('User has %d repos', repos.length);
    })
    .catch(function (err) {
        // API call failed...
    });

request(validateUserInputOptions, function (error, response, body) {
            if (error) {
                console.log('Error' + JSON.stringify(error));
                console.log('response' + JSON.stringify(response));
                console.log('body' + JSON.stringify(body));
                this.emitWithState('Unhandled');
            } //throw new Error(error);

            var jsonUserCityResponse = JSON.parse(body);
            console.log(prettyJSON(jsonUserCityResponse));

            /*
            List of places can be found at https://developers.google.com/maps/documentation/geocoding/intro
            */
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

            var resultTypes = jsonUserCityResponse.results[0].types
            let isvalid = resultTypes.some(r=> validPlacesList.includes(r))
            
            //let isvalid = _.includes(jsonUserCityResponse.results[0].types, locality )
            console.log(isvalid);
            if(isvalid){
            	console.log("place is right. Now find its full name and proceed.");
            }

            // now fetch the full name of place => if user has not told full name => tell him full name

            /*	
            var userCity = _.find(jsonUserCityResponse.results[0].types, 
                function (o) { 
                    return _.includes(o, 
                        'political'||
                        'country'  ||
                        'locality' ||
                        'administrative_area_level_3'||
                        'administrative_area_level_2'||
                        'administrative_area_level_1'||
                        'colloquial_area'
                        ); 
                });
            console.log(userCity);
*/
})


function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}