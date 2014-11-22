param(
    [string] $workdir,
    [string] $version,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]] $args=@()
)

$e5rPath = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$kvmCommand = "kvm use $version"

if(Test-Command "kvm" -ne $true) {
    Write-Host "----> This command depends on [kvm] that is not present" -ForegroundColor Red
    Write-Host "      >> Try running [e5r env boot] first" -ForegroundColor DarkRed
    Exit 1
}

Invoke-Expression "& $kvmCommand $args"