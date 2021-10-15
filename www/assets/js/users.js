//Take Image
function take_snapshot() {
	// take snapshot and get image data
	Webcam.snap( function(data_uri) {
		// display results in page
		document.getElementById('photo').innerHTML = '<img id="actualPhoto" src="'+data_uri+'"/>';
		//Enable Use Button

	} );
}


$(document).ready(function() {

	//Gets Information from Selected User
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
		console.log(formData);
	
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
					createPdf(company,firstName,lastName,title,empID,badgeID,badgephoto,"pdfBadge",defaults.BGColor,defaults.TXTColor);


					document.getElementById('updateInfoBtn').removeAttribute("disabled");
					document.getElementById('updatePhotoBtn').removeAttribute("disabled");
					document.getElementById('printBtn').removeAttribute("disabled");
		
	
				});
	
			}
		});
	}

	
	document.getElementById('updateInfoBtn').setAttribute("disabled", "");
	document.getElementById('updatePhotoBtn').setAttribute("disabled", "");
	document.getElementById('printBtn').setAttribute("disabled", "");
	


	//GET JSON Database
	$.getJSON( "/ps1/get/ad2xml.ps1", function( output ) {
		var UserDB = output; //JSON.parse(output);
		UIkit.modal("#loadingUsers").hide();
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
$('#cameraModal').on('hidden.bs.modal', function (e) {
	Webcam.reset( '#camera' );
	document.getElementById('savePhotoBtn').setAttribute("disabled", "");
	document.getElementById('actualPhoto').src = "";
})


function openModal() {
    $("#cameraModal").modal("show");
    //WEBCAM CODE
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
		
		Webcam.attach( '#camera' );
}

function take_snapshot() {
    // take snapshot and get image data
    Webcam.snap( function(data_uri) {
        // display results in page
		document.getElementById('photo').innerHTML = '<img id="actualPhoto" src="'+data_uri+'"/>';
		document.getElementById('savePhotoBtn').removeAttribute("disabled");
    } );
}

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

	GetUserInformation(username)
}

function updateInfo(){
	var username = document.getElementById('searchusername').value;
	var title = document.getElementById('titlefield').value;
	var employeeid = document.getElementById('idfield').value;
	var pager = document.getElementById('badgeidfield').value;

	const shell = require('node-powershell');
	//Overlay
	document.getElementById("overlaytext").innerHTML="Updating User Info";
	document.getElementById("overlay").style.display = "block";
	//User DB
	let ps1 = new shell({
		executionPolicy: 'Bypass',
		noProfile: true
	});
	ps1.addCommand(process.cwd()+'\\www\\assets\\ps1\\updateuserinfo.ps1 -username ' + username + ' -title \"' + title+ '\" -employeeid ' + employeeid+ ' -pager ' + pager )
	ps1.invoke()
	.then(output => {
		console.log("Updating User Information");
		console.log(output);
		var Message = JSON.parse(output);
		var Status = Message.Status.toString();
		if(Status=="Complete") {
			var UserSubmit = document.getElementById("searchusername").value;
			
			GetUserInformation(UserSubmit);
			document.getElementById("overlay").style.display = "none";
		}
	})	
	.catch(err => {
		console.log(err);
		ps1.dispose();
		});
}
*/


});