# Skill Flow

Using google place API => 1000/req per day. Extend to x150 by verifying card details. still no billing.

say "That's all" OR "gotta go" to end GAME.

- user tells a city

- check if the starting letter is valid
=> invalid : obviously if first letter is not ok, it's a blunder, tell him "does not start with right letter" && ask again OR 
=> starts with valid letter

- check google api to find its authenticity as a valid city/state/country/place 
=> if fails, tell "come on, you can do better, tell me something famous or that sort" and ask him to tell again
=> if it is valid, find it's full Name from the JSON response.

- check if the full name exists in alreadyUsedPlaces[] => maybe store place ID as it is unique, even if same names.
- can also [query using unique ID](https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBrcXZU23NAZSDGB3OB1z06SetjvZ8-mL4&place_id=ChIJLbZ-NFv9DDkRzk0gTkm3wlI)
=> if yes, ask user again
=> if new, store the full name in a array => alreadyUsedPlaces[]

- find the last letter of the full name, Alexa's turn now

- take up the fixed words, append a random alphabet, get autocomplete suggestions.
- pick a random suggestion =>> 3380 something bound. (region specific)
- Think a way to make it truly infinite.
=> tell it to user => make entry to alreadyUsedPlaces[]
find last letter and continue


basic input output is done.

One more state =>>

INFO - user can ask more info about the place

user profile ?
etc ?