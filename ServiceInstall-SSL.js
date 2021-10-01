const Service = require('node-windows').Service;
const fs = require('fs');

// Configuration
const configFile = fs.readFileSync(process.cwd()+"\\config.json");
const config = JSON.parse(configFile);

var ServicePath = process.cwd()+"\\index-ssl.js";

// Create a new service object
var svc = new Service({
  name:config.ApplicationName,
  description: config.Description,
  script: ServicePath
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();