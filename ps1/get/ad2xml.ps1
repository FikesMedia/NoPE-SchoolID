if($false){
	"No Access"
} #else {

   # try {

    #    $ValidAdmin = Get-ADPrincipalGroupMembership -Identity $env:UserName | Where-Object {$_.name -eq "Domain Admins"} | Measure-Object | Select-Object -ExpandProperty Count
        
     #   if($ValidAdmin -eq 1) {
            Get-ADUser  -Filter * -Properties EmployeeID | Where-Object { $_.Enabled -eq $True} | Select-Object SamAccountName, Name, EmployeeID  | ConvertTo-JSON
            #Get-ADUser  -Identity cfikes -Properties EmployeeID| Where-Object { $_.Enabled -eq $True} | Select-Object SamAccountName, Name, EmployeeID  | ConvertTo-JSON
      #  } else {
		#	"Not an Admin"
		#	}
    #}
    #catch {
#		"Failed to Run"
 #   }
#}