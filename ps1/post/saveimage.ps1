param (
    [string]$JSON
)	


try {
    $Data = $JSON | convertFrom-JSON
    $ThisLocation = Get-Location

    $b64 = $Data.base64photo
    $b64 = $b64.Substring($b64.IndexOf(",")+1)
    $filename =  (Get-Item $ThisLocation).FullName + "\www\assets\photos\" + $Data.employeeid + ".jpg"


    $bytes = [Convert]::FromBase64String($b64)
    [IO.File]::WriteAllBytes($filename, $bytes)

    $ReturnMessage = [PSCustomObject]@{
        "Message" = "Image Saved"
    }

    $ReturnMessage | ConvertTo-Json


}
catch {
    $Data = "INVALID DATA SENT"
}