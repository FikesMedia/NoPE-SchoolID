param (
    [string]$JSON
)


try {
    $Data = $JSON | convertFrom-JSON
} catch {
    $Data = "INVALID DATA SENT"
} 

Write-Host "This is the sent JSON. " $JSON

Write-Host $Data