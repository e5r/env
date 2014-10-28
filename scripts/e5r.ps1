param(
    [array]
    [parameter(ValueFromRemainingArguments=$true)]
    $args=@()
)

$version              = "sprint-1"
$e5rPath              = "$env:UserProfile\.e5r"
# $maxDownloadRequest   = 5
# $timeoutDownload      = 30000
# $sleepAttemptDownload = 5000

Import-Module -Name "$e5rPath\lib\common.ps1"

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

# Function Web-Download([string]$url, [string]$path, $requestNum = 1) {
#     if($requestNum -gt 1){
#         Write-Host "----> Downloading(attempt $requestNum) $url"
#     }else{
#         Write-Host "----> Downloading $url"
#     }
#     Write-Host "      To: $path"
#     try {
#         $webRequest = [System.Net.WebRequest]::Create($url)
#         $webRequest.Timeout = $timeoutDownload
#         #$webRequest.Headers.Add("UserAgent", "E5R Environment version 1.0")
#         [System.Net.WebResponse]$webResponse = $webRequest.GetResponse()
#         [System.IO.Stream]$webStream = $webResponse.GetResponseStream()
#         [System.IO.FileStream]$fileStream = [System.IO.File]::Create($path)
#         $webStream.CopyTo($fileStream)
#         $fileStream.Close()
#         $webStream.Close()
#         $webResponse.Close()
#     } catch [System.Exception] {
#         if($requestNum -ge $maxDownloadRequest){
#             throw $_
#         }
#         $requestNum++
#         Write-Host "----> Download error for $url"
#         Write-Host "      >> Retrying in 5 seconds ($requestNum of $maxDownloadRequest attempts)..."
#         Start-Sleep -m $sleepAttemptDownload
#         Web-Download $url $path $requestNum
#     }
# }

# Function Web-Exists([string] $url) {
#     $wr = [System.Net.WebRequest]::Create($url)
#     try {
#         $res = $wr.GetResponse()
#     } catch [System.Net.WebException] {
#         $res = $_.Exception.Response
#     }
#     $statusCode = [int]$res.StatusCode
#     if($statusCode -eq 200){
#         return $true
#     }
#     return $false
# }

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
    $url ="https://raw.githubusercontent.com/e5r/env/$version/scripts/command/$commandFileName"
    if(Test-WebFile $url) {
        Get-WebFile $url $commandFilePath
    }
}

if ((Test-Path $commandFilePath) -ne 1) {
    Write-Host "Command ""$commandName"" not found!"
    Exit
}

Invoke-Expression "& `"$commandFilePath`" $args"
