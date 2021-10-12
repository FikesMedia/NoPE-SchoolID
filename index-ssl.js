
const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const https = require('https');
const path = require('path');
const fs = require('fs');
const app = express();
const shell = require('node-powershell');

// Configuration
const configFile = fs.readFileSync(process.cwd()+"\\config.json");
const config = JSON.parse(configFile);

// Session and Cookie Setup
app.use(cookieParser());
app.use(session({
	secret: config.CookieSecret,
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: Number(config.CookieMaxAge)
	}  
}));

// Body Parser
app.use(bodyParser.json());
  
// Static File Serving 
app.use("/", express.static(__dirname + '/www'));
  
// Default Document Redirect  
app.get('/', function(req, res){ 
    res.redirect('/index.html');
});

// Login Authentication and Authorization
app.post('/ps1/auth/:script', function(req, res) {
	console.log(req.params);

    const script = req.params.script;
	const psparams = JSON.stringify(req.body);
	
	let ps1 = new shell({
		executionPolicy: 'Bypass',
		noProfile: true
	});
	
	ps1.addCommand(process.cwd()+'\\ps1\\auth\\' + script + ' -JSON \'' + psparams + '\'');
	ps1.invoke()
	.then(output => {
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
// Powershell GET Processor
//
app.get('/ps1/get/:script', function(req, res) {
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
	//if (validateSessionInformation(req) == false){
	//	return "Not Authenticated";
	//}
	const script = req.params.script;
	const psparams = JSON.stringify(req.body);
	
	let ps1 = new shell({
		executionPolicy: 'Bypass',
		noProfile: true
	});
	
	ps1.addCommand(process.cwd()+'\\ps1\\post\\' + script + ' -JSON \'' + psparams + '\'');
	ps1.invoke()
	.then(output => {
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



// Start Secure Server
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