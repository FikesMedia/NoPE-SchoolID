// Conversion from Data URI to BLOB
function dataURItoBlob(dataURI) {
	const byteString = window.atob(dataURI);
	const arrayBuffer = new ArrayBuffer(byteString.length);
	const int8Array = new Uint8Array(arrayBuffer);
	for (let i = 0; i < byteString.length; i++) {
	  int8Array[i] = byteString.charCodeAt(i);
	}
	const blob = new Blob([int8Array], { type: 'application/pdf'});
	return blob;
}

async function createPdf(company,firstName,lastName,title,id,badgeid,badgephoto,elementID,BGColor,TXTColor) {
	var companyText = company;
	var firstNameText = firstName;
	var lastNameText = lastName;
	var titleText = title;
	var idText = id;
	var badgeidText = badgeid;
	var badgephoto = badgephoto;
	
	const pdfDoc = await PDFLib.PDFDocument.create();
	const page = pdfDoc.addPage([540, 840]);
	
	//Background Color
	page.drawRectangle({
		x: 0,
		y: 0,
		width: page.getWidth(),
		height: page.getHeight(),
		color: PDFLib.rgb(0, 0.14, 0.4),
		opacity: 1,
	})

	//Barcode Box
	page.drawRectangle({
		x: 0,
		y: 0,
		width: page.getWidth(),
		height: 100,
		color: PDFLib.rgb(1, 1, 1),
		opacity: 1,
	})

	//Badge Image
	const jpgUrl = 'assets/photos/' + badgephoto;
	const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());
	const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
	const ImgW = page.getWidth()-page.getWidth()*.33;
	const ImgH = page.getWidth()-page.getWidth()*.33;

	//Draw Image	
	page.drawImage(jpgImage, {
	x: page.getWidth() / 2 - ImgW/2,
	y: page.getHeight() / 2 - ImgH/2 + 15,
	width: ImgW,      
	height: ImgH
	})


	//Set Font
	const StandardFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
	const BoldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold)

	
	//Dynamic Company Size
	var companyFontSize = 72;
	var companytextWidth = BoldFont.widthOfTextAtSize(companyText, companyFontSize);
	//Reduce Till Fit
	while (companytextWidth > page.getWidth() - 50){
		companyFontSize = companyFontSize - 4;
		companytextWidth = BoldFont.widthOfTextAtSize(companyText, companyFontSize);
	}
	page.drawText(companyText, {
		x: page.getWidth() / 2 - companytextWidth / 2,
		y: 670,
		size: companyFontSize,
		color: PDFLib.rgb(0.93,1.00,0.00),
		font: BoldFont
	})
	//END Dynamic Company Size


	//Dynamic Name Size
	var nameFontSize = 60;
	var NameWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, nameFontSize);
	//Reduce Size Till Fit
	while (NameWidth > page.getWidth() - 50){
		nameFontSize = nameFontSize - 4;
		NameWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, nameFontSize);
	}
	page.drawText(firstNameText + " " + lastNameText,{ 
		x: page.getWidth() / 2 - NameWidth / 2,
		y: 190,
		size: nameFontSize,
		color: PDFLib.rgb(1,1,1),
		font: StandardFont
	});
	//End Dynamic Name Size


	//Dynamic Title Size
	var titleFontSize = 60
	var titletextWidth = BoldFont.widthOfTextAtSize(titleText, titleFontSize);
	//Reduce Size Till Fit
	while (titletextWidth > page.getWidth() - 50){
		titleFontSize = titleFontSize - 4;
		titletextWidth = BoldFont.widthOfTextAtSize(titleText, titleFontSize);
	}
	page.drawText(titleText, {
		x: page.getWidth() / 2 - titletextWidth / 2,
		y: 115,
		size: titleFontSize,
		color: PDFLib.rgb(0.93,1.00,0.00),
		font: BoldFont
	})
	//END Dynamic Title Size



	//Barcode Generator
	function textToBase64Barcode(text){
		var canvas = document.createElement("canvas");
		JsBarcode(canvas, text, {format: "CODE39", margin: 5, fontSize: 0, marginTop:0, marginBottom:0, flat:true});
		return canvas.toDataURL("image/png");
	}
	//Create Barcode IMG
	var jpgBarcodeBase64 = textToBase64Barcode(idText)
	const jpgBarcodeBytes = await jpgBarcodeBase64;
	const jpgBarcode = await pdfDoc.embedPng(jpgBarcodeBytes)
	const jpgBarcodeDims = jpgImage.scale(1)
	//Draw Barcode
	page.drawImage(jpgBarcode, {
		x: 40,
		y: 1,
		width: page.getWidth() - 80,
		height: 95
	})
	//End Barcode Generator


	//Draw Out PDF
	const pdfDataUri = await pdfDoc.saveAsBase64();
	var pdfBlob = dataURItoBlob(pdfDataUri);
	var newSrc = window.URL.createObjectURL(pdfBlob);
	document.getElementById(elementID).src = newSrc;
}