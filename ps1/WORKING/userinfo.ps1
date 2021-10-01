param (
    [string]$username
)	

Get-ADUser -Identity $username -Properties title,department,company,mail,pager,employeeid,givenname,surname | Select-Object givenname,surname,title,department,company,mail,employeeid,pager | ConvertTo-Json