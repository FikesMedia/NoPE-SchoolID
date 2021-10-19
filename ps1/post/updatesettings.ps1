param (
    [string]$JSON
)	


try {
    $ThisLocation = Get-Location

    $Data = $JSON | ConvertFrom-Json
    


    #Create Save Object
    $NewSettings = New-Object -TypeName PSObject
    $NewSettings | Add-Member -MemberType NoteProperty -Name "Company" -Value $Data.Company
    $NewSettings | Add-Member -MemberType NoteProperty -Name "Title" -Value $Data.Title
    $NewSettings | Add-Member -MemberType NoteProperty -Name "EmpID" -Value $Data.EmpID
    $NewSettings | Add-Member -MemberType NoteProperty -Name "BadgeID" -Value $Data.BadgeID
    $NewSettings | Add-Member -MemberType NoteProperty -Name "BadgePhoto" -Value "_Default.jpg"
    $NewSettings | Add-Member -MemberType NoteProperty -Name "FirstName" -Value $Data.FirstName
    $NewSettings | Add-Member -MemberType NoteProperty -Name "LastName" -Value $Data.LastName
    $NewSettings | Add-Member -MemberType NoteProperty -Name "BGColor" -Value $Data.BGColor
    $NewSettings | Add-Member -MemberType NoteProperty -Name "TitleColor" -Value $Data.TitleColor
    $NewSettings | Add-Member -MemberType NoteProperty -Name "TXTColor" -Value $Data.TXTColor
    $NewSettings | Add-Member -MemberType NoteProperty -Name "base64photo" -Value $Data.base64photo


    #Saving Photo if Photo Sent
    $b64 = $NewSettings.base64photo
    if (![string]::IsNullOrEmpty($b64)) {
        $b64 = $b64.Substring($b64.IndexOf(",")+1)
        $filename =  (Get-Item $ThisLocation).FullName + "\www\assets\photos\_Default.jpg"
        $bytes = [Convert]::FromBase64String($b64)
        [IO.File]::WriteAllBytes($filename, $bytes)
    }

    #
    $NewSettings | Select-Object -Property * -ExcludeProperty base64photo | ConvertTo-Json | Out-File "www\defaults.json"
    
    $ReturnMessage = [PSCustomObject]@{
        "Message" = "Settings Saved"
    }

    $ReturnMessage | ConvertTo-Json


}
catch {
    $Data = "INVALID DATA SENT"
}