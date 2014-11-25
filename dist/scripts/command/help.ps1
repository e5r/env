param(
    [parameter(Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$e5rPath = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$e5rVersion = Get-E5RVersion

function Show-Help {
@"

E5R Environment - Version $e5rVersion

Copyright (c) 2014 E5R Development Team

E5R Environment, is a collection of scripts to automate tasks
that relate to the development of E5R Development Team.
But that can easily be used by any developer (or development
team) wishing to apply concepts and patterns of development
used by E5R Development Team for their projects.

Usage:
   e5r <command> [options]

Commands:
   help             Show this information

   skeleton         Provides methods to create the basic structure
                    for your projects and components

   env              Manages the installation / uninstallation and
                    selection of several versions of your
                    development environment

"@ | Write-Host
}

Show-Help