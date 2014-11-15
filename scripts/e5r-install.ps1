$version              = "0.1-alpha1"
$e5rPath              = $env:USERPROFILE + "\.e5r"
$e5rBin               = "$e5rPath\bin"
$e5rLib               = "$e5rPath\lib"
$postSetup            = "$e5rPath\postsetup.bat"
$repositoryBase       = "https://raw.githubusercontent.com/e5r/env/$version"
$maxDownloadRequest   = 5
$timeoutDownload      = 30000
$sleepAttemptDownload = 5000

Function Get-WebFile([string]$url, [string]$path, $message = $null, $requestNum = 1, $silent = $false) {
    if(!$silent) {
        if($message -ne $null) {
            Write-Host "----> $message"
        }else{
            Write-Host "----> Downloading $url"
            Write-Host "      To: $path"
        }
    }
    try {
        $webRequest = [System.Net.WebRequest]::Create($url)
        $webRequest.Timeout = $timeoutDownload
        [System.Net.WebResponse]$webResponse = $webRequest.GetResponse()
        [System.IO.Stream]$webStream = $webResponse.GetResponseStream()
        [System.IO.FileStream]$fileStream = [System.IO.File]::Create($path)
        $webStream.CopyTo($fileStream)
        $fileStream.Close()
        $webStream.Close()
        $webResponse.Close()
    } catch [System.Exception] {
        if($requestNum -ge $maxDownloadRequest){
            throw $_
        }
        $requestNum++
        if(!$silent){
            Write-Host "      >> Download error"
        }
        Write-Host "      -> Attempt $requestNum of $maxDownloadRequest..."
        Start-Sleep -m $sleepAttemptDownload
        Get-WebFile $url $path $message $requestNum $true
    }
}

Function Invoke-Uninstall() {
    if(Test-Path $e5rPath) {
        $outputSilent = Remove-Item $e5rPath -Recurse -Force
    }
}

Function Update-EnvironmentVariables() {
    $path = [Environment]::GetEnvironmentVariable("Path", "User")
    $contains = $false
    if($path -ne $null) {
        $contains = $path.ToLower().Contains($e5rBin.ToLower())
    }
    if(!$contains) {
        if($path -ne $null) {
            $path += ";"
        }
        $path += $e5rBin
        if($env:Path -ne $null) {
            $env:Path += ";"
        }
        $env:Path += $e5rBin
        $command = "set PATH=%PATH%;$e5rBin"
        $outputSilent = New-Item -ItemType File -Force $postSetup -Value $command
        [Environment]::SetEnvironmentVariable("Path", $path, "User")
    }
}

$outputSilent = New-Item -ItemType Directory -Force $e5rBin
$outputSilent = New-Item -ItemType Directory -Force $e5rLib

try {
    Get-WebFile "$repositoryBase/scripts/e5r.bat" "$e5rBin\e5r.bat" "Getting `"e5r.bat`"..."
    Get-WebFile "$repositoryBase/scripts/e5r.ps1" "$e5rBin\e5r.ps1" "Getting `"e5r.ps1`"..."
    Get-WebFile "$repositoryBase/scripts/common.ps1" "$e5rLib\common.ps1" "Getting `"common.ps1`"..."
}catch [Exception]{
    Invoke-Uninstall
    Start-Sleep -s 5
    Exit
}

Update-EnvironmentVariables

Write-Host ""
Write-Host "----> E5R Environment successfully installed!"
Start-Sleep -s 5