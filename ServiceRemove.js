const Service = require('node-windows').Service;
const fs = require('fs');

// Configuration
const configFile = fs.readFileSync(process.cwd()+"\\config.json");
const config = JSON.parse(configFile);

var ServicePath = process.cwd()+"\\index.js";

// Create a new service object
var svc = new Service({
  name:config.ApplicationName,
  description: config.Description,
  script: ServicePath
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();