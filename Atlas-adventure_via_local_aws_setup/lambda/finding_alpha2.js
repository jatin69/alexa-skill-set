


// done using external API =>>>>>>>> can also be done using google map api and finding shortname

// as of now, external api also works, if later an error => switch to google verification

'use strict';
var _ = require('lodash');
var request = require('request');
var rp = require('request-promise');


let country = 'Brazil';
var options = {
                    method: 'GET',
                    url: 'https://restcountries.eu/rest/v2/name/' + country,
                };
rp(options)
	.then( function (response) {
        var result = JSON.parse(response);
        var resultCountry = _.find(result, function(ob) { return _.lowerCase(ob.name) == _.lowerCase(country) ; });
        console.log(resultCountry.alpha2Code);
})
    .catch(function (error) {
        console.log('Error' + error);
    });



/* Pretty print JSON 
*/
function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}
