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
} // END Colorspace Conversions

async function createPdf(company,firstName,lastName,title,id,badgeid,badgephoto,cleverqr,elementID,BGColor,TitleColor,TXTColor) {
	var companyText = company;
	var firstNameText = firstName;
	var lastNameText = lastName;
	var titleText = title;
	var idText = id;
	var badgeidText = badgeid;
	var badgephoto = badgephoto;
	
	const pdfDoc = await PDFLib.PDFDocument.create();
	const page = pdfDoc.addPage([540, 840]);

	//Convert BGColor
	var PDFBGColor = HextoPDFColor(BGColor);

	//Background Color
	page.drawRectangle({
		x: 0,
		y: 0,
		width: page.getWidth(),
		height: page.getHeight(),
		color: PDFLib.rgb(PDFBGColor[0], PDFBGColor[1], PDFBGColor[2]),
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
	var jpgUrl = 'assets/photos/' + badgephoto;
	var jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());
	var jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
	var ImgW = page.getWidth()-page.getWidth()*.33;
	var ImgH = page.getWidth()-page.getWidth()*.33;

	//Draw Image	
	page.drawImage(jpgImage, {
	x: page.getWidth() / 2 - ImgW/2,
	y: page.getHeight() / 2 - ImgH/2 + 15,
	width: ImgW,      
	height: ImgH
	})


	//Set Font
	var StandardFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
	var BoldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold)

	//Convert Title Color
	var PDFTitleColor = HextoPDFColor(TitleColor)

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
		color: PDFLib.rgb(PDFTitleColor[0],PDFTitleColor[1],PDFTitleColor[2]),
		font: BoldFont
	})
	//END Dynamic Company Size
	
	//Convert Txt Color
	var PDFTextColor = HextoPDFColor(TXTColor);

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
		color: PDFLib.rgb(PDFTextColor[0],PDFTextColor[1],PDFTextColor[2]),
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
		color: PDFLib.rgb(PDFTitleColor[0],PDFTitleColor[1],PDFTitleColor[2]),
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
	var jpgBarcodeBytes = await jpgBarcodeBase64;
	var jpgBarcode = await pdfDoc.embedPng(jpgBarcodeBytes)
	var jpgBarcodeDims = jpgImage.scale(1)
	//Draw Barcode
	page.drawImage(jpgBarcode, {
		x: 40,
		y: 1,
		width: page.getWidth() - 80,
		height: 95
	})
	//End Barcode Generator



	//CLEVER Badge
	//Add Page 2
	var page2 = pdfDoc.addPage([540, 840]);
	//CleverBarcode
	var pngUrl = 'assets/clever/' + cleverqr;
	var pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
	var pngImage = await pdfDoc.embedPng(pngImageBytes)
	var ImgW = page2.getWidth()-page2.getWidth()*.33;
	var ImgH = page2.getWidth()-page2.getWidth()*.33;
	//Draw Image
	//page.moveTo(300, 650);	
	page2.drawImage(pngImage, {
	x: page2.getWidth() / 2 - ImgW/2,     //jpgDims.width / 2,
	y: page2.getHeight() / 2 - ImgH/2 + 15,    // - jpgDims.height / 2 ,
	width: ImgW,       //jpgDims.width,
	height: ImgH       //jpgDims.height,
	})

	//Draw Clever Logo
	var logoCleverUrl = 'assets/clever/_CleverLogo.png';
	var logoImageBytes = await fetch(logoCleverUrl).then((res) => res.arrayBuffer());
	var logoImage = await pdfDoc.embedPng(logoImageBytes)
	var logoDims = logoImage.scale(1)
	var logoW = page2.getWidth()-page2.getWidth()*.33;
	var logoH = 100;
	//Draw Image
	
	page2.drawImage(logoImage, {
		x: page2.getWidth() / 2 - ImgW/2,     
		y: page2.getHeight() / 2 - ImgH/2 - 100,    
		width: logoW,       
		height: logoH       
	})


	//Draw Out PDF
	const pdfDataUri = await pdfDoc.saveAsBase64();
	var pdfBlob = dataURItoBlob(pdfDataUri);
	var newSrc = window.URL.createObjectURL(pdfBlob);
	document.getElementById(elementID).src = newSrc;
}