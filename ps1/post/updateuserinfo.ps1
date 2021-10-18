param (
    [string]$JSON
)	

try {
    $Data = $JSON | convertFrom-JSON

     $username = $Data.username
     $title = $Data.title
     $employeeid = $Data.employeeid
     $pager = $Data.pager


    Set-ADUser -Identity $username -Title $title -EmployeeID $employeeid -Replace @{Pager=$pager}
    
    $ReturnMessage = [PSCustomObject]@{
        "Status" = "Complete"
    }

    $ReturnMessage | ConvertTo-Json
}
catch {
    
    $Data = "INVALID DATA SENT"

}