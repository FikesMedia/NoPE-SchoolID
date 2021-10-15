param (
    [string]$JSON
)	


try {
    $Data = $JSON | convertFrom-JSON
    $ThisLocation = Get-Location

    $filename =  (Get-Item $ThisLocation).FullName + "\www\assets\photos\" + $Data.employeeid + ".jpg"

    Remove-Item -Path $filename -Force

    $ReturnMessage = [PSCustomObject]@{
        "Message" = "Image Removed"
    }

    $ReturnMessage | ConvertTo-Json


}
catch {
    $Data = "INVALID DATA SENT"
}