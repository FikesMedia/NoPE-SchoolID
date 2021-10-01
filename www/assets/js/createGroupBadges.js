async function createGroupSet(groupObject,elementID) {

	const fs = require('fs');
	const defaultsFile = fs.readFileSync(process.cwd()+'\\www\\defaults.json');
	var defaults = JSON.parse(defaultsFile);

	var groupEntries = JSON.parse(groupObject);
	var pageTotal = Object.keys(groupEntries).length;
	console.log("Total Records: "+ pageTotal)

	const pdfDoc = await PDFLib.PDFDocument.create();
	
	
	var page = new Array();

	for(var i = 0; i < pageTotal; i++) {

		if (!groupEntries[i].company) {
			var companyText = defaults.Company;
		} else {
			var companyText = groupEntries[i].company.toString();
		}
		if (!groupEntries[i].givenname) {
			var firstNameText = defaults.FirstName;
		} else {
			var firstNameText = groupEntries[i].givenname.toString();
		}
		if (!groupEntries[i].surname) {
			var lastNameText = defaults.LastName;
		} else {
			var lastNameText = groupEntries[i].surname.toString();
		}
		if (!groupEntries[i].title) {
			var titleText = defaults.Title;
		} else {
			var titleText = groupEntries[i].title.toString();
		}
		if (!groupEntries[i].employeeid) {
			var idText = defaults.EmpID;
		} else {
			var idText = groupEntries[i].employeeid.toString();
		}
		if (!groupEntries[i].pager){
			var badgeidText = defaults.BadgeID;
		} else {
			var badgeidText = groupEntries[i].pager.toString();
		}

		console.log(companyText + firstNameText + lastNameText  + titleText + idText+  badgeidText)
	
		page[i] = pdfDoc.addPage([540, 860]);
		//Background Color
		page[i].drawRectangle({
			x: 0,
			y: 0,
			width:  page[i].getWidth(),
			height:  page[i].getHeight(),
			color: PDFLib.rgb(0, 0.14, 0.4),
			opacity: 1,
		});
			//Barcode Box
		page[i].drawRectangle({
			x: 0,
			y: 0,
			width: page[i].getWidth(),
			height: 68,
			color: PDFLib.rgb(1, 1, 1),
			opacity: 1,
		})

	//Badge Image
	//Check for userphoto and assign default if none.
	const defaultJPG = process.cwd()+'\\www\\assets\\photos\\nophoto.jpg';
	var checkPath = process.cwd()+'\\www\\assets\\photos\\'+idText+'.jpg';
	console.log("ImagePath " + checkPath)
	
	if (fs.existsSync(checkPath)) { 
		var jpgUrl = checkPath; 
	} else {
		var jpgUrl = defaultJPG;
	}
	var bitmap = fs.readFileSync(jpgUrl);
	var jpgImgBase64 = Buffer(bitmap).toString('base64');
	const jpgImageBytes = await jpgImgBase64;
	const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
	const jpgDims = jpgImage.scale(1.25)
	//Draw Image	
	page[i].drawImage(jpgImage, {
	x: page[i].getWidth() / 2 - jpgDims.width / 2,
	y: page[i].getHeight() / 2 - jpgDims.height / 2 ,
	width: jpgDims.width,
	height: jpgDims.height,
	})

	//Set Font
	const StandardFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
	const BoldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold)
	
	//Company Text
	const companytextWidth = BoldFont.widthOfTextAtSize(companyText, 72);
	page[i].drawText(companyText, {
		x: page[i].getWidth() / 2 - companytextWidth / 2,
		y: 700,
		size: 72,
		color: PDFLib.rgb(0.93,1.00,0.00),
		font: BoldFont
	})



	//Name Text
	var nametextWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, 64);
	if (nametextWidth > page[i].getWidth()) {
		var fontSize = 48;
		nametextWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, fontSize);
	} else {
		var fontSize = 64;
	}
	page[i].drawText(firstNameText + " " + lastNameText,{ 
		x: page[i].getWidth() / 2 - nametextWidth / 2,
		y: 200,
		size: fontSize,
		color: PDFLib.rgb(1,1,1),
		font: StandardFont
	});
	
	
	//Title Text
	var titletextWidth = BoldFont.widthOfTextAtSize(titleText, 72);
	if (titletextWidth > page[i].getWidth()){
		var titleFontSize = 64;
		titletextWidth = BoldFont.widthOfTextAtSize(titleText, titleFontSize);
	} else {
		var titleFontSize = 72;
	}
	page[i].drawText(titleText, {
		x: page[i].getWidth() / 2 - titletextWidth / 2,
		y: 115,
		size: titleFontSize,
		color: PDFLib.rgb(0.93,1.00,0.00),
		font: BoldFont
	})


	//Barcode Generator
	function textToBase64Barcode(text){
		var canvas = document.createElement("canvas");
		JsBarcode(canvas, text, {format: "CODE39", margin: 5, fontSize: 0, marginTop:0, marginBottom:0, flat:true});
		return canvas.toDataURL("image/png");
	}
	//Barcode IMG
	var jpgBarcodeBase64 = textToBase64Barcode(idText)
	console.log(jpgBarcodeBase64);
	const jpgBarcodeBytes = await jpgBarcodeBase64;
	const jpgBarcode = await pdfDoc.embedPng(jpgBarcodeBytes)
	const jpgBarcodeDims = jpgImage.scale(1)
	//Draw Image	
	page[i].drawImage(jpgBarcode, {
	x: 40,
	y: 1,
	width: page[i].getWidth()-80,
	height: 65
	})
	}

	//var pdfDataUri = await pdfDoc.saveAsBase64();
	//var pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
	//console.log(pdfDataUri);

	var pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
	return pdfDataUri;

	//return pdfDoc.saveAsBase64({ dataUri: true });

	//document.getElementById(elementID).src = pdfDataUri;

	//var pdfBytes = await pdfDoc.save;
	//download(pdfBytes, "GroupBadges.pdf", "application/pdf");
}