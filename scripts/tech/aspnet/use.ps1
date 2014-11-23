param(
    [string] $workdir,
    [string] $version,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]] $args=@()
)

if([String]::IsNullOrEmpty($version)) {
    Write-Host "----> Parameter -version is required" -ForegroundColor Red
    Exit 1
}

$e5rPath     = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$kvmBase     = "$env:UserProfile\.kre"
$kvmPostFile = "$kvmBase\run-once.cmd"
$e5rPostFile = Get-E5RPostFile
$kvmCommand  = "$psHome\powershell.exe kvm.ps1 use $version"

if(!(Test-Command "kvm")) {
    Write-Host "----> This command depends on [kvm] that is not present" -ForegroundColor Red
    Write-Host "      >> Try running [e5r env boot] first" -ForegroundColor DarkRed
    Exit 1
}

foreach ($line in Invoke-Expression "$kvmCommand $args") {
    Write-Host $line
}

if(Test-Path $kvmPostFile){
    if(Test-Path $e5rPostFile){
        $kvmPostFileContent = Get-Content $kvmPostFile
        $outputSilent = Add-Content $e5rPostFile "`n$kvmPostFileContent"
    }else{
        $outputSilent = Copy-Item $kvmPostFile $e5rPostFile
    }
    $outputSilent = Remove-Item $kvmPostFile -Force
}
