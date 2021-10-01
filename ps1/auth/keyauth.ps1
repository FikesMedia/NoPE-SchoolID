param (
    [string]$JSON
)

# Static Password
# Key Path
$CWD = Get-Location
$KeyDBJSON = Get-Content -Raw -Path "$CWD\ps1\auth\keyauth.json"
# Converto to Powershell Object
$KeyDB = $KeyDBJSON |ConvertFrom-Json
$StaticPassword = $KeyDB | Select-Object Password -ExpandProperty Password 

try {
    $Data = $JSON | convertFrom-JSON
} catch {
    $Data = "INVALID DATA SENT"
} 

# Check Data Input
if($Data.Password) {
    if($Data.Password -eq $StaticPassword) {
        $credentialState = "Valid"
    } else {
        $credentialState = "Invalid"
    }

    # Use Credential State
    if($credentialState -eq "Invalid"){
        $Return = New-Object PSObject -Property @{
            Credentials = "Invalid"
        }
    } elseif ($credentialState -eq "Valid") {
        $Return = New-Object PSObject -Property @{
            Credentials = "Valid"
        }
    }

} else {
    $Return = New-Object PSObject -Property @{
        Credentials = "Invalid"
    }
}

$ReturnJSON = $Return | ConvertTo-Json
Write-Host $ReturnJSON