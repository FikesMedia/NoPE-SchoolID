//Take Image
function take_snapshot() {
	// take snapshot and get image data
	Webcam.snap( function(data_uri) {
		// display results in page
		document.getElementById('photo').innerHTML = '<img id="actualPhoto" src="'+data_uri+'"/>';
		//Enable Use Button

	} );
}

//Gets Information from Selected User
function GenerateOneOffBadge() {

	//Load Defaults and build badge
	$.getJSON("./defaults.json", function(defaults){

		//Set User Information
		var company = document.getElementById("companyfield").value;
		var firstName = document.getElementById("firstnamefield").value;
		var lastName = document.getElementById("lastnamefield").value;
		var title = document.getElementById("titlefield").value;
		var empID = document.getElementById("idfield").value;
		//var badgeID = document.getElementById("idfield").value;
		if(document.getElementById("idfield").value === '') {
			document.getElementById("idfield").value = "000000";
			var badgeID = document.getElementById("idfield").value;
		} else {
			var badgeID = document.getElementById("idfield").value;
		}
		var badgephoto = "oneoff.jpg";

		//Draw PDF
		createPdf(company,firstName,lastName,title,empID,badgeID,badgephoto,"pdfBadge",defaults.BGColor,defaults.TXTColor);
		//Enable Print Button
		document.getElementById('printBtn').removeAttribute("disabled");

	});


}


$(document).ready(function() {
	//Disable Print Button until Data Available
	document.getElementById('printBtn').setAttribute("disabled", "");

	//Prevent form Submission
	$("form").submit(function(e){
		e.preventDefault();
	});

	$("#generateIdBtn").click(function(){
		GenerateOneOffBadge();
	});

	$("#printBtn").click(function(){
		var PDF = document.getElementById("pdfBadge");
      	PDF.focus();
      	PDF.contentWindow.print();
	});

	UIkit.util.on(document, 'show', '#replacePhoto', function(){

		Webcam.set({
			// live preview size
			width: 320,
			height: 240,
			
			// device capture size
			dest_width: 320,
			dest_height: 240,
			
			// final cropped size
			crop_width: 240,
			crop_height: 240,
			
			// format and quality
			image_format: 'jpeg',
			jpeg_quality: 90
		});
	
		Webcam.attach('#camera');
		
	});

	UIkit.util.on(document, 'hide', '#replacePhoto', function(){
		Webcam.reset( '#camera' );
		document.getElementById('photo').innerHTML = '<img id="actualPhoto" src=""/>';
	});

/*
	function save_photo() {
	const fs = require('fs'); 
	var username = document.getElementById('searchusername').value;
	var imgSrc = document.getElementById('actualPhoto').src;
	var base64Image = imgSrc.split(';base64,').pop();
	//var fileName = process.cwd()+ '\\www\\photos\\' + document.getElementById("idfield").value + ".jpg";
	var fileName = "./www/assets/photos/" + document.getElementById("idfield").value + ".jpg";
	console.log(fileName);
	//Overlay
	document.getElementById("overlaytext").innerHTML="Saving Photo";
	document.getElementById("overlay").style.display = "block";
	fs.writeFile(fileName, base64Image, {encoding:'base64'}, function(err) {
		console.log('File created');
		document.getElementById("overlay").style.display = "none";
		$("#cameraModal").modal("hide");
	});
}


*/


});


