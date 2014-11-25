param(
    [string] $repository = $null,
    [switch] $noWait = $false,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$e5rPath              = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$e5rVersion           = Get-E5RVersion
$e5rBin               = "$e5rPath\bin"
$e5rLib               = "$e5rPath\lib"
$postSetup            = "$e5rPath\postsetup.cmd"

Write-Host "Installing E5R Environment $e5rVersion..."
Write-Host "  from $repository`n" -ForegroundColor DarkGray

$outputSilent = New-Item -ItemType Directory -Force $e5rBin
$outputSilent = New-Item -ItemType Directory -Force $e5rLib

try {
    Get-WebFile "$repository/scripts/e5r.cmd" "$e5rBin\e5r.cmd" "Getting `"e5r.cmd`"..."
    Get-WebFile "$repository/scripts/e5r.ps1" "$e5rBin\e5r.ps1" "Getting `"e5r.ps1`"..."
    Get-WebFile "$repository/scripts/common.ps1" "$e5rLib\common.ps1" "Getting `"common.ps1`"..."
}catch [Exception]{
    Write-Host "----> " -NoNewLine -ForegroundColor DarkRed
    Write-Host "E5R Install Error!" -ForegroundColor Red
    Write-Host "      >> " -NoNewLine -ForegroundColor Red
    Write-Host $_ -ForegroundColor DarkRed

    if(!$noWait) {
        Start-Sleep -s 5
    }
    Exit 1
}

Update-EnvironmentVariables `
    -Name "PATH"  `
    -AddValue $e5rBin  `
    -PrefixRemove $e5rPath `
    -showMessage "Adding `"$e5rBin`" to PATH..."

Write-Host ""
Write-Host "----> E5R Environment successfully installed!" -ForegroundColor Green

if(!$noWait){
    Start-Sleep -s 5
}
