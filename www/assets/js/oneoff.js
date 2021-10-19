//
// Camera Take Image
//
function take_snapshot() {
	// take snapshot and get image data
	Webcam.snap( function(data_uri) {
		// display results in page
		document.getElementById('photo').innerHTML = '<img id="actualPhoto" src="'+data_uri+'"/>';
		//Enable Use Button

	} );
} // END Take Photo


//
// Save Temporary Badge Photo
//
function use_snapshot() {


	$("#base64photo").val($("#actualPhoto").attr("src"));
	$("#employeeid").val("_tmp-" + $("#idfield").val());

	//Close Camera
	UIkit.modal("#replacePhoto").hide();

	//Serialize VooDoo
	$.fn.serializeObject = function() {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
	
	//Serial Form Data
	var formData = JSON.stringify($("#photoData").serializeObject());

	//Submit Photo for Saving
	$.ajax({
		url: "ps1/post/saveimage.ps1",
		data: formData,
		type: "post",
		contentType: "application/json",
		beforeSend: function (){
		},
		error: function() {
			console.log("Error");
		},
		success: function (data){
		}
	});
} // END Photo Save


//
// Deletes Temporary Badge Photo
//
function del_snapshot() {

	//Serialize VooDoo
	$.fn.serializeObject = function() {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
	
	//Serial Form Data
	var formData = JSON.stringify($("#photoData").serializeObject());


	//Request Photo Deletion
	$.ajax({
		url: "ps1/post/delimage.ps1",
		data: formData,
		type: "post",
		contentType: "application/json",
		beforeSend: function (){
		},
		error: function() {
			console.log("Error");
		},
		success: function (data){
		}
	});

} // END Photo Deletion


//
//Checks Data and submits OneOff Print
//
function checkDataAndPrint() {

	//Load Defaults
	$.getJSON("./defaults.json", function(defaults){

		//
		//Check for Required Fields
		//

		// First Name
		if ($("#firstnamefield").val() != null && $("#firstnamefield").val() != '') {  		
			var firstName = $("#firstnamefield").val();
		} else {
			UIkit.modal("#messageBox").show();
			return;
		}
		//Last Name
		if ($("#lastnamefield").val() != null && $("#lastnamefield").val() != '') {  		
			var lastName = $("#lastnamefield").val();
		} else {
			UIkit.modal("#messageBox").show();
			return;
		}
		//Company Name
		if ($("#companyfield").val() != null && $("#companyfield").val() != '') {  		
			var company = $("#companyfield").val();
		} else {
			UIkit.modal("#messageBox").show();
			return;
		}
		//Title Name
		if ($("#titlefield").val() != null && $("#titlefield").val() != '') {  		
			var title = $("#titlefield").val();
		} else {
			UIkit.modal("#messageBox").show();
			return;
		}
		//Employee ID
		if ($("#idfield").val() != null && $("#idfield").val() != '') {  		
			var empID = $("#idfield").val();
			var badgeID = empID;
		} else {
			UIkit.modal("#messageBox").show();
			return;
		}
		//Set default photo if none taken
		if ($("#base64photo").val() != null && $("#base64photo").val() != '') {  		
			var delPhotoStatus = true;
			var badgephoto = "_tmp-" + badgeID + ".jpg";
		} else {
			var delPhotoStatus = false;
			var badgephoto = defaults.BadgePhoto;
		}

		//Draw PDF
		createPdf(company,firstName,lastName,title,empID,badgeID,badgephoto,"pdfBadge",defaults.BGColor,defaults.TitleColor,defaults.TXTColor);
		
		//Enable Print Button
		$("#printBtn").prop("disabled", false);

		//Cleanup Temp Photo
		if (delPhotoStatus == true) {
			//Still Thinking of how to handle this.
			//del_snapshot();
		}

	});

} // END Check Data and Print


//
// Document Preparation
//
$(document).ready(function() {

	// Check Session State
	$.getJSON( "/api/validate", function( output ) {
		if(output.SessionState != "Valid") {
			window.location.replace('/login.html');
		}
	});

	//Disable Print and Photo Button until Data Available
	$("#printBtn").prop("disabled", true);
	$("#updatePhotoBtn").prop("disabled", true);

	//Prevent form Submission
	$("form").submit(function(e){
		e.preventDefault();
	});

	//Remove Spaces From Employee ID
	$("#idfield").change(function(){
		this.value = this.value.replace(/\s/g, "");
		if ($("#idfield").val() != null && $("#idfield").val() != '') {
			$("#updatePhotoBtn").prop("disabled", false);
		} else {
			$("#updatePhotoBtn").prop("disabled", true);
			//Clear Photo Submission Data
			$("#base64photo").val() = "";
			$("#employeeid").val() = "";
		}

	});


	//Load Defaults
	$.getJSON("./defaults.json", function(defaults){
		$("#companyfield").val(defaults.Company);

	});
 

	//Monitor Generate Button
	$("#generateIdBtn").click(function(){
		checkDataAndPrint();
	});

	//Monitor Print Button and Print
	$("#printBtn").click(function(){
		var PDF = document.getElementById("pdfBadge");
      	PDF.focus();
      	PDF.contentWindow.print();
	});

	//Build Camera on Modal Show
	UIkit.util.on(document, 'show', '#replacePhoto', function(){
		//Setup Camera Settings
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
		//Attach Camera to DIV
		Webcam.attach('#camera');
	});

	//Flush Camera on Modal Hide
	UIkit.util.on(document, 'hide', '#replacePhoto', function(){
		Webcam.reset( '#camera');
		document.getElementById('photo').innerHTML = '<img id="actualPhoto" src=""/>';

	});

}); // END Document Preparation


