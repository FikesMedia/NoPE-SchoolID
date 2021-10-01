param (
    [string]$JSON
)

$Data = $JSON | convertFrom-JSON 
Write-Host "This is the sent DATA. " $JSON

Write-Host $Data