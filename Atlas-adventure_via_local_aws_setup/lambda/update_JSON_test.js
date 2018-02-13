var validateUserInputOptions = {
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            qs:
            {
                address: 'place',
                //play worldwide
                //components: 'country:US',
                key: 'AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4'
            },
            headers:
            {
                'cache-control': 'no-cache'
            }
        };

validateUserInputOptions.qs.components = 'country:US'

console.log(prettyJSON(validateUserInputOptions));


/* Pretty print JSON 
*/
function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}
