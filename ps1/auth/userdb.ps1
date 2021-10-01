
param (
    [string]$JSON
)


try {
    $Data = $JSON | convertFrom-JSON
} catch {
    $Data = "INVALID DATA SENT"
} 

# JSON User Database
# Database Path
$CWD = Get-Location
$UserDBJSON = Get-Content -Raw -Path "$CWD\ps1\auth\userdb.json"
# Converto to Powershell Object
$UserDBPSO = $UserDBJSON | ConvertFrom-Json

# Check Data Input
if($Data.Username -And $Data.Password ) {
    if(($UserDBPSO | Select-Object | Where-Object {$_.Username -eq $Data.Username -and $_.Password -eq $Data.Password} | Measure-Object | Select-Object Count -ExpandProperty Count) -eq 1) {
        $Return = New-Object PSObject -Property @{
            Credentials = "Valid"
        }
    } else {
        $Return = New-Object PSObject -Property @{
            Credentials = "Invalid"
        }
    }
} else {
    $Return = New-Object PSObject -Property @{
        Credentials = "Invalid"
    }
}
$ReturnJSON = $Return | ConvertTo-Json
Write-Host $ReturnJSON



