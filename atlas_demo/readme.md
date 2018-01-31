# Cities game => atlas demo


## todo basic
- setup local dev environment for quick testing and code => uploading zip each time is not handy

## current mode
- invokes correctly
- detects 15000 cities => AMAZON.US
- detect a wrong city => because not in US => then, gives chance to correct
- stops correctly 

## to add
- some info about cities
- detect all cities
- change cities to india, probably world, based on location
- EVEN BETTER, ask user which country/region to explore today  => a lil too much
- language to english india
- randomize the responses from the google api
- prevent repetitions within a single session
- hint to users
- keep game score && hint asked
- total cities traversed today


## proposed
- dynamodb required ?
- [Maybe scrape off statically A-Z](https://en.wikipedia.org/wiki/List_of_towns_and_cities_with_100,000_or_more_inhabitants/cityname:_A) 