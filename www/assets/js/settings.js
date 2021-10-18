function checkDataAndSave() {

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
		//createPdf(company,firstName,lastName,title,empID,badgeID,badgephoto,"pdfBadge",defaults.BGColor,defaults.TXTColor);
		
	});

} // END Check Data and Print


function previewFile() {
	const preview = $("#imagePreview")
	const file = document.querySelector('input[type=file]').files[0];
	const reader = new FileReader();
  
	reader.addEventListener("load", function () {
	  // convert image file to base64 string
	  preview.src = reader.result;
	}, false);
  
	if (file) {
	  reader.readAsDataURL(file);
	}
  }


//
// Document Preparation
//
$(document).ready(function() {

	//Prevent form Submission
	$("form").submit(function(e){
		e.preventDefault();
	});

	//Remove Spaces From Employee ID
	$("#idfield").change(function(){
		this.value = this.value.replace(/\s/g, "");
	});

	//Load in Defaults
	$.getJSON("./defaults.json", function(defaults){
		$("#firstnamefield").val(defaults.FirstName);
		$("#lastnamefield").val(defaults.LastName);
		$("#companyfield").val(defaults.Company);
		$("#titlefield").val(defaults.Title);
		$("#idfield").val(defaults.BadgeID);
		$("#defaultPhoto").attr("data-src","assets/photos/"+defaults.BadgePhoto);
		$("#defaultPhotoChange").attr("data-src","assets/photos/"+defaults.BadgePhoto);
	});


	//Build Camera on Modal Show
	UIkit.util.on(document, 'show', '#replacePhoto', function(){
	
	});

	//Flush Camera on Modal Hide
	UIkit.util.on(document, 'hide', '#replacePhoto', function(){


	});

}); // END Document Preparation


