param(
    [string] $workdir,
    [string] $version,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]] $args=@()
)

Write-Host "----> [kvm] does not support uninstall" -ForegroundColor Red
Exit 1