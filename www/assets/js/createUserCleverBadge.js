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
	//ID-1 Badge Size
	const page = pdfDoc.addPage([162, 252]);
	
	
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
		height: page.getHeight() * .12,
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
	y: page.getHeight() / 2 - ImgH/2 + page.getHeight() * .00,
	width: ImgW,      
	height: ImgH
	})


	//Set Font
	const StandardFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
	const BoldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold)

	//Convert Title Color
	var PDFTitleColor = HextoPDFColor(TitleColor)

	//Dynamic Company Size
	var companyFontSize = page.getHeight()*.25;
	var companytextWidth = BoldFont.widthOfTextAtSize(companyText, companyFontSize);
	//Reduce Till Fit
	while (companytextWidth > page.getWidth() - (page.getWidth() * .10)){
		companyFontSize = companyFontSize - 4;
		companytextWidth = BoldFont.widthOfTextAtSize(companyText, companyFontSize);
	}
	page.drawText(companyText, {
		x: page.getWidth() / 2 - companytextWidth / 2,
		y: page.getHeight() * .8, 
		size: companyFontSize,
		color: PDFLib.rgb(PDFTitleColor[0],PDFTitleColor[1],PDFTitleColor[2]),
		font: BoldFont
	})
	//END Dynamic Company Size

	//Convert Txt Color
	var PDFTextColor = HextoPDFColor(TXTColor);

	//Dynamic Name Size
	var nameFontSize = page.getHeight() * .0825;
	var NameWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, nameFontSize);
	//Reduce Size Till Fit
	while (NameWidth > page.getWidth() - (page.getWidth() * .10)){
		nameFontSize = nameFontSize - 2;
		NameWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, nameFontSize);
	}
	page.drawText(firstNameText + " " + lastNameText,{ 
		x: page.getWidth() / 2 - NameWidth / 2,
		y: page.getHeight() * .22,//190,
		size: nameFontSize,
		//color: PDFLib.rgb(1,1,1),
		color: PDFLib.rgb(PDFTextColor[0],PDFTextColor[1],PDFTextColor[2]),
		font: StandardFont
	});
	//End Dynamic Name Size


	//Dynamic Title Size
	var titleFontSize = page.getHeight() * .09;
	var titletextWidth = BoldFont.widthOfTextAtSize(titleText, titleFontSize);
	//Reduce Size Till Fit
	while (titletextWidth > page.getWidth() - (page.getWidth() * .15)){
		titleFontSize = titleFontSize - 4;
		titletextWidth = BoldFont.widthOfTextAtSize(titleText, titleFontSize);
	}
	page.drawText(titleText, {
		x: page.getWidth() / 2 - titletextWidth / 2,
		y: page.getHeight() * .14, //115,
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
	const jpgBarcodeBytes = await jpgBarcodeBase64;
	const jpgBarcode = await pdfDoc.embedPng(jpgBarcodeBytes)
	const jpgBarcodeDims = jpgImage.scale(1)
	//Draw Barcode
	page.drawImage(jpgBarcode, {
		x: page.getWidth() * .08,
		y: 0,//1,
		width: page.getWidth() - (page.getWidth() * .16),
		height: page.getHeight() * .12
	})
	//End Barcode Generator



	//CLEVER Badge
	//Add Page 2
	const page2 = pdfDoc.addPage([162, 252]);
	//CleverBarcode
	var pngUrl = '/assets/clever/' + cleverqr;
	var pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
	var pngImage = await pdfDoc.embedPng(pngImageBytes)
	var CImgW = page2.getWidth()-page2.getWidth()*.33;
	var CImgH = page2.getWidth()-page2.getWidth()*.33;
	//Draw Image
	//page.moveTo(300, 650);	
	page2.drawImage(pngImage, {
	x: page2.getWidth() / 2 - CImgW/2,     //jpgDims.width / 2,
	y: page2.getHeight() / 2 - CImgH/2,    // - jpgDims.height / 2 ,
	width: CImgW,       //jpgDims.width,
	height: CImgH       //jpgDims.height,
	})

	//Draw Clever Logo
	var logoCleverUrl = 'assets/img/CleverLogo.png';
	var logoImageBytes = await fetch(logoCleverUrl).then((res) => res.arrayBuffer());
	var logoImage = await pdfDoc.embedPng(logoImageBytes)
	var logoDims = logoImage.scale(1)
	var logoW = page2.getWidth()-page2.getWidth()*.33;
	var logoH = page2.getHeight()-page2.getHeight()*.88;
	//Draw Image
	
	page2.drawImage(logoImage, {
		x: page2.getWidth() / 2 - ImgW/2,     
		y: page2.getHeight() / 6 ,
		width: logoW,       
		height: logoH       
	})


	//Draw Out PDF
	const pdfDataUri = await pdfDoc.saveAsBase64();
	var pdfBlob = dataURItoBlob(pdfDataUri);
	var newSrc = window.URL.createObjectURL(pdfBlob);
	document.getElementById(elementID).src = newSrc;
}