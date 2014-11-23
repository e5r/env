param(
    [string] $workdir,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]] $args=@()
)

$e5rPath    = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$kvmCommand = "$psHome\powershell.exe kvm.ps1 list"

if(!(Test-Command "kvm")) {
    Write-Host "----> This command depends on [kvm] that is not present" -ForegroundColor Red
    Write-Host "      >> Try running [e5r env boot] first" -ForegroundColor DarkRed
    Exit 1
}

foreach ($line in Invoke-Expression "$kvmCommand $args") {
    Write-Host $line
}
