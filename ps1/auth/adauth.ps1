param (
    [string]$JSON
)

function Test-ADCrential {
    [CmdletBinding()]
    param(
        [pscredential]$Credential
    )
     
    try {
        Add-Type -AssemblyName System.DirectoryServices.AccountManagement
        if(!$Credential) {
            $Credential = Get-Credential -EA Stop
        }
        if($Credential.username.split("\").count -ne 2) {
            return "Invalid"
            #throw "You haven't entered credentials in DOMAIN\USERNAME format. Given value : $($Credential.Username)"
        }
     
        $DomainName = $Credential.username.Split("\")[0]
        $UserName = $Credential.username.Split("\")[1]
        $Password = $Credential.GetNetworkCredential().Password
     
        $PC = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain, $DomainName)
        if($PC.ValidateCredentials($UserName,$Password)) {
            return "Valid"
        } else {
            return "Invalid"
        }
    } catch {
        return "Invalid"
    }
}

# Convert JSON to PSObject
try {
    $Data = $JSON | convertFrom-JSON
} catch {
    $Data = "INVALID DATA SENT"
} 

# Check Data Input
if($Data.Username -And $Data.Password ) {
    
    # Gracefully fail for non domain joined machines
    try {
        # Structure Data for Check
        $DomainName = Get-ADDomain | Select-Object -ExpandProperty NetBiosName
        $Username = $DomainName+"\"+$Data.Username
        $Password = $Data.password

        [System.Security.SecureString]$SecPwd = ConvertTo-SecureString -String $Password -AsPlainText -Force 
        $Credential = New-Object -typename System.Management.Automation.PSCredential -argumentlist @($Username,$SecPwd)

        # Get Credential State
        try {
            $credentialState = Test-ADCrential $Credential
        }
        catch {
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
    }
    catch {
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




