console.log("Current Directory "+process.cwd());

const shell = require('node-powershell');
//Overlay
document.getElementById("overlay").style.display = "block";
//User DB
let ps1 = new shell({
	executionPolicy: 'Bypass',
	noProfile: true
});
ps1.addCommand(process.cwd()+'\\www\\assets\\ps1\\addb.ps1')
ps1.invoke()
.then(output => {
	console.log("Creating User Database");
	console.log(output);
	var UserDB = JSON.parse(output);
	$("#searchusername").easyAutocomplete(
		{
			data: UserDB,
			getValue: "SamAccountName",
			requestDelay: 100,
			list: {
				maxNumberOfElements: 15,
				onLoadEvent: function(){
					document.getElementById('updateInfoBtn').setAttribute("disabled", "");
					document.getElementById('updatePhotoBtn').setAttribute("disabled", "");
					document.getElementById('printBTN').setAttribute("disabled", "");
					

				},
				onClickEvent: function() {
					//SubmitSearchForm();
					console.log("Submitting");
					var UserSubmit = document.getElementById("searchusername").value;
					console.log(UserSubmit);
					GetUserInformation(UserSubmit);
				},
				match: {
					enabled: true
				}
			}
		}
	);
	document.getElementById("overlay").style.display = "none";
})
.catch(err => {
	console.log("Failed Creating DB");
  console.log(err);
  ps1.dispose();
});


function GetUserInformation(Username) {
	
	let ps = new shell({
		executionPolicy: 'Bypass',
		noProfile: true
	});
	//Default Settings
	const fs = require('fs'); 
	const defaultsFile = fs.readFileSync(process.cwd()+'\\www\\defaults.json');
	var defaults = JSON.parse(defaultsFile);

	ps.addCommand(process.cwd()+'\\www\\assets\\ps1\\userinfo.ps1 -Username ' + Username )
	ps.invoke()
	.then(output => {
	  console.log(output);
		var userJSON = JSON.parse(output);
		if (!userJSON.company) {
			var company = defaults.Company;
		} else {
			var company = userJSON.company.toString();
		}
		if (!userJSON.givenname) {
			var firstName = defaults.FirstName;
		} else {
			var firstName = userJSON.givenname.toString();
		}
		if (!userJSON.surname) {
			var lastName = defaults.LastName;
		} else {
			var lastName = userJSON.surname.toString();
		}
		if (!userJSON.title) {
			var title = defaults.Title;
		} else {
			var title = userJSON.title.toString();
		}
		if (!userJSON.employeeid) {
			var empID = defaults.EmpID;
		} else {
			var empID = userJSON.employeeid.toString();
		}
		if (!userJSON.pager){
			var badgeID = defaults.BadgeID;
		} else {
			var badgeID = userJSON.pager.toString();
		}
		
		document.getElementById("firstnamefield").value = firstName;
		document.getElementById("lastnamefield").value = lastName;
		document.getElementById("titlefield").value = title;
		document.getElementById("idfield").value = empID;
		document.getElementById("badgeidfield").value = badgeID;	
		  
		//Draw PDF
		createPdf(company,firstName,lastName,title,empID,badgeID,"pdfBadge",defaults.BGColor,defaults.TXTColor);

		document.getElementById('updateInfoBtn').removeAttribute("disabled");
		document.getElementById('updatePhotoBtn').removeAttribute("disabled");
		document.getElementById('printBTN').removeAttribute("disabled");
		
	})
	.catch(err => {
	  console.log(err);
	  ps.dispose();
	});
}


$(document).ready(function() {
	$("#printBTN").click(function(){
		frames["pdfBadge"].focus();
        frames["pdfBadge"].print();
	});
});

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