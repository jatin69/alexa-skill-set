/*
Find the FOCUS name in the JSON response
*/


var _ = require('lodash');


jsonUserCityResponse =
{
   "results" : [
      {
         "address_components" : [
            {
               "long_name" : "Washington",
               "short_name" : "WA",
               "types" : [ "administrative_area_level_1", "political" ]
            },
            {
               "long_name" : "United States",
               "short_name" : "US",
               "types" : [ "country", "political" ]
            }
         ],
         "formatted_address" : "Washington, USA",
         "geometry" : {
            "bounds" : {
               "northeast" : {
                  "lat" : 49.0024305,
                  "lng" : -116.91558
               },
               "southwest" : {
                  "lat" : 45.543541,
                  "lng" : -124.8489739
               }
            },
            "location" : {
               "lat" : 47.7510741,
               "lng" : -120.7401385
            },
            "location_type" : "APPROXIMATE",
            "viewport" : {
               "northeast" : {
                  "lat" : 49.0024305,
                  "lng" : -116.91558
               },
               "southwest" : {
                  "lat" : 45.543541,
                  "lng" : -124.8489739
               }
            }
         },
         "place_id" : "ChIJ-bDD5__lhVQRuvNfbGh4QpQ",
         "types" : [ "administrative_area_level_1", "political" ]
      }
   ],
   "status" : "OK"
}

/* Returns TRUE if the first specified array contains all elements
 * from the second one. FALSE otherwise.
 *
 * @param {array} superset
 * @param {array} subset
 *
 * @returns {boolean}
 */
function arrayContainsArray (superset, subset) {
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}

/*
var array1 = ['A', 'B', 'C', 'D', 'E'];
var array2 = ['B', 'C', 'E'];
var array3 = ['B', 'C', 'Z'];
var array4 = [];
console.log(arrayContainsArray(array1, array3));
*/


var userCity = _.find(jsonUserCityResponse.results[0].address_components, 
                function (o) { 
                	return arrayContainsArray(o.types, jsonUserCityResponse.results[0].types)
                    //return _.includes(o.types, 'locality' ); 
                });

const fullname = userCity.long_name;
console.log(fullname);