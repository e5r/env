param(
    [string] $workdir = $null,
    [string] $tech = $null,
    [string] $license = $null,
    [switch] $init = $false,
    [switch] $help = $false,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$e5rPath              = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$e5rVersion           = Get-E5RVersion
$e5rRepository        = Get-E5RRepository
$skeletonBasePath     = "$e5rPath\resources\skeleton"
$skeletonBaseUrl      = "$e5rRepository/resources/skeleton"
$licenseBasePath      = "$e5rPath\resources\license"
$licenseBaseUrl       = "$e5rRepository/resources/license"

Function Make-WebResource([string] $urlBase, [string] $resourceName, [string] $pathBase) {
    $resourceUrl = "$urlBase/$resourceName"
    $resourceFilePath = "$pathBase\$resourceName"
    if(!(Test-Path $resourceFilePath) -and !(Test-WebFile $resourceUrl)) {
        Write-Host "----> Web resource $resourceName not found!"
        Write-Host "      URL: $resourceUrl"
        Exit 1
    }
    if(!(Test-Path $pathBase)) {
        $outputSilent = New-Item -ItemType Directory -Path $pathBase
    }
    try {
        if(!(Test-Path $resourceFilePath)) {
            Get-WebFile $resourceUrl $resourceFilePath "Getting remote resource `"$resourceName`"..."
        }
    }catch [Exception] {
        Write-Host "      >> Download failed!"
        Write-Host "      -> URL: $resourceUrl"
        $outputSilent = Remove-Item $pathBase -Recurse -Force
        Exit 1
    }
    $lineNumber = 0
    foreach ($line in (Get-Content $resourceFilePath))
    {
        $lineNumber += 1
        $line = "$line".Trim()
        # comment
        if($line.length -lt 1 -or $line[0] -eq "#") {
            continue
        }
        # directory
        if($line.length -gt 1 -and $line[1] -eq ":" -and $line[0] -eq "d") {
            $directory     = $line.Substring(2)
            $directoryPath = "$pathBase\$directory"
            if(!(Test-Path $directoryPath)) {
                $outputSilent = New-Item -ItemType Directory -Path $directoryPath
            }
            continue
        }
        # file
        $parts = $line.Split(":")
        if($parts.length -ne 3) {
            Write-Host "Syntax error in web resource file [$resourceName]" -ForegroundColor Red
            Write-Host "  URL: " -NoNewLine -ForegroundColor DarkRed
            Write-Host "$resourceUrl"  -ForegroundColor DarkGray
            Write-Host "  Line $lineNumber`: " -NoNewLine -ForegroundColor DarkRed
            Write-Host "$line" -ForegroundColor DarkGray
            $outputSilent = Remove-Item $pathBase -Recurse -Force
            Exit 1
        }
        if($parts[0] -eq "f" -or $parts[0] -eq "fa") {
            $fileName = $parts[2]
            $fileUrl = "$urlBase/$fileName"
            $filePath = "$pathBase\" + $parts[1]
            if($parts[0] -eq "fa"){
                $filePath += ".__append__"
            }
            $filePathBase = [System.IO.Path]::GetDirectoryName($filePath)
            if(!(Test-Path $filePathBase)) {
                $outputSilent = New-Item -ItemType Directory -Path $filePathBase
            }
            if(!(Test-Path $filePath) -and !(Test-WebFile $fileUrl)) {
                Write-Host "Web resource not found!" -ForegroundColor Red
                Write-Host "  URL: " -NoNewLine -ForegroundColor DarkRed
                Write-Host "$fileUrl"  -ForegroundColor DarkGray
                $outputSilent = Remove-Item $pathBase -Recurse -Force
                Exit 1
            }
            if(!(Test-Path $filePath)) {
                Get-WebFile $fileUrl $filePath "Getting file `"$fileName`"..."
            }
            continue
        }
        # undefined
        Write-Host "Syntax error in web resource file [$resourceName]" -ForegroundColor Red
        Write-Host "  URL: " -NoNewLine -ForegroundColor DarkRed
        Write-Host "$resourceUrl"  -ForegroundColor DarkGray
        Write-Host "  Line $lineNumber`: " -NoNewLine -ForegroundColor DarkRed
        Write-Host "$line" -ForegroundColor DarkGray
        $outputSilent = Remove-Item $pathBase -Recurse -Force
        Exit 1
    }
    $outputSilent = Remove-Item $resourceFilePath
}

Function Copy-Skeleton([string] $skeleton, [string] $toPath) {
    $fromPath = "$skeletonBasePath\$skeleton"
    $outputSilent = Copy-Item "$fromPath\*" $toPath -Recurse -Force
    # replace files "*.__replace__"
    $list = Get-ChildItem "$toPath\*.__append__" -Recurse
    foreach($file in $list){
        $filePath   = $file.FullName
        $filePathTo = [System.IO.Path]::Combine([System.IO.Path]::GetDirectoryName($filePath), `
            [System.IO.Path]::GetFileNameWithoutExtension($filePath))
        if(Test-Path $filePathTo) {
            Get-Content $filePathTo, $filePath | Set-Content "$filePathTo.__appended__"
        }
        $outputSilent = Remove-Item "$filePath" -Force
        $outputSilent = Move-Item -Path "$filePathTo.__appended__" -Destination "$filePathTo" -Force
    }
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
E5R Skeleton Command - Version $e5rVersion

Copyright (c) 2014 E5R Development Team

Usage:
  e5r skeleton [options]

Options:
   -help|help           Show this information
      > TODO            Show information to sub commands

   -init                Initializes a directory with the skeleton of a project

   -workdir <dir/path>  By default the skeleton command considers the current
      > optional        directory as the working directory, but this can be
                        modified by passing a value for this option

   -tech <tech>         Specify the technology to be used

   -license <licence>   License specifies that the project will use.
      > optional        
      > values:
         AGPL-3.0       GNU Affero General Public License, Version 3
         APACHE-2.0     Apache License, Version 2.0
         ARTISTIC-2.0   The Artistic License 2.0
         BSD-2-CLAUSE   Simplified BSD
         BSD-3-CLAUSE   New BSD
         CC0            CC0 1.0 Universal - Public Domain Dedication
         EPL-1.0        Eclipse Public License - v 1.0
         GPL-2.0        GNU General Public License, Version 2
         GPL-3.0        GNU General Public License, Version 3
         ISC            ISC license
         LGPL-2.1       GNU Lesser General Public License, Version 2.1
         LGPL-3.0       GNU Lesser General Public License, Version 3
         MIT            The MIT License
         MPL-2.0        Mozilla Public License, Version 2.0
         UNLICENSE      Public Domain (Unlicense)

         More in [http://choosealicense.com]

"@ | Write-Host
}

Function Run-Help () {
    Run-Usage
}

Function Run-Init() {
    if(!$tech) {
        Write-Host "E5R Skeleton Command requires -tech parameter." -ForegroundColor Red
        Write-Host

        Run-Usage
        Exit 1
    }

    if ((Get-ChildItem $workdir).count -gt 0) {
        Write-Host "Not empty directories can not be initialized." -ForegroundColor Red
        Exit 1
    }

    $skeletonCommon = "$skeletonBasePath\common"
    $skeletonTech   = "$skeletonBasePath\$tech"

    if(!(Test-Path $skeletonCommon) -or ((Test-Path $skeletonCommon) -and (Test-Path "$skeletonCommon\common.wres"))) {
        Make-WebResource $skeletonBaseUrl "common.wres" $skeletonCommon
    }
    if(!(Test-Path $skeletonTech) -or ((Test-Path $skeletonTech) -and (Test-Path "$skeletonTech\$tech.wres"))) {
        Make-WebResource $skeletonBaseUrl "$tech.wres" $skeletonTech
    }

    if(!(Test-Path $skeletonCommon)) {
        Write-Host "E5R Skeleton Template <common> not found!"
        Exit 1
    }
    if(!(Test-Path $skeletonTech)) {
        Write-Host "E5R Skeleton Template <common> not found!"
        Exit 1
    }

    Copy-Skeleton "common" $workdir
    Copy-Skeleton "$tech" $workdir

    $e5rLocalPath = "$workdir\.e5r"
    $techFilePath = "$e5rLocalPath\tech"
    $envFilePath  = "$e5rLocalPath\env"

    if(!(Test-Path $e5rLocalPath)) {
        $outputSilent = New-Item -ItemType Directory -Path $e5rLocalPath
    }

    $envDef  = "E5R_TECH=$tech"
    $envDef += [System.Environment]::NewLine
    $envDef += "E5R_LICENSE=NO"
    $envDef += [System.Environment]::NewLine
    $envDef += "UNIX:E5R_OS=UNIX"
    $envDef += [System.Environment]::NewLine
    $envDef += "WINDOWS:E5R_OS=WINDOWS"

    $outputSilent = New-Item -ItemType File -Force -Path $techFilePath -Value $tech
    $outputSilent = New-Item -ItemType File -Force -Path $envFilePath -Value $envDef

    $licenseMessage = $null

    if("$license" -ne "") {
        $license     = "$license".ToUpper()
        $licenseFile = "$license.md"
        $licensePath = "$licenseBasePath\$licenseFile"
        $licenseUrl  = "$licenseBaseUrl/$licenseFile"
        
        if(!(Test-Path $licensePath)) {
            if(!(Test-WebFile $licenseUrl)) {
                Write-Host "----> Web license $license not found!" -ForegroundColor DarkGray
                Write-Host "      URL: $licenseUrl" -ForegroundColor DarkGray
                $licenseMessage = "$license license not added to the project!"
            }else{
                if(!(Test-Path $licenseBasePath)) {
                    $outputSilent = New-Item -ItemType Directory -Path $licenseBasePath
                }
                try {
                    Get-WebFile $licenseUrl $licensePath "Getting license `"$license`"..."
                    $outputSilent = Copy-Item $licensePath "$workdir\LICENSE.md" -Force
                }catch [Exception] {
                    Write-Host "      >> Download failed!" -ForegroundColor DarkGray
                    Write-Host "      -> URL: $licenseUrl" -ForegroundColor DarkGray
                    $licenseMessage = "$license license not added to the project!"
                }
            }
        }
    }

    Write-Host "E5R Skeleton <$tech> initialized successfully!" -ForegroundColor Cyan

    if("$licenseMessage" -ne "") {
        Write-Host "WARNING: " -NoNewLine -ForegroundColor DarkYellow
        Write-Host $licenseMessage -ForegroundColor Yellow
    }
}

# -help
# TODO: Exibir help de subcomandos
if($help -or ($args.length -eq 1 -and $args[0] -eq "help")) {
    Run-Help
    Exit 0
}

# -init
if($init) {
    Run-Init
    Exit 0
}

Run-Usage
Exit 0