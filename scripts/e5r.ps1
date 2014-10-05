param(
    [parameter(Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$version = "sprint-1"

function Print-Usage {
@"
E5R Environment - Version $version
Copyright (c) 2014 E5R Development Team

Usage:
   e5r <command> [options]

"@ | Write-Host
}

Function Web-Exists([string] $url) {
    $wr = [System.Net.WebRequest]::Create($url)
    try {
        $res = $wr.GetResponse()
    } catch [System.Net.WebException] {
        $res = $_.Exception.Response
    }
    $statusCode = [int]$res.StatusCode
    if($statusCode -eq 200){
        return $true
    }
    return $false
}

if($args.length -lt 1) {
    Print-Usage
    Exit
}

$commandPath = [IO.Path]::GetFullPath("$PSScriptRoot\..\command")
$commandName = $args[0]
$commandFileName = "$commandName.ps1"
$commandFilePath = "$commandPath\$commandFileName"

if ((Test-Path $commandPath) -ne 1) {
    $outputSilent = New-Item -ItemType Directory -Force $commandPath
}

if ((Test-Path $commandFilePath) -ne 1) {
    $url ="https://raw.githubusercontent.com/e5r/env/$version/scripts/command/$commandFileName"
    if(Web-Exists $url) {
        Invoke-WebRequest $url -OutFile $commandFilePath
    }
}

if ((Test-Path $commandFilePath) -ne 1) {
    Write-Host "Command ""$commandName"" not found!"
    Exit
}

# TODO: Repassar argumentos do comando
Invoke-Expression -Command 'PowerShell "$commandFilePath"'