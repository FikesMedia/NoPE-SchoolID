//Setup Color Format
jscolor.presets.default = {
	format:'rgb'
};

function testDefaults(){
	const fs = require('fs'); 
	const defaultsFile = fs.readFileSync(process.cwd()+'\\www\\defaults.json');
	var defaults = JSON.parse(defaultsFile);

	
}

async function createPdf(company,firstName,lastName,title,id,badgeid,elementID) {
	const fs = require('fs'); 
	var companyText = company;
	var firstNameText = firstName;
	var lastNameText = lastName;
	var titleText = title;
	var idText = id;
	var badgeidText = badgeid
	
	const pdfDoc = await PDFLib.PDFDocument.create();
	const page = pdfDoc.addPage([540, 860]);
	
	//Background Color
	page.drawRectangle({
		x: 0,
		y: 0,
		width: 540,
		height: 860,
		color: PDFLib.rgb(0, 0.14, 0.4),
		opacity: 1,
	})

	//Badge Image
	//Check for userphoto and assign default if none.
	const defaultJPG = process.cwd()+'\\www\\assets\\photos\\nophoto.jpg';
	var checkPath = process.cwd()+'\\www\\assets\\photos\\'+id+'.jpg';
	if (fs.existsSync(checkPath)) { 
		var jpgUrl = checkPath; 
	} else {
		var jpgUrl = defaultJPG;
	}
	//Example Code
	//const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
	//const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer())
	var bitmap = fs.readFileSync(jpgUrl);
	var jpgImgBase64 = Buffer(bitmap).toString('base64');
	const jpgImageBytes = await jpgImgBase64;
	const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
	const jpgDims = jpgImage.scale(1)
	const ImgW = page.getWidth()-page.getWidth()*.33;
	const ImgH = page.getWidth()-page.getWidth()*.33;

	//Draw Image
	//page.moveTo(300, 650);	
	page.drawImage(jpgImage, {
	x: page.getWidth() / 2 - ImgW/2,     //jpgDims.width / 2,
	y: page.getHeight() / 2 - ImgH/2 + 15,    // - jpgDims.height / 2 ,
	width: ImgW,       //jpgDims.width,
	height: ImgH       //jpgDims.height,
	})

	//Set Font
	const StandardFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
	const BoldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold)
	
	//Company Text
	const companytextWidth = BoldFont.widthOfTextAtSize(companyText, 72);
	//page.moveTo(75,700);
	page.drawText(companyText, {
		x: page.getWidth() / 2 - companytextWidth / 2,
		y: 700,
		size: 72,
		color: PDFLib.rgb(0.93,1.00,0.00),
		font: BoldFont
	})



	//Name Text
	var nametextWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, 64);
	if (nametextWidth > page.getWidth()) {
		var fontSize = 48;
		nametextWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, fontSize);
	} else {
		var fontSize = 64;
	}
	page.drawText(firstNameText + " " + lastNameText,{ 
		x: page.getWidth() / 2 - nametextWidth / 2,
		y: 200,
		size: fontSize,
		color: PDFLib.rgb(1,1,1),
		font: StandardFont
	});
	
	//Title Text
	const titletextWidth = BoldFont.widthOfTextAtSize(titleText, 72);
	//page.moveTo(25,115);
	page.drawText(titleText, {
		x: page.getWidth() / 2 - titletextWidth / 2,
		y: 115,
		size: 72,
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
	//page.moveTo(300, 650);	
	page.drawImage(jpgBarcode, {
	x: 1,//page.getWidth() / 2 - jpgBarcodeDims.width / 2,
	y: 1,
	width: page.getWidth(), //jpgBarcodeDims.width,
	height: 65//jpgBarcodeDims.height,
	})

	const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
	document.getElementById(elementID).src = pdfDataUri;
}