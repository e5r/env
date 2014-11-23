param(
    [string] $workdir,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]] $args=@()
)

$e5rPath       = "$env:UserProfile\.e5r"

Import-Module -Name "$e5rPath\lib\common.ps1"

$e5rVersion    = Get-E5RVersion
$aspnetRelease = "v1.0.0-beta1"
$kvmBase     = "$env:UserProfile\.kre"
$kvmBin        = "$kvmBase\bin"
$kvmBaseUrl    = "https://raw.githubusercontent.com/aspnet/Home/$aspnetRelease"

if(!(Test-Path $kvmBin)) {
    $outputSilent = New-Item -ItemType Directory -Path $kvmBin
}

if(!(Test-Path "$kvmBin\kvm.cmd")){
    try{
        Get-WebFile "$kvmBaseUrl/kvm.cmd" "$kvmBin\kvm.cmd" "Downloading `"kvm.cmd`"..."
    }catch [Exception] {
        Write-Host "      >> Download failed!" -ForegroundColor DarkGray
        Write-Host "      -> URL: $kvmBaseUrl/kvm.cmd" -ForegroundColor DarkGray
        Exit 1
    }
}
if(!(Test-Path "$kvmBin\kvm.ps1")){
    try{
        Get-WebFile "$kvmBaseUrl/kvm.ps1" "$kvmBin\kvm.ps1" "Downloading `"kvm.ps1`"..."
    }catch [Exception] {
        Write-Host "      >> Download failed!" -ForegroundColor DarkGray
        Write-Host "      -> URL: $kvmBaseUrl/kvm.ps1" -ForegroundColor DarkGray
        Exit 1
    }
}

Update-EnvironmentVariables `
    -Name "PATH"  `
    -AddValue $kvmBin  `
    -PrefixRemove $kvmBase `
    -showMessage "Adding `"$kvmBin`" to PATH..."

Update-EnvironmentVariables `
    -Name "KRE_HOME" `
    -ReplaceValue $kvmBase `
    -showMessage "Adding `"$kvmBase`" to KRE_HOME..."

if(!(Test-Command "kvm")) {
    Write-Host "----> Unexpected error while installing [kvm]" -ForegroundColor Red
    Write-Host "      >> Command not available" -ForegroundColor DarkRed
    Exit 1
}
