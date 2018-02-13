/*
var MSG = {
    'END_MESSAGE' : 'Okay, see you next time! <say-as interpret-as = "interjection">bye !</say-as>',
    'NOT_FOUND' : '<say-as interpret-as = "interjection">Hmmmm. </say-as>, I have never heard of this place,' + 
                    'Can you be more precise? <break time="1s"/>  or Perhaps try another place!!',    
}

console.log(MSG.NOT_FOUND);
        */




function obtainUserCity(slots){
    let city = null;
    console.log("obtained slot values are ====== ");
    console.log(slots.UScity.value);
    console.log(slots.country.value);
    console.log("==========================");

    city = slots.UScity.value!=null  ? slots.UScity.value
         : slots.USstate.value!=null ? slots.USstate.value
         : slots.GBcity.value!=null  ? slots.GBcity.value
         : slots.GBregion.value!=null ? slots.GBregion.value
         : slots.EUROPEcity.value!=null  ? slots.EUROPEcity.value
         : slots.DEregion.value!=null ? slots.DEregion.value
         : slots.country.value!=null  ? slots.country.value
         : slots.ATregion.value!=null ? slots.ATregion.value
         : slots.ATcity.value!=null ? slots.ATcity.value
         : ""
          
    return city.toString();
}


dic = {
	'UScity' : {
		'value' : "hello"
	},
	'ATcity' : {
		'value' : "nope"
	},

	'country' : {
		
	}

}

console.log(obtainUserCity(dic));
