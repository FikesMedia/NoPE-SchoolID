try {

	#$ValidAdmin = Get-ADPrincipalGroupMembership -Identity $Username | Where-Object {$_.name -eq "FMSSP Managers"} | Measure-Object | Select-Object -ExpandProperty Count
	
	#if($ValidAdmin -eq 1) {
		Get-ADGroup -filter '*'  | Select-Object Name | ConvertTo-JSON
	#}
}
catch {

}