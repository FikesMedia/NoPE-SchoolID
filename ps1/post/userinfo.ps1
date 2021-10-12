param (
    [string]$JSON
)	

try {
    $Data = $JSON | convertFrom-JSON
    
    #Load Defaults
    $ThisLocation = Get-Location
    $Defaults = Get-Content ((Get-Item $ThisLocation).FullName + "\www\defaults.json") | ConvertFrom-Json
    
    
    #Get User Information
    $searchUser = $Data.searchUsername
    $User = Get-ADUser -Identity $searchUser -Properties title,department,company,mail,pager,employeeid,givenname,surname

    #Correct Null Information with Defaults
    if($null -eq $User.givenname) {
        $User.givenname = $Defaults.FirstName
    }
    if($null -eq $User.surname) {
        $User.surname = $Defaults.LastName
    }
    if($null -eq $User.company) {
        $User.company = $Defaults.Company
    }
    if($null -eq $User.title) {
        $User.title = $Defaults.Title
    }
    if($null -eq $User.employeeid) {
        $User.employeeid = $Defaults.EmpID
    }
    if($null -eq $User.pager) {
        $User.pager = $Defaults.BadgeID
    }

    #Check for photo and return path
    $PhotoPath = (Get-Item $ThisLocation).FullName + "\www\assets\photos\" + $User.employeeid + ".jpg"
    if(Test-Path -Path $PhotoPath -PathType Leaf){
       $UserPhoto = $User.employeeid + ".jpg"
    } else {
       $UserPhoto = $Defaults.BadgePhoto
    }

    $User | Add-Member -MemberType NoteProperty -Name badgephoto -Value $UserPhoto -Force
    $User | Select-Object givenname,surname,title,department,company,mail,employeeid,pager,badgephoto | ConvertTo-Json
    

} catch {
    $Data = "INVALID DATA SENT"
} 