param(
    [parameter(Position=0)]
    [string] $workdir = $null,
    [string] $lang = $null,
    [switch] $help = $false,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$repositoryVersion      = "master"
$workdir                = [IO.Path]::GetFullPath($workdir)
$e5rPath                = $env:USERPROFILE + "\.e5r"
$e5rBin                 = "$e5rPath\bin"
$e5rLang                = "$e5rPath\lang"
$langUrlTemplate        = "https://raw.githubusercontent.com/e5r/env/$repositoryVersion/scripts/lang/{LANG}/bootstrapper.ps1"
$langPathTemplate       = "$e5rLang\{LANG}"
$binPathTemplate        = "$e5rBin\e5r-{BIN}"
$postBootstrapper       = "$e5rPath\postbootstrapper.bat"
$repositoryUrl          = "https://github.com/e5r/env/archive/$repositoryVersion.zip"
$repositoryZip          = "$e5rPath\repository.zip"
$repositoryPath         = "$e5rPath\repository"
$repositoryScriptPath   = "$repositoryPath\env-$repositoryVersion\scripts"
$langRepositoryTemplate = "$repositoryPath\env-$repositoryVersion\scripts\lang\{LANG}\bootstrapper.ps1"
$extraParams            = '"' + [String]::join('" "', $args) + '"'
$langScriptPath         = $langPathTemplate -Replace "{LANG}", $lang
$langScriptFilePath     = "$langScriptPath\bootstrapper.ps1"
$langScriptUrl          = $langUrlTemplate -Replace "{LANG}", $lang
$langRepositoryPath     = $langRepositoryTemplate -Replace "{LANG}", $lang

Function Create-Path-Base() {
    $outputSilent = New-Item -ItemType Directory -Force $e5rPath
    $outputSilent = New-Item -ItemType Directory -Force $e5rBin
    $outputSilent = New-Item -ItemType Directory -Force $e5rLang
}

Function Web-Download([string]$url, [string]$path) {
    Write-Host "----> Downloading $url"
    Write-Host "      To: $path"
    Invoke-WebRequest $url -OutFile $path
}

Function Zip-Extract([string]$file, [string]$path) {
    try {
        $outputSilent = [System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem")
        $outputSilent = [System.IO.Compression.ZipFile]::ExtractToDirectory($file, $path)
    } catch [System.Exception] {
        $shell = New-Object -ComObject Shell.Application
        $zipPackage = $shell.NameSpace($file)
        $destinationFolder = $shell.NameSpace($path)
        $destinationFolder.CopyHere($zipPackage.Items())
    }
}

Function Get-Repository() {
    if ((Test-Path $repositoryPath) -ne 1) {
        Web-Download $repositoryUrl $repositoryZip
        $outputSilent = New-Item -ItemType Directory -Force $repositoryPath
        Zip-Extract $repositoryZip $repositoryPath
        $outputSilent = Remove-Item $repositoryZip -Force
    }
}

Function Clean-Repository() {
    if (Test-Path $repositoryPath) {
        $outputSilent = Remove-Item $repositoryPath -Recurse -Force
    }
}

Function Script-Install([string]$script, [string]$path) {
    $from = "$repositoryScriptPath\$script"
    $to = "$path"
    if(Test-Path $to) {
        Write-Host "----> Script $script already installed."
    }else{
        Write-Host "----> Script-Install $script"
        Write-Host "      From: $from"
        Write-Host "      To: $to"
        Get-Repository
        $outputSilent = Copy-Item $from $to
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

Script-Install "help.bat" "$e5rBin\help.bat"
Script-Install "help.ps1" "$e5rBin\help.ps1"

if((Test-Path $langScriptFilePath) -ne 1) {
    Get-Repository
    $scriptExists = Test-Path $langRepositoryPath
    if($scriptExists -eq $false) {
        Write-Host "----> Bootstrapper script for lang '$lang' not found!"
        Write-Host "      URL Request: $langScriptUrl"
        Exit
    }
    $outputSilent = New-Item -ItemType Directory -Force $langScriptPath
    $outputSilent = Copy-Item $langRepositoryPath $langScriptFilePath
}

Clean-Repository
Update-Environment-Variables
Invoke-Expression -Command 'PowerShell "$langScriptFilePath" $extraParams'
