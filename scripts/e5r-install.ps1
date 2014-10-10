$repositoryVersion      = "sprint-1"
$e5rPath                = $env:USERPROFILE + "\.e5r"
$e5rBin                 = "$e5rPath\bin"
$postSetup              = "$e5rPath\postsetup.bat"
$repositoryUrl          = "https://github.com/e5r/env/archive/$repositoryVersion.zip"
$repositoryZip          = "$e5rPath\repository.zip"
$repositoryPath         = "$e5rPath\repository"
$repositoryScriptPath   = "$repositoryPath\env-$repositoryVersion\scripts"

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

Function Update-Environment-Variables() {
    $path = [Environment]::GetEnvironmentVariable("Path", "User")
    $contains = $false
    if($path -ne $null) {
        $contains = $path.ToLower().Contains($e5rBin.ToLower())
    }
    if(!$contains) {
        if($path -ne $null) {
            $path += ";"
        }
        $path += $e5rBin
        if($env:Path -ne $null) {
            $env:Path += ";"
        }
        $env:Path += $e5rBin
        $command = "set PATH=%PATH%;$e5rBin"
        $outputSilent = New-Item -ItemType File -Force $postSetup -Value $command
        [Environment]::SetEnvironmentVariable("Path", $path, "User")
    }
}

$outputSilent = New-Item -ItemType Directory -Force $e5rBin

Get-Repository
$outputSilent = Copy-Item "$repositoryScriptPath\e5r.bat" "$e5rBin\e5r.bat"
$outputSilent = Copy-Item "$repositoryScriptPath\e5r.ps1" "$e5rBin\e5r.ps1"

Clean-Repository
Update-Environment-Variables
