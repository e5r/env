param(
    [parameter(Position=0)]
    [string] $workdir = $null,
    [string] $lang = $null,
    [switch] $help = $false,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$workdir          = [IO.Path]::GetFullPath($workdir)
$e5rPath          = $env:USERPROFILE + "\.e5r"
$e5rBin           = "$e5rPath\bin"
$e5rLang          = "$e5rPath\lang"
$langUrlTemplate  = "https://raw.githubusercontent.com/e5r/env/master/scripts/lang/{LANG}/bootstrapper.ps1"
$langPathTemplate = "$e5rLang\{LANG}"
$binUrlTemplate   = "https://raw.githubusercontent.com/e5r/env/master/scripts/{BIN}"
$binPathTemplate  = "$e5rBin\e5r-{BIN}"
$postBootstrapper = "$e5rPath\postbootstrapper.bat"
$extraParams      = '"' + [String]::join('" "', $args) + '"'

Function Create-Path-Base() {
    $outputSilent = New-Item -ItemType Directory -Force $e5rPath
    $outputSilent = New-Item -ItemType Directory -Force $e5rBin
    $outputSilent = New-Item -ItemType Directory -Force $e5rLang
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

Function Web-Download([string]$url, [string]$path) {
    Invoke-WebRequest $url -OutFile $path
}

Function Web-Install-Binary([string]$bin) {
    $binaryUrl = $binUrlTemplate -Replace "{BIN}", $bin
    $binaryPath = $binPathTemplate -Replace "{BIN}", $bin
    if((Test-Path $binaryPath) -ne 1) {
        $webExists = Web-Exists($binaryUrl)
        if($webExists -eq $false) {
            Write-Host "----> Web binary '$bin' not found!"
            Write-Host "      URL Request: $binaryUrl"
        }
        Web-Download $binaryUrl $binaryPath
    }
}

Function Update-Environment-Variables() {
    $path = [Environment]::GetEnvironmentVariable("Path", "User")
    $contains = $path.ToLower().Contains($e5rBin.ToLower())
    if(!$contains) {
        $path += ";" + $e5rBin
        $env:Path += ";" + $e5rBin
        $command = "set PATH=%PATH%;$e5rBin"
        $outputSilent = New-Item -ItemType File -Force $postBootstrapper -Value $command
        [Environment]::SetEnvironmentVariable("Path", $path, "User")
    }
}

Function Print-Usage() {
@"
E5R Environment bootstrapper

USAGE: e5r-bootstrapper [-workdir c:\you\work\directory] -lang dotnet|php|node|python|ruby
"@ | Write-Host
}

if ($help -or !$lang) {
    Print-Usage
    Exit
}

Create-Path-Base
Update-Environment-Variables
Web-Install-Binary "help.bat"
Web-Install-Binary "help.ps1"

$langScriptPath = $langPathTemplate -Replace "{LANG}", $lang
$langScriptFilePath = "$langScriptPath\bootstrapper.ps1"
$langScriptUrl = $langUrlTemplate -Replace "{LANG}", $lang

if((Test-Path $langScriptFilePath) -ne 1) {
    $webExists = Web-Exists($langScriptUrl)
    if($webExists -eq $false) {
        Write-Host "----> Bootstrapper script for lang '$lang' not found!"
        Write-Host "      URL Request: $langScriptUrl"
        Exit
    }
    $outputSilent = New-Item -ItemType Directory -Force $langScriptPath
    Web-Download $langScriptUrl $langScriptFilePath
}

Invoke-Expression -Command 'PowerShell "$langScriptFilePath" $extraParams'
