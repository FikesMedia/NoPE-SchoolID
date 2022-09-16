const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const path = require('path');
const fs = require('fs');
const app = express();
const shell = require('node-powershell');
const { Console } = require('console');
const { json } = require('body-parser');


// Configuration
const configFile = fs.readFileSync(process.cwd()+"\\config.json");
const config = JSON.parse(configFile);


//
// Setup Session Information
//
app.use(session({
	genid: function(req) {
		return uuidv4()
	},
	store: new MemoryStore({
		checkPeriod: 3600000
	}),
	secret: config.CookieSecret,
	resave: true,
	rolling: true,
	saveUninitialized: true,
	cookie: {
		httpOnly: false,
		rolling: true,
		expires: Number(config.CookieMaxAge)
	}  
}));
//
// END Setup Session Information
//


//
// Body Parser
app.use(bodyParser.json());
//
// Static File Serving 
app.use("/", express.static(__dirname + '/www'));
//  
// Default Document Redirect  
app.get('/', function(req, res){ 
    res.redirect('/index.html');
});
//
//


//
// Config Based Authentication
//
app.post('/authenticate', function(req, res) {
	console.log(req.params);
	console.log(req.session.id);
	const sessionID = req.session.id;
	const psparams = JSON.stringify(req.body);
	
	let ps1 = new shell({
		executionPolicy: 'Bypass',
		noProfile: true
	});
	
	ps1.addCommand(process.cwd()+config.AuthenticationMethod + ' -JSON \'' + psparams + '\'');
	ps1.invoke()
	.then(output => { 
		// Check if credentials valid
		var outputJSON = JSON.parse(output);
		if (outputJSON.Credentials == "Valid"){
			req.session.Username = psparams.Username;
			// Valid Session, Set Authenticated Cookie Session
			saveLoginInformation(sessionID, psparams, req);
		} else {
		}
		ps1.dispose();
		res.send(output);
	})
	.catch(err => {
		console.log("Failed Execution");
		console.log(err);
		ps1.dispose();
		res.send(err);
	})
});
//
// END Config Based Login
//


//
// Powershell GET Processor
//
app.get('/ps1/get/:script', function(req, res) {
	if (validateSessionInformation(req) == false){
		return "Not Authenticated";
	}
    console.log("GET " + req.params);
    const script = req.params.script;
	const psparams = JSON.stringify(req.body);
	
	let ps1 = new shell({
		executionPolicy: 'Bypass',
		noProfile: true
	});
	
	ps1.addCommand(process.cwd()+'\\ps1\\get\\' + script + ' -JSON \'' + psparams + '\'');
	ps1.invoke()
	.then(output => {
		ps1.dispose();
		res.send(output);
	})
	.catch(err => {
		console.log("Failed Execution");
		console.log(err);
		res.send(err);
		ps1.dispose();
	});
});
//
// END Powershell GET Processor
//


//
// Powershell POST Processor
//
app.post('/ps1/post/:script', function(req, res) {
	if (validateSessionInformation(req) == false){
		return "Not Authenticated";
	}
	const script = req.params.script;
	const psparams = JSON.stringify(req.body);
	
	let ps1 = new shell({
		executionPolicy: 'Bypass',
		noProfile: true
	});
	
	ps1.addCommand(process.cwd()+'\\ps1\\post\\' + script + ' -JSON \'' + psparams + '\'');
	ps1.invoke()
	.then(output => {
		ps1.dispose();
		res.send(output);
	})
	.catch(err => {
		console.log("Failed Execution");
		console.log(err);
		res.send(err);
		ps1.dispose();
	});
});
//
// END Powershell POST Processor
//


//
// API Helpers
//
app.get('/api/:APICall', function(req, res) {
    const Call = req.params.APICall;
	switch(Call) {
		//
		// Validate Session Login
		case 'validate':
			if(!req.session.Username) {
				res.send({ "SessionState": "Invalid" });
			} else {
				res.send({ "SessionState": "Valid" });
			}
			break;
		case 'logout':
			req.session.destroy();
			res.redirect(config.LogoutRedirectPage);
			break;
		//
		// Default Login Redirected Page
		case 'default':
			res.redirect(config.AuthenticatedRedirectPage);
			break;
		default:
			res.send({ "Error": "Improper use of API" });
			break;
	}
});
//
// API Helpers
//


//
// Validate Session Login
//
app.get('/validate',function (req, res) {
	if(!req.session.Username) {
		res.send({ "SessionState": "Invalid" });
	} else {
		res.send({ "SessionState": "Valid" });
	}
});
//
// END Validate Session Login
//


//
// Default Login Page Redirect
//
app.get('/default',function (req, res) {
	res.redirect(config.AuthenticatedRedirectPage);
});
//
// END Default Login Page Redirect
//


//
// Default Logout Page Redirect
//
app.get('/logout',function (req, res) {
	req.session.destroy();
	res.redirect(config.LogoutRedirectPage);
});
//
// END Default Logout Page Redirect
//


//
// 404 Handler
//
app.get('*',function (req, res) {
	res.redirect('/404.html');
});
//
// END 404 Handler
//


//
// Authentication Cookie and Session information
//
function saveLoginInformation(sessionID, userInfo, req){
	const crypto = require('crypto');
	// Add Instance of Username into Session Variables
	userInfo = JSON.parse(userInfo);
	req.session.Username = userInfo.Username;
	saveSessionData(req,userInfo.Username);
	console.log("Username is " + req.session.Username + " on Session " + req.session.id);
}
//
// ENDAuthentication Cookie and Session information
//


//
// Validate Session information
//
function validateSessionInformation(req){
	if(!req.session.Username) {
		return false;
	} else {
		return true;
	}
}
//
// END Validate Session information
//



//
// Save Session Data
//
function saveSessionData(req,Username){
	// Setup Dates
	var nowDate = new Date().getTime();
	var expireDate = parseInt(nowDate) + parseInt(config.CookieMaxAge);
}
//
// Save Session Data 
//




//
// Start Secure Server
//
https.createServer({
    key: fs.readFileSync(process.cwd()+config.PrivateKey),
    cert: fs.readFileSync(process.cwd()+config.Certificate),
    passphrase: config.CertificatePassword
}, app)
.listen(config.SSLPort, function (error){
	if(error) throw error 
	console.log(config.ApplicationName + " Started on port " + config.SSLPort);
	console.log("https://"+os.hostname()+":"+config.SSLPort);
});
