param(
    [array]
    [parameter(ValueFromRemainingArguments=$true)]
    $args=@()
)

$version = "sprint-1"

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

$commandName, $args = $args
$commandPath = [System.IO.Path]::GetDirectoryName($MyInvocation.InvocationName)
$commandPath = [System.IO.Path]::GetFullPath("$commandPath\..\command")
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

Invoke-Expression "& `"$commandFilePath`" $args"