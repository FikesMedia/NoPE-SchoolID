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
	$("#employeeid").val($("#idfield").val());

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

	GetUserInformation($("#searchusername").val());

} // END Photo Save


//
// Check Data and Update
//
function checkDataAndUpdate(){

	//
	//Check for Required Fields
	//

	if ($("#searchusername").val() != null && $("#searchusername").val() != '') {  		
		var username = $("#searchusername").val();
	} else {
		UIkit.modal("#messageBox").show();
		return;
	}
	
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
	//Title Name
	if ($("#titlefield").val() != null && $("#titlefield").val() != '') {  		
		var title = $("#titlefield").val();
	} else {
		UIkit.modal("#messageBox").show();
		return;
	}
	//Employee ID
	if ($("#idfield").val() != null && $("#idfield").val() != '') {  		
		var employeeid = $("#idfield").val();
	} else {
		UIkit.modal("#messageBox").show();
		return;
	}
	//Badge ID
	if ($("#badgeidfield").val() != null && $("#badgeidfield").val() != '') {  		
		var badgeid = $("#badgeidfield").val();
	} else {
	}

	//Create Form Data
	let formData = '{ "username" : "' + username +  '", "title" : "' + title + '", "pager" : "' + badgeid + '", "employeeid" : "' + employeeid + '" }';

	//Submit New Data
	$.ajax({
		url: "ps1/post/updateuserinfo.ps1",
		data: formData,
		type: "post",
		contentType: "application/json",
		beforeSend: function (){
			//
		},
		error: function() {
			console.log("Error");
		},

		//Create the Badge
		success: function (data){
			GetUserInformation(document.getElementById("searchusername").value);
			console.log(data);
		}
	
	});

}

//
//Gets Information from Selected User
//
function GetUserInformation(Username) {

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

	
	var formData = JSON.stringify($("#searchForm").serializeObject());

	$.ajax({
		url: "ps1/post/userinfo.ps1",
		data: formData,
		type: "post",
		contentType: "application/json",
		beforeSend: function (){
			//
		},
		error: function() {
			console.log("Error");
		},

		//Create the Badge
		success: function (data){

			//Load Defaults and build badge
			$.getJSON("./defaults.json", function(defaults){
			
				var userJSON = JSON.parse(data);
				
				//Set User Information
				var company = userJSON.company.toString();
				var firstName = userJSON.givenname.toString();
				var lastName = userJSON.surname.toString();
				var title = userJSON.title.toString();
				var empID = userJSON.employeeid.toString();
				var badgeID = userJSON.pager.toString();
				var badgephoto = userJSON.badgephoto;

				document.getElementById("firstnamefield").value = firstName;
				document.getElementById("lastnamefield").value = lastName;
				document.getElementById("titlefield").value = title;
				document.getElementById("idfield").value = empID;
				document.getElementById("badgeidfield").value = badgeID;

				//Draw PDF
				createPdf(company,firstName,lastName,title,empID,badgeID,badgephoto,"pdfBadge",defaults.BGColor,defaults.TitleColor,defaults.TXTColor);

				//Enable Buttons
				document.getElementById('updateInfoBtn').removeAttribute("disabled");
				document.getElementById('updatePhotoBtn').removeAttribute("disabled");
				document.getElementById('printBtn').removeAttribute("disabled");
	

			});

		}
	});
} // END Get Select User Data


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

	

	
	document.getElementById('updateInfoBtn').setAttribute("disabled", "");
	document.getElementById('updatePhotoBtn').setAttribute("disabled", "");
	document.getElementById('printBtn').setAttribute("disabled", "");
	


	//GET JSON Database
	$.getJSON( "/ps1/get/ad2xml.ps1", function( output ) {
		var UserDB = output; //JSON.parse(output);
		
		$("#searchusername").easyAutocomplete(
			{
				data: UserDB,
				getValue: "SamAccountName",
				template: {
					type: "custom",
					method: function(value, item){
						return item.EmployeeID + " - " + item.Name;
					}
				},
				requestDelay: 100,
				list: {
					maxNumberOfElements: 15,
					onLoadEvent: function(){
						document.getElementById('updateInfoBtn').setAttribute("disabled", "");
						document.getElementById('updatePhotoBtn').setAttribute("disabled", "");
						document.getElementById('printBtn').setAttribute("disabled", "");
					},
					onClickEvent: function() {
						//SubmitSearchForm();
						var UserSubmit = document.getElementById("searchusername").value;
						GetUserInformation(UserSubmit);
					},
					match: {
						enabled: true
					}
				}
			}
		);
		UIkit.modal("#loadingUsers").hide();
	})
	.catch(err => {
		console.log(err);
	});




	console.log("All Loaded")

	//Prevent form Submission
	$("form").submit(function(e){
		e.preventDefault();
	});

	UIkit.modal("#loadingUsers").show();

	$("#printBtn").click(function(){
		var PDF = document.getElementById("pdfBadge");
      	PDF.focus();
      	PDF.contentWindow.print();
	});

	$("#updateInfoBtn").click(function(){
		checkDataAndUpdate();
		
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

});