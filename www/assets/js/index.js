$(document).ready(function() {

	// Extend Session
	
	var keepSessionValid = window.setInterval(
		function(){
			$.getJSON( "/api/validate", function( output ) {
				// Remain Valid
				console.log("Session Extended");
			});
		}, 20000
	);
	

	// Check Session State
	$.getJSON( "/api/validate", function( output ) {
		if(output.SessionState != "Valid") {
			window.location.replace('login.html');
		}
	});

});