param(
    [parameter(Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

$version = "sprint-1"

function Show-Help {
@"

E5R Environment - Version $version

Collection of scripts for managing the development environment for E5R team.
Learn more at http://github.com/e5r/env

Copyright (c) 2014 E5R Development Team

"@ | Write-Host -ForegroundColor Cyan
}

Show-Help