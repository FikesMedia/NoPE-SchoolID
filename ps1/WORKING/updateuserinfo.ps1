param (
    [string]$username,
    [string]$title,
    [string]$employeeid,
    [string]$pager
)	

try {
    Set-ADUser -Identity $username -Title $title -EmployeeID $employeeid -Replace @{Pager=$pager}
    Write-Host '{"Status": "Complete"}'
}
catch {
    Write-Host '{"Status": "Error"}'
}
