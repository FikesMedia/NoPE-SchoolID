//console.log("Current Directory "+process.cwd());
const shell = require('node-powershell');


let ps = new shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

//Overlay
document.getElementById("overlay").style.display = "block";

//Groups DB
let ps1 = new shell({
	executionPolicy: 'Bypass',
	noProfile: true
});
ps1.addCommand(process.cwd()+'\\www\\assets\\ps1\\adgroupdb.ps1')
ps1.invoke()
.then(output => {
	//console.log("Creating Group Database");
	//console.log(output);
	var UserDB = JSON.parse(output);
	$("#searchgroup").easyAutocomplete(
		{
			data: UserDB,
			getValue: "Name",
			requestDelay: 100,
			list: {
				maxNumberOfElements: 15,
				onLoadEvent: function(){
					document.getElementById('printBTN').setAttribute("disabled", "");
				},
				onClickEvent: function() {
					//SubmitSearchForm();
					//console.log("Submitting");
					var GroupSubmit = document.getElementById("searchgroup").value;
					//console.log(GroupSubmit);
					GetGroupInformation(GroupSubmit);
				},
				match: {
					enabled: true
				}
			}
		}
	);
	document.getElementById("overlay").style.display = "none";

})
.catch(err => {
	console.log("Failed Creating DB");
  	console.log(err);
  	ps1.dispose();
});


function GetGroupInformation(Group) {
	//Default Settings
	const fs = require('fs'); 
	const defaultsFile = fs.readFileSync(process.cwd()+'\\www\\defaults.json');
	var defaults = JSON.parse(defaultsFile);


	
	ps.addCommand(process.cwd()+'\\www\\assets\\ps1\\groupmembers.ps1 -groupname ' + "\"" + Group + "\"" )
	ps.invoke()
	.then(output => {
	  //console.log(output);
		var groupJSON = JSON.parse(output);
		var groupEntries = Object.keys(groupJSON).length;
		// for(var i = 0; i < groupEntries; i++) {
		// 	console.log( "Count is at "+ i);
		// }
		document.getElementById("entriestxt").value = groupEntries;
		//console.log(output);

		//createGroupSet(output,"pdfBadge");
		

		// async function DrawPDF(output) {
		// 	var pdfDoc = await createGroupSet(output,"pdfBadge");
		// 	document.getElementById("#pdfBadge").src = pdfDataUri;
		//  }
		// DrawPDF();

		/*
		;(async () => {
			
			document.getElementById("pdfBadge").src = pdfDataUri;
		})()
		*/

		async function getData(callback){
			console.log("Getting Data");
			const pdfDataUri = await createGroupSet(output,"pdfBadge");
			callback(pdfDataUri);
		}

		async function useData(DataURI){
			console.log("Using Data " + DataURI);
			document.getElementById("pdfBadge").src = DataURI;
			document.getElementById('printBTN').removeAttribute("disabled");
		}

		getData(useData);

		
		
	})
	.catch(err => {
	  console.log(err);
	  ps.dispose();
	});
}