#
#Clever Badge Processing 
#

#Here
$ThisLocation = Get-Location

#Extract ZIP
Expand-Archive .\badges.zip

#Specify Location for Processing
$BadgeLocation = (Get-Item $ThisLocation).FullName + "\badges" 

#Loop through Folders
$AllFolders = Get-ChildItem -Recurse $BadgeLocation | Where-Object { $_.PSIsContainer }
forEach($Folder in $AllFolders) {
    #Loop Through Images
    $Items = Get-ChildItem -Path $Folder.FullName -Include *.png -Depth 1 | Where-Object { ! $_.PSIsContainer }
    forEach($Item in $Items){
        # 6 Digit Number 
        $NewName = $Item.Name.Substring(($Item.Name.Length) - 10, 10)
        #Destination Full Path
        $Destination = (Get-Item $ThisLocation).FullName + "\clever\" + $NewName
        #Move Image
        Move-Item -Path $Item.FullName -Destination $Destination -Force
    }
}
