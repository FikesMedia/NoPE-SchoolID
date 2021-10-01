param (
    [string]$groupname
)	

#$Members = Get-ADGroupMember -Identity $groupname | Where-Object { $_.objectClass -eq "user" } | Select-Object samAccountName
#$MemberList = ForEach($Member in $Members) {
#    Get-ADUser -Identity $Member.samAccountName -Properties title,department,company,mail,pager,employeeid,givenname,surname | Select-Object givenname,surname,title,department,company,mail,employeeid,pager
#} 

$MemberList = Get-ADGroupMember -Identity $groupname | Where-Object { $_.objectClass -eq "user" } | Get-ADUser -Properties title,department,company,mail,pager,employeeid | Select-Object givenname,surname,title,department,company,mail,employeeid,pager


$MemberList | ConvertTo-JSON