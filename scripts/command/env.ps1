param(
    [switch] $help = $false,
    [string] $workdir = $null,
    [string] $tech = $null,
    [string] $version = $null,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$e5rPath = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$version = Get-E5RVersion

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
E5R Env Command - Version $version

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

Function Install-Command($commandName) {
  Write-Host "Installing [$commandName]..."
  return $true
}

$commandName, $args = $args

$commandName
$args
Exit

# -help
# TODO: Exibir help de subcomandos
if($help -or ($args.length -eq 1 -and $args[0] -eq "help")) {
    Show-Help
    Exit
}

if($args.length) {
    if(Install-Command $args[0]){
        Invoke-Command $args[0]
        Exit
    }
    Write-Host "Command <" + $args[0] + "> not found!"
    Exit
}

Show-Help