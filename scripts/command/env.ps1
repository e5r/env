param(
    [switch] $help = $false,
    [string] $workdir = $null,
    [string] $tech = $null,
    [string] $version = $null,
    [string] $saveVersion = $null,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$e5rPath        = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

# Note: Do not confuse with [$version] parameter
$e5rVersion     = Get-E5RVersion

$e5rCmdBase     = "$e5rPath\lib\env"
$e5rCmdBaseUrl  = "https://raw.githubusercontent.com/e5r/env/$e5rVersion/scripts/tech"

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

if([String]::IsNullOrEmpty($tech)) {
    $techFile = "$workdir\.e5r\tech"
    if(Test-Path $techFile) {
        $techFileContent = Get-Content $techFile
        if(![String]::IsNullOrEmpty($techFileContent)) {
            $tech = "$techFileContent".Trim()
        }
    }
}

if([String]::IsNullOrEmpty($version)) {
    $versionFile = "$workdir\.e5r\version"
    if(Test-Path $versionFile) {
        $versionFileContent = Get-Content $versionFile
        if(![String]::IsNullOrEmpty($versionFileContent)) {
            $version = "$versionFileContent".Trim()
        }
    }
}

if(![String]::IsNullOrEmpty($saveVersion)) {
    if(![String]::IsNullOrEmpty($version)) {
        Write-Host "----> #Notice: Assuming version $version" -ForegroundColor DarkGray
    }
    $version = $saveVersion
}

for($count = 0; $count -lt $args.length; $count++) {
    $value = $args[$count]
    if($value.contains(" ")) {
        $value = $value.replace("`"", "```"")
        $value = "`"$value`""
    }
    $args[$count] = $value
}

function Show-Help {
@"
E5R Env Command - Version $e5rVersion

Copyright (c) 2014 E5R Development Team

Usage:
  e5r env [options]

Options:
   -help|help           Show this information
      > TODO            Show information to sub commands

   -workdir <dir/path>  By default the env command considers the current
      > optional        directory as the working directory, but this can be
                        modified by passing a value for this option

   -tech <tech>         Specify the technology to be used
      > optional when   > [workdir] contains the file ".e5r/tech"

   -version <version>   License specifies that the project will use
      > optional for    > [boot] and [list]

   boot                 Checks and installs the prerequisites for informed
                        environment

   install              Install a specific version of the environment

   uninstall            Uninstall a specific version of the environment

   list                 List all installed versions of the environment

   use                  Sets a specific version of the environment for
                        use in the system

"@ | Write-Host
}

Function Show-Error($message) {
    Write-Host "----> " -NoNewLine -ForegroundColor DarkRed
    Write-Host "E5R Env Error!" -ForegroundColor Red
    Write-Host "      >> " -NoNewLine -ForegroundColor Red
    Write-Host $message -ForegroundColor DarkRed
}

Function Install-Command() {
param(
    [parameter(Position=0)]
    [string]$commandName,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)
    $commandPath = "$e5rCmdBase\$tech"
    $commandPathCreated = $false
    $commandFile = "$commandPath\$commandName.ps1"
    if(!(Test-Path $commandPath)){
        $outputSilent = New-Item -ItemType Directory -Path $commandPath
        $commandPathCreated = $true
    }
    if(!(Test-Path $commandFile)) {
        $commandUrl = "$e5rCmdBaseUrl/$tech/$commandName.ps1"
        if(!(Test-WebFile $commandUrl)) {
            if($commandPathCreated){
                $outputSilent = Remove-Item $commandPath -Recurse -Force
            }
            return "Web command [$tech/$commandName] not found!"
        }
        try {
            Get-WebFile $commandUrl $commandFile "Getting remote command `"$tech/$commandName`"..."
        }catch [Exception] {
            if($commandPathCreated){
                $outputSilent = Remove-Item $commandPath -Recurse -Force
            }
            return $_
        }
    }
}

Function Invoke-Command() {
param(
    [parameter(Position=0)]
    [string]$commandName,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)
    $commandPath = "$e5rCmdBase\$tech"
    $commandFile = "$commandPath\$commandName.ps1"
    if(!(Test-Path $commandFile)) {
        return "Command [$commandName] not found!"
    }
    $invokeArguments = "-workdir `"$workdir`" $args"
    if(![String]::IsNullOrEmpty($version)) {
        $invokeArguments += " -version `"$version`""
    }
    Invoke-Expression "& `"$commandFile`" $invokeArguments"
    # Save version file if not exists
    if(![String]::IsNullOrEmpty($saveVersion)) {
        $versionFile = "$workdir\.e5r\version"
        if(!(Test-Path $versionFile)) {
            $outputSilent = New-Item -ItemType File -Force -Path $versionFile -Value $saveVersion
        }
    }
}

$commandName, $args = $args

# -help
# TODO: Exibir help de subcomandos
if($help -or $commandName -eq "help" -or !$commandName) {
    Show-Help
    Exit
}

if(!(Test-Path $workdir)){
    Show-Error "Parameter -workdir is required"
    Exit
}

if([String]::IsNullOrEmpty($tech)) {
    Show-Error "Parameter -tech is required"
    Exit
}

try {
    $error = Install-Command $commandName $args
    if($error -ne $null) {
        Show-Error $error
        Exit
    }
    $error = Invoke-Command $commandName $args
    if($error -ne $null) {
        Show-Error $error
        Exit
    }
    Exit
}catch [Exception]{
    Show-Error $_
    Exit
}

Show-Help