
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
const sqlite3 = require('sqlite3').verbose();
const app = express();
const shell = require('node-powershell');
const { Console } = require('console');

// Configuration
const configFile = fs.readFileSync(process.cwd()+"\\config.json");
const config = JSON.parse(configFile);


//Probably NOT NEEDED
// Session and Cookie Setup
//app.use(cookieParser());


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
		maxAge: Number(config.CookieMaxAge)
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

/*
// Login Authentication
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
		// Check if credentials valid
		var outputJSON = JSON.parse(output);
		if (outputJSON.Credentials == "Valid"){
			const cookie = require('./includes/cookies.js');
			cookie.setAuthenticatedCookie(psparams);
	
			req.session.Username = psparams.Username;



		} else {
			const cookie = require('./includes/cookies.js');
			cookie.expireAuthenticatedCookie(psparams);
		}
		res.send(output);
	})
	.catch(err => {
		console.log("Failed Execution");
		console.log(err);
		res.send(err);
		ps1.dispose();
	});
});
*/

//
// Config Based Authentication
//
app.post('/authenticate', function(req, res) {
	console.log(req.params);
	console.log(req.session.id);
	const sessionID = req.session.id;
    //const script = req.params.script;
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
			//const cookie = require('./includes/cookies.js');
			//cookie.setAuthenticatedCookie(psparams);
			//req.session.Username = psparams.Username;

			// Valid Session, Set Authenticated Cookie Session
			saveLoginInformation(sessionID, psparams, req);

		} else {
			//const cookie = require('./includes/cookies.js');
			//cookie.expireAuthenticatedCookie(psparams);

		}

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
// END Config Based Login
//


//
// Powershell GET Processor
//
app.get('/ps1/get/:script', function(req, res) {
    console.log("GET " + req.params);
    const script = req.params.script;
	const psparams = req.query.JSON;
	
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
	if (validateSessionInformation(req) == false){
		return "Not Authenticated";
	}
	console.log("POST " + req.params);

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
// Testing URL
//
app.get('/testing',function (req, res) {
	testSQLite();
	res.send("Testing Complete");
});
//
// END Testing URL
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
// Start Server
//
app.listen(config.HTTPPort, function(error){ 
	if(error) throw error 
	console.log(config.ApplicationName + " Started on port " + config.HTTPPort);
	console.log("http://"+os.hostname()+":"+config.HTTPPort);
});
//
// END Start Server
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
	// SessionID User Hash
	//req.session.SessionHash = crypto.createHash('sha256').update(sessionID + userInfo.Username + random).digest('base64');
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
// TESTING SQLITE
//
function testSQLite(){
	let db = new sqlite3.Database('sessionStore.db', (err) => {
		if (err) {
		  return console.error(err.message);
		} else {
			let sql = `SELECT * FROM sessions ORDER BY start`;

			db.all(sql, [], (err, rows) => {
				if (err) {
					throw err;
				}
				rows.forEach((row) => {
					//Constructor
					startDate = new Date(parseInt(row.start));
					expireDate = new Date(parseInt(row.expire));
					console.log("Start " + startDate.toString() + " Expire " + expireDate.toString());
				});
			});

		}
	  });
	  
	  // close the database connection
	  db.close((err) => {
		if (err) {
		  return console.error(err.message);
		}
		console.log('Close the database connection.');
	  });
}
//
// TESTING SQLITE
//


//
// Save Session Data to SQLITE
//
function saveSessionData(req,Username){
	// Setup Dates
	var nowDate = new Date().getTime();
	var expireDate = parseInt(nowDate) + parseInt(config.CookieMaxAge);
	// Connnect
	let db = new sqlite3.Database('sessionStore.db', (err) => {
		if (err) {
		  return console.error(err.message);
		} else {
			// Insert Data
			db.run(`INSERT INTO sessions(id,username,start,expire) VALUES(?,?,?,?)`, 
				[req.sessionID, Username, nowDate.toString(), expireDate.toString()],nowDate, expireDate, function(err) {
				if (err) {
				return console.log(err.message);
				}
				// get the last insert id
				console.log(`A row has been inserted with rowid ${this.lastID}`);
			});
			// close the database connection
			db.close();
		}
	});
}
//
// Save Session Data to SQLITE
//


//
// Database Session Cleanup
//
function cleanupSessionData(){

}
//
// END Database Session Cleanup
//


//
// Create SQLITE Session Store
//
function createSQLiteStore(){
	let db = new sqlite3.Database('sessionStore.db', (err) => {
		if (err) {
		  return console.error(err.message);
		}
		try {
			db.run('CREATE TABLE IF NOT EXISTS sessions(id text, username text, start int, expire int)');
			console.log('Created SQlite Session Store.');
		}
		catch {
			console.log('DID NOT Created SQlite Session Store.');
		}

	  });
	  
	  // close the database connection
	  db.close((err) => {
		if (err) {
		  return console.error(err.message);
		}
		console.log('Close the database connection.');
	  });
}
//
// Create SQLITE Session Store
//


//
// Once Per Start Execution
//
createSQLiteStore();
//
// END Once Per Start Execution
//