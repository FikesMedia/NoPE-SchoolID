param (
    [string]$JSON
)	

try {
    $Data = $JSON | convertFrom-JSON    
    Get-ADUser -Identity $Data.searchUsername -Properties title,department,company,mail,pager,employeeid,givenname,surname | Select-Object givenname,surname,title,department,company,mail,employeeid,pager | ConvertTo-Json
} catch {
    $Data = "INVALID DATA SENT"
} 