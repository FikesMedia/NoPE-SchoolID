
async function createPdf(company,firstName,lastName,title,id,badgeid,elementID,BGColor,TXTColor) {
	const fs = require('fs'); 
	var companyText = company;
	var firstNameText = firstName;
	var lastNameText = lastName;
	var titleText = title;
	var idText = id;
	var badgeidText = badgeid
	
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
	//Check for userphoto and assign default if none.
	const defaultJPG = process.cwd()+'\\www\\assets\\photos\\nophoto.jpg';
	var checkPath = process.cwd()+'\\www\\assets\\photos\\'+id+'.jpg';
	if (fs.existsSync(checkPath)) { 
		var jpgUrl = checkPath; 
	} else {
		var jpgUrl = defaultJPG;
	}
	
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
		y: 670,
		size: 72,
		color: PDFLib.rgb(0.93,1.00,0.00),
		font: BoldFont
	})



	//Name Text
	var nametextWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, 60);
	if (nametextWidth > page.getWidth()) {
		var fontSize = 44;
		nametextWidth = StandardFont.widthOfTextAtSize(firstNameText + " " + lastNameText, fontSize);
	} else {
		var fontSize = 60;
	}
	page.drawText(firstNameText + " " + lastNameText,{ 
		x: page.getWidth() / 2 - nametextWidth / 2,
		y: 190,
		size: fontSize,
		color: PDFLib.rgb(1,1,1),
		font: StandardFont
	});
	
	//Title Text
	var titletextWidth = BoldFont.widthOfTextAtSize(titleText, 72);
	if (titletextWidth > page.getWidth()){
		var titleFontSize = 54;
		titletextWidth = BoldFont.widthOfTextAtSize(titleText, titleFontSize);
	} else {
		var titleFontSize = 72;
	}
	//page.moveTo(25,115);
	page.drawText(titleText, {
		x: page.getWidth() / 2 - titletextWidth / 2,
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
	//page.moveTo(300, 650);	
	page.drawImage(jpgBarcode, {
	x: 40,//page.getWidth() / 2 - jpgBarcodeDims.width / 2,
	y: 1,
	width: page.getWidth() - 80, //jpgBarcodeDims.width,
	height: 95//jpgBarcodeDims.height,
	})
	
	//CLEVER Badge
	var checkCleverPath = process.cwd()+'\\www\\assets\\clever\\'+id+'.png';
	if (fs.existsSync(checkCleverPath)) { 
		//Add Page 2
		const page2 = pdfDoc.addPage([540, 840]);
		//CleverBarcode
		var pngUrl = checkCleverPath;
		var bitmap = fs.readFileSync(pngUrl);
		var pngImgBase64 = Buffer(bitmap).toString('base64');
		const pngImageBytes = await pngImgBase64;
		const pngImage = await pdfDoc.embedPng(pngImageBytes)
		const pngDims = pngImage.scale(1)
		const ImgW = page2.getWidth()-page2.getWidth()*.33;
		const ImgH = page2.getWidth()-page2.getWidth()*.33;
		//Draw Image
		//page.moveTo(300, 650);	
		page2.drawImage(pngImage, {
		x: page2.getWidth() / 2 - ImgW/2,     //jpgDims.width / 2,
		y: page2.getHeight() / 2 - ImgH/2 + 15,    // - jpgDims.height / 2 ,
		width: ImgW,       //jpgDims.width,
		height: ImgH       //jpgDims.height,
		})

		//Draw Clever Logo
		var logoCleverUrl = process.cwd()+'\\www\\assets\\clever\\_CleverLogo.png';
		var bitmap = fs.readFileSync(logoCleverUrl);
		var logoImgBase64 = Buffer(bitmap).toString('base64');
		const logoImageBytes = await logoImgBase64;
		const logoImage = await pdfDoc.embedPng(logoImageBytes)
		const logoDims = logoImage.scale(1)
		const logoW = page2.getWidth()-page2.getWidth()*.33;
		const logoH = 100;//page2.getWidth()-page2.getWidth()*.15;
		//Draw Image
		
		page2.drawImage(logoImage, {
			x: page2.getWidth() / 2 - ImgW/2,     
			y: page2.getHeight() / 2 - ImgH/2 - 100,    
			width: logoW,       
			height: logoH       
		})



		

		
	} else {
		
	}
	
	const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
	document.getElementById(elementID).src = pdfDataUri;
}