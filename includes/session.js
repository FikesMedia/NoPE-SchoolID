// Start Session Management from Authentication
function startSessionAuthenticated(params){
	console.log("I am sessioned! " + params);

}

// Destroy Session Management from Authentication
function destroySessionAuthenticated(params){
	console.log("I lost my session! " + params);

}

module.exports = { startSessionAuthenticated, destroySessionAuthenticated };