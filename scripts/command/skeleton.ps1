param(
    [string] $workdir = $null,
    [string] $lang = $null,
    [string] $license = $null,
    [switch] $init = $false,
    [switch] $help = $false,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$version              = "sprint-1"
$e5rPath              = "$env:UserProfile\.e5r"
$skeletonBasePath     = "$e5rPath\resources\skeleton"
$skeletonBaseUrl      = "https://raw.githubusercontent.com/e5r/env/$version/resources/skeleton"
$licenseBasePath      = "$e5rPath\resources\license"
$licenseBaseUrl       = "https://raw.githubusercontent.com/e5r/env/$version/resources/license"
$maxDownloadRequest   = 5
$timeoutDownload      = 30000
$sleepAttemptDownload = 5000

Function Web-Download([string]$url, [string]$path, $requestNum = 1) {
    if($requestNum -gt 1){
        Write-Host "----> Downloading(attempt $requestNum) $url"
    }else{
        Write-Host "----> Downloading $url"
    }
    Write-Host "      To: $path"
    try {
        $webRequest = [System.Net.WebRequest]::Create($url)
        $webRequest.Timeout = $timeoutDownload
        #$webRequest.Headers.Add("UserAgent", "E5R Environment version 1.0")
        [System.Net.WebResponse]$webResponse = $webRequest.GetResponse()
        [System.IO.Stream]$webStream = $webResponse.GetResponseStream()
        [System.IO.FileStream]$fileStream = [System.IO.File]::Create($path)
        $webStream.CopyTo($fileStream)
        $fileStream.Close()
        $webStream.Close()
        $webResponse.Close()
    } catch [System.Exception] {
        if($requestNum -ge $maxDownloadRequest){
            throw $_
        }
        $requestNum++
        Write-Host "----> Download error for $url"
        Write-Host "      >> Retrying in 5 seconds ($requestNum of $maxDownloadRequest attempts)..."
        Start-Sleep -m $sleepAttemptDownload
        Web-Download $url $path $requestNum
    }
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

Function Make-WebResource([string] $urlBase, [string] $resourceName, [string] $pathBase) {
    $resourceUrl = "$urlBase/$resourceName"
    $resourceFilePath = "$pathBase\$resourceName"
    if(!(Web-Exists $resourceUrl)) {
        Write-Host "----> Web resource $resourceName not found!"
        Write-Host "      URL: $resourceUrl"
        Exit
    }
    if(!(Test-Path $pathBase)) {
        $outputSilent = New-Item -ItemType Directory -Path $pathBase
    }
    try {
        Web-Download $resourceUrl $resourceFilePath
    }catch [Exception] {
        Write-Host "----> Download failed!"
        Write-Host "      URL: $resourceUrl"
        $outputSilent = Remove-Item $pathBase -Recurse -Force
        Exit
    }
    $lineNumber = 0
    foreach ($line in (Get-Content $resourceFilePath))
    {
        $lineNumber += 1
        $line = "$line".Trim()

        if($line.length -lt 1 -or $line[0] -eq "#") {
            continue
        }

        if($line.length -gt 1 -and $line[1] -eq ":" -and $line[0] -eq "d") {
            $directory = $line.Substring(2)
            $outputSilent = New-Item -ItemType Directory -Path "$pathBase\$directory"
            continue
        }

        if($line.length -gt 1 -and $line[1] -eq ":" -and $line[0] -eq "f") {
            $parts = $line.Substring(2).Split(":")
            if($parts.length -ne 2) {
                Write-Host "Syntax error in web resource file [$resourceName]" -ForegroundColor Red
                Write-Host "  URL: " -NoNewLine -ForegroundColor DarkRed
                Write-Host "$resourceUrl"  -ForegroundColor DarkGray
                Write-Host "  Line $lineNumber`: " -NoNewLine -ForegroundColor DarkRed
                Write-Host "$line" -ForegroundColor DarkGray
                $outputSilent = Remove-Item $pathBase -Recurse -Force
                Exit
            }
            $fileUrl = "$urlBase/" + $parts[1]
            $filePath = "$pathBase\" + $parts[0]
            $filePathBase = [System.IO.Path]::GetDirectoryName($filePath)
            if(!(Test-Path $filePathBase)) {
                $outputSilent = New-Item -ItemType Directory -Path $filePathBase
            }
            if(!(Web-Exists $fileUrl)) {
                Write-Host "Web resource not found!" -ForegroundColor Red
                Write-Host "  URL: " -NoNewLine -ForegroundColor DarkRed
                Write-Host "$fileUrl"  -ForegroundColor DarkGray
                $outputSilent = Remove-Item $pathBase -Recurse -Force
                Exit
            }
            Web-Download $fileUrl $filePath
            continue
        }

        Write-Host "Syntax error in web resource file [$resourceName]" -ForegroundColor Red
        Write-Host "  URL: " -NoNewLine -ForegroundColor DarkRed
        Write-Host "$resourceUrl"  -ForegroundColor DarkGray
        Write-Host "  Line $lineNumber`: " -NoNewLine -ForegroundColor DarkRed
        Write-Host "$line" -ForegroundColor DarkGray
        $outputSilent = Remove-Item $pathBase -Recurse -Force
        Exit
    }
    $outputSilent = Remove-Item $resourceFilePath
}

Function Copy-Skeleton([string] $skeleton, [string] $toPath) {
    $fromPath = "$skeletonBasePath\$skeleton"
    $outputSilent = Copy-Item "$fromPath\*" $toPath -Recurse -Force
}

if([String]::IsNullOrEmpty($workdir)) {
    $workdir = Get-Location
}

if($workdir[0] -eq '$') {
    $e5rHome = $env:UserProfile
    if($env:E5R_HOME -ne $null) {
        $e5rHome = $env:E5R_HOME
    }
    $workdir = $workdir.Replace('$', $e5rHome)
}

$workdir = [System.IO.Path]::GetFullPath($workdir)

Function Run-Usage() {
@"
E5R Skeleton Command

Usage:
  e5r skeleton [options]
"@ | Write-Host
}

Function Run-Help () {
@"
E5R Skeleton Command Help
  
  ???
"@ | Write-Host
}

Function Run-Init() {
    if(!$lang) {
        Write-Host "E5R Skeleton Command requires -lang parameter." -ForegroundColor Red
        Write-Host

        Run-Usage
        Exit
    }

    if ((Get-ChildItem $workdir).count -gt 0) {
        Write-Host "Not empty directories can not be initialized." -ForegroundColor Red
        Exit
    }

    $skeletonCommon = "$skeletonBasePath\common"
    $skeletonLang   = "$skeletonBasePath\$lang"

    if(!(Test-Path $skeletonCommon)) {
        Make-WebResource $skeletonBaseUrl "common.wres" $skeletonCommon
    }
    if(!(Test-Path $skeletonLang)) {
        Make-WebResource $skeletonBaseUrl "$lang.wres" $skeletonLang
    }

    if(!(Test-Path $skeletonCommon)) {
        Write-Host "E5R Skeleton Template <common> not found!"
        Exit
    }
    if(!(Test-Path $skeletonLang)) {
        Write-Host "E5R Skeleton Template <common> not found!"
        Exit
    }

    Copy-Skeleton "common" $workdir
    Copy-Skeleton "$lang" $workdir

    $e5rLocalPath = "$workdir\.e5r"
    $langFilePath = "$e5rLocalPath\lang"
    $envFilePath  = "$e5rLocalPath\env"

    if(!(Test-Path $e5rLocalPath)) {
        $outputSilent = New-Item -ItemType Directory -Path $e5rLocalPath
    }

    $envDef  = "E5R_LANG=$lang"
    $envDef += [System.Environment]::NewLine
    $envDef += "E5R_LICENSE=NO"
    $envDef += [System.Environment]::NewLine
    $envDef += "UNIX:E5R_OS=UNIX"
    $envDef += [System.Environment]::NewLine
    $envDef += "WINDOWS:E5R_OS=WINDOWS"

    $outputSilent = New-Item -ItemType File -Force -Path $langFilePath -Value $lang
    $outputSilent = New-Item -ItemType File -Force -Path $envFilePath -Value $envDef

    $licenseMessage = $null

    if("$license" -ne "") {
        $license     = "$license".ToUpper()
        $licenseFile = "$license.md"
        $licensePath = "$licenseBasePath\$licenseFile"
        $licenseUrl  = "$licenseBaseUrl/$licenseFile"
        
        if(!(Test-Path $licensePath)) {
            if(!(Web-Exists $licenseUrl)) {
                Write-Host "----> Web license $license not found!" -ForegroundColor DarkGray
                Write-Host "      URL: $licenseUrl" -ForegroundColor DarkGray
                $licenseMessage = "$license license not added to the project!"
            }else{
                if(!(Test-Path $licenseBasePath)) {
                    $outputSilent = New-Item -ItemType Directory -Path $licenseBasePath
                }
                try {
                    Web-Download $licenseUrl $licensePath
                    $outputSilent = Copy-Item $licensePath "$workdir\LICENSE.md" -Force
                }catch [Exception] {
                    Write-Host "----> Download failed!" -ForegroundColor DarkGray
                    Write-Host "      URL: $licenseUrl" -ForegroundColor DarkGray
                    $licenseMessage = "$license license not added to the project!"
                }
            }
        }
    }

    Write-Host "E5R Skeleton <$lang> initialized successfully!" -ForegroundColor Cyan

    if("$licenseMessage" -ne "") {
        Write-Host "WARNING: " -NoNewLine -ForegroundColor DarkYellow
        Write-Host $licenseMessage -ForegroundColor Yellow
    }
}

# -help
if($help -or ($args.length -eq 1 -and $args[0] -eq "help")) {
    Run-Help
    Exit
}

# -init
if($init) {
    Run-Init
    Exit
}

Run-Usage