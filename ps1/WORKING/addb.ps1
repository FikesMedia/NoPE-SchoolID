try {

	#$ValidAdmin = Get-ADPrincipalGroupMembership -Identity $Username | Where-Object {$_.name -eq "FMSSP Managers"} | Measure-Object | Select-Object -ExpandProperty Count
	
	#if($ValidAdmin -eq 1) {
		Get-ADUser  -Filter * | Where-Object { $_.Enabled -eq $True} | Select-Object SamAccountName | ConvertTo-JSON
	#}
}
catch {

}