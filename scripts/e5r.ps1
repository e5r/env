param(
    [array]
    [parameter(ValueFromRemainingArguments=$true)]
    $args=@()
)

$e5rPath              = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$version              = Get-E5RVersion
$commandBaseUrl       = "https://raw.githubusercontent.com/e5r/env/$version/scripts/command"


for($count = 0; $count -lt $args.length; $count++) {
    $value = $args[$count]
    if($value.contains(" ")) {
        $value = $value.replace("`"", "```"")
        $value = "`"$value`""
    }
    $args[$count] = $value
}

function Print-Usage {
@"
E5R Environment - Version $version
Copyright (c) 2014 E5R Development Team

Usage:
   e5r <command> [options]

"@ | Write-Host
}

if($args.length -lt 1) {
    Print-Usage
    Exit
}

$commandName, $args = $args
$commandPath = "$e5rPath\command"
$commandFileName = "$commandName.ps1"
$commandFilePath = "$commandPath\$commandFileName"

if ((Test-Path $commandPath) -ne 1) {
    $outputSilent = New-Item -ItemType Directory -Force $commandPath
}

if ((Test-Path $commandFilePath) -ne 1) {
    $url ="$commandBaseUrl/$commandFileName"
    if(Test-WebFile $url) {
        Get-WebFile $url $commandFilePath "Getting remote command `"$commandName`"..."
    }
}

if ((Test-Path $commandFilePath) -ne 1) {
    Write-Host "Command ""$commandName"" not found!"
    Exit
}

Invoke-Expression "& `"$commandFilePath`" $args"
