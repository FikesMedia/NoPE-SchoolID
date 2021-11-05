# NoPE-SchoolID
School ID Badging solution with Clever QR integration all integrated into your existing Active Directory system. No duplicating information!

### Notible Features
- [x] Active Directory Integration
- [x] Clever QR Login Integration
- [x] Simple Setup and Usage
- [x] Use any printer!

### Upcoming Features
- [ ] Automatic handling of Clever ZIP exports (Currently a CLI tool)
- [ ] Layout Templates
- [ ] WebHooks for other integrations (Like Door Controls)

## Sponsors
Your name could be here! Sponsor the project, help out some schools and get your name in the README and in the sponsors section of the application. Advertise you support small local schools.  


# Installation

## Requirements
* Windows Server or Windows 10+ with RSAT Active Directory Powershell Module
* Internet Access if installing from source
* Node.js if installing from source
* Thats it!

## Installation Process from Source
* Clone or download ZIP of repository
* Extract to destination
* Run `npm install` from the directory
* Replace self signed certificates if desired.
* Install Service using the command  `.\NodeJS.exe .\ServiceInstall.js`
* Using `services.msc` change the `School ID` service to use an account with AD write access
* Restart the service

## Installation from MSI
* Coming soon



# Usage
Users must be part of a `BadgePrinters` Active Directory group to sign into the application. We don't anyone printing id's right? 

Sign into the https://URL of your server, and login with your normal AD credentials.

