param(
    [string] $workdir = $null,
    [string] $lang = $null,
    [switch] $init = $false,
    [switch] $help = $false,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$version          = "sprint-1"
$e5rPath          = "$env:UserProfile\.e5r"
$skeletonBasePath = "$e5rPath\resources\skeleton"
$skeletonBaseUrl  = "https://raw.githubusercontent.com/e5r/env/$version/resources/skeleton"

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
        Invoke-WebRequest $resourceUrl -OutFile $resourceFilePath
    }catch [Exception] {
        Write-Host "----> Download failed!"
        Write-Host "      URL: $resourceUrl"
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
            Invoke-WebRequest $fileUrl -OutFile $filePath
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
# Não existe '.e5r/resources/skeleton/common'?
#  --> Não existe 'http://github.../resources/skeleton/common.wres'
#      --> Mensagem de erro
#  --> Cria '.e5r/resources/skeleton/common'
#  --> Baixa 'http://github.../resources/skeleton/common.wres' para '.e5r/resources/skeleton/common/common.wres'
#  --> Processa '.e5r/resources/skeleton/common/common.wres'
#  --> Apaga '.e5r/resources/skeleton/common/common.wres'
#
# Não existe '.e5r/resources/skeleton/common'?
#  --> Mensagem de erro
#
# Copia '.e5r/resources/skeleton/common/*' para './'

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
    #$skeletonLang   = "$skeletonBasePath\$lang"

    if(!(Test-Path $skeletonCommon)) {
        Make-WebResource $skeletonBaseUrl "common.wres" $skeletonCommon
    }
    #if(!(Test-Path $skeletonLang)) {
    #    Make-WebResource $skeletonBaseUrl "$lang.wres" $skeletonLang
    #}

    if(!(Test-Path $skeletonCommon)) {
        Write-Host "E5R Skeleton Template <common> not found!"
        Exit
    }
    #if(!(Test-Path $skeletonLang)) {
    #    Write-Host "E5R Skeleton Template <common> not found!"
    #    Exit
    #}

    Copy-Skeleton "common" $workdir
    #Copy-Skeleton "$lang" $workdir

    Write-Host "E5R Skeleton <$lang> initialized successfully!" -ForegroundColor Cyan
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