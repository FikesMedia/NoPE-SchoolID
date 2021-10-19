//Color Space Convertions
function HextoPDFColor(hex) {
	//Convert RGBtoHex
	function ColorToHex(color) {
		var hexadecimal = color.toString(16);
		return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
	}

	function ConvertRGBtoHex(red, green, blue) {
		return ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
	}

	function ConvertHextoRGB(hex) {
		var red = parseInt(hex[1]+hex[2],16);
		var green = parseInt(hex[3]+hex[4],16);
		var blue = parseInt(hex[5]+hex[6],16);
		//return String(red) + String(green) + String(blue);
		var RGBArray = [red,green,blue];
		return RGBArray;
	}

	function ConvertoPDFColor(RGB) {
		//Proportional to Convert
		var red = RGB[0] / 255;
		var green = RGB[1] / 255;
		var blue = RGB[2] / 255;
		var JSColor =[red,green,blue];
		return JSColor;
	}

	var RGBColor = ConvertHextoRGB(hex);
	var PDFColor = ConvertoPDFColor(RGBColor);
	return PDFColor;
} // END Color Stuff


//Preview Badge
function previewBadge(){

	var firstName = $("#firstnamefield").val();
	var lastName = $("#lastnamefield").val();
	var company = $("#companyfield").val();
	var title = $("#titlefield").val();
	var id = $("#idfield").val();
	var badgeid = id;
	var badgephoto = "_Default.jpg";
	//Color
	var BGColor = $("#bgcolor").val();
	var TitleColor = $("#titlecolor").val();
	var TXTColor = $("#textcolor").val();



	createPdf(company,firstName,lastName,title,id,badgeid,badgephoto,"pdfBadge",BGColor,TitleColor,TXTColor)

}


function checkDataAndSave() {

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
	} else {
		UIkit.modal("#messageBox").show();
		return;
	}
	//BG Color
	if ($("#bgcolor").val() != null && $("#bgcolor").val() != '') {  		
		var bgcolor = $("#bgcolor").val();
	} else {
		UIkit.modal("#messageBox").show();
		return;
	}
	//BG Color
	if ($("#titlecolor").val() != null && $("#titlecolor").val() != '') {  		
		var titlecolor = $("#titlecolor").val();
	} else {
		UIkit.modal("#messageBox").show();
		return;
	}
	//BG Color
	if ($("#textcolor").val() != null && $("#textcolor").val() != '') {  		
		var textcolor = $("#textcolor").val();
	} else {
		UIkit.modal("#messageBox").show();
		return;
	}

	if ($("#newDefaultPhoto").val() != null && $("#newDefaultPhoto").val() != '') {  		
		var base64photo = $("#newDefaultPhoto").val();
	} 

	var newSettings = {};
	newSettings["Company"] = company;
	newSettings["Title"] = title;
	newSettings["EmpID"] = empID;
	newSettings["BadgeID"] = "";
	newSettings["FirstName"] = firstName;
	newSettings["LastName"] = lastName;
	newSettings["BGColor"] = bgcolor;
	newSettings["TitleColor"] = titlecolor;
	newSettings["TXTColor"] = textcolor;
	newSettings["base64photo"] = base64photo;

	//Create Form Data
	let formData = JSON.stringify(newSettings);
	console.log(formData);

	//Submit New Data
	$.ajax({
		url: "ps1/post/updatesettings.ps1",
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
			location.reload();
		}
	
	});
	


	//Submit save		

} // END Check Data and Print

//Generate Preview of Image
function previewDefaultImage() {
	const file = document.querySelector('input[type=file]').files[0];
	const reader = new FileReader();

	reader.addEventListener("load", function () {
	  // convert image file to base64 string
	  $("#photo").attr("src",reader.result);
	  //preview.src = reader.result;
	}, false);
  
	if (file) {
	  reader.readAsDataURL(file);
	}
  }


  function useImage(){
	  $("#defaultPhoto").attr("src", $("#photo").attr("src"));
	  $("#newDefaultPhoto").val($("#photo").attr("src"));
	  UIkit.modal("#replacePhoto").hide();
  }

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

	//Prevent form Submission
	$("form").submit(function(e){
		e.preventDefault();
	});

	//Remove Spaces From Employee ID
	$("#idfield").change(function(){
		this.value = this.value.replace(/\s/g, "");
	});

	$("#saveSettings").click(function(){
		checkDataAndSave();
	});

	//Load in Defaults
	$.getJSON("./defaults.json", function(defaults){
		$("#firstnamefield").val(defaults.FirstName);
		$("#lastnamefield").val(defaults.LastName);
		$("#companyfield").val(defaults.Company);
		$("#titlefield").val(defaults.Title);
		$("#idfield").val(defaults.EmpID);
		$("#defaultPhoto").attr("data-src","assets/photos/"+defaults.BadgePhoto);
		$("#defaultPhotoChange").attr("data-src","assets/photos/"+defaults.BadgePhoto);
		$("#bgcolor").val(defaults.BGColor);
		$("#titlecolor").val(defaults.TitleColor);
		$("#textcolor").val(defaults.TXTColor);
		
		//Set Pickers
		//Background
		var BGPicker = new JSColor('#bgcolor');
		BGPicker.option('previewSize', 80);
		//Title
		var TitlePicker = new JSColor("#titlecolor");
		TitlePicker.option('previewSize', 80)
		//Text
		var TextPicker = new JSColor("#textcolor");
		TextPicker.option('previewSize', 80);

		//Draw Preview
		previewBadge();
	});


	//Build Camera on Modal Show
	UIkit.util.on(document, 'show', '#replacePhoto', function(){
	
	});

	//Flush Camera on Modal Hide
	UIkit.util.on(document, 'hide', '#replacePhoto', function(){


	});

	//CreatePreview
	

}); // END Document Preparation


