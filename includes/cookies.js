
// Enable Cookie from Authentication
function setAuthenticatedCookie(params){
	console.log("I am authenticated! " + params);
}

// Expire Cookie from Authentication
function expireAuthenticatedCookie(params){
	console.log("I lost my sessioned! " + params);
}

module.exports = { setAuthenticatedCookie, expireAuthenticatedCookie };


/* 
Plain Language Walk Through
Read Cookie
	IF valid with session stored in DB revalidate and extend
	ELSE NO cookie or not valid with session EXPIRE and send to login



*/