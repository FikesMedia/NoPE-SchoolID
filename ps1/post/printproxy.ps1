param (
    [string]$JSON
)	


try {
    $Data = $JSON | convertFrom-JSON
    $ThisLocation = Get-Location
    $Defaults = Get-Content ((Get-Item $ThisLocation).FullName + "\www\defaults.json") | ConvertFrom-Json

    $b64 = $Data.base64pdf
    $b64 = $b64.Substring($b64.IndexOf(",")+1)

    $tmpStorage = "$(Get-Random).jpg"

    $filename =  (Get-Item $ThisLocation).FullName + "\clitools\tmp\" + $tmpStorage


    $bytes = [Convert]::FromBase64String($b64)
    [IO.File]::WriteAllBytes($filename, $bytes)

    # Send to Printer
    $printCMD = (Get-Item $ThisLocation).FullName + "\clitools\PDFtoPrinter.exe"
    Start-Process -FilePath $printCMD -ArgumentList "$($filename) `"$($Defaults.PrinterName)`""

    $ReturnMessage = [PSCustomObject]@{
        "Message" = "Card Printed"
    }

    $ReturnMessage | ConvertTo-Json


}
catch {
    $Data = "INVALID DATA SENT"
}