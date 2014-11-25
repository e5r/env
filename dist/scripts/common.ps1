$e5rVersion           = "0.1.0-alpha1"
$e5rRepository        = "http://e5r.github.io/env/dist"
$e5rPath              = "$env:UserProfile\.e5r"
$e5rPostFile          = "$e5rPath\postfile.cmd"
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
        $webRequest.Timeout = $global:timeoutDownload
        [System.Net.WebResponse]$webResponse = $webRequest.GetResponse()
        [System.IO.Stream]$webStream = $webResponse.GetResponseStream()
        [System.IO.FileStream]$fileStream = [System.IO.File]::Create($path)
        $webStream.CopyTo($fileStream)
        $fileStream.Close()
        $webStream.Close()
        $webResponse.Close()
    } catch [System.Net.WebException] {
        if($_.Exception.Response -and $_.Exception.Response.StatusCode -eq "NotFound") {
            throw $_
        }
        if($requestNum -ge $global:maxDownloadRequest){
            throw $_
        }
        $requestNum++
        if(!$silent){
            Write-Host "      >> Download error"
        }
        Write-Host "      -> Attempt $requestNum of $global:maxDownloadRequest..."
        Start-Sleep -m $global:sleepAttemptDownload
        Get-WebFile $url $path $message $requestNum $true
    } catch [System.Exception] {
        if($requestNum -ge $global:maxDownloadRequest){
            throw $_
        }
        $requestNum++
        if(!$silent){
            Write-Host "      >> Download error"
        }
        Write-Host "      -> Attempt $requestNum of $global:maxDownloadRequest..."
        Start-Sleep -m $global:sleepAttemptDownload
        Get-WebFile $url $path $message $requestNum $true
    }
}

Function Test-WebFile([string]$url) {
    $wr = [System.Net.WebRequest]::Create($url)
    try {
        $res = $wr.GetResponse()
    } catch [System.Net.WebException] {
        $res = $_.Exception.Response
    }
    $statusCode = [int]$res.StatusCode
    if($statusCode -eq 200){
        return $true
    }
    return $false
}

Function Test-Command([string] $commandName) {
    if(Get-Command $commandName -ErrorAction SilentlyContinue){
        return $true
    }else{
        return $false
    }
}

Function Get-ProcessorArchitecture() {
    return [System.String]::Format("{0}bit", [System.IntPtr]::Size * 8)
}

Function Get-E5RVersion() {
    return $global:e5rVersion
}

Function Get-E5RPostFile() {
    return $global:e5rPostFile
}

Function Get-E5RRepository() {
    return $global:e5rRepository
}


Function Update-EnvironmentVariablesForTarget() {
param(
    [string] $targetName,
    [string] $name,
    [string] $replaceValue = $null,
    [string] $addValue = $null,
    [string] $prefixRemove = $null,
    [string] $sufixRemove = $null,
    [string] $valueSeparator = ";"
)
    $oldValue = [Environment]::GetEnvironmentVariable($name, $targetName)
    if([String]::IsNullOrEmpty($replaceValue)) {
        [string[]]$newValueList = @()
        if(![String]::IsNullOrEmpty($oldValue)) {
            foreach($oldValueItem in $oldValue.Split($valueSeparator)) {
                if((![String]::IsNullOrEmpty($prefixRemove)) -and ($oldValueItem.StartsWith($prefixRemove, $true, $null))){
                    continue
                }
                if((![String]::IsNullOrEmpty($sufixRemove)) -and ($oldValueItem.EndsWith($sufixRemove, $true, $null))) {
                    continue
                }
                $newValueList += $oldValueItem
            }
        }
        $newValue = $newValueList -join $valueSeparator
        if(![String]::IsNullOrEmpty($addValue)) {
            if(![String]::IsNullOrEmpty($newValue)) {
                $newValue += $valueSeparator
            }
            $newValue += $addValue
        }
    }else{
        $newValue = $replaceValue
    }
    [Environment]::SetEnvironmentVariable($name, $newValue, $targetName)
    return $newValue
}

Function Update-EnvironmentVariables() {
param(
    [string] $name,
    [string] $replaceValue = $null,
    [string] $addValue = $null,
    [string] $prefixRemove = $null,
    [string] $sufixRemove = $null,
    [string] $valueSeparator = ";",
    [string] $showMessage = $null
)
    if(![String]::IsNullOrEmpty($showMessage)){
        Write-Host "----> $showMessage"
    }
    $targetUser = Update-EnvironmentVariablesForTarget `
        -TargetName "User" `
        -Name $name `
        -ReplaceValue $replaceValue `
        -AddValue $addValue `
        -PrefixRemove $prefixRemove `
        -SufixRemove $sufixRemove `
        -ValueSeparator $valueSeparator
    $targetProcess = Update-EnvironmentVariablesForTarget `
        -TargetName "Process" `
        -Name $name `
        -ReplaceValue $replaceValue `
        -AddValue $addValue `
        -PrefixRemove $prefixRemove `
        -SufixRemove $sufixRemove `
        -ValueSeparator $valueSeparator
    if(![String]::IsNullOrEmpty($targetProcess)){
        $postFile = Get-E5RPostFile
        $commandPrefix="set $name="
        $command = "$commandPrefix$targetProcess"
        $postFileContent  = ""
        if(Test-Path $postFile) {
            foreach ($postFileLine in (Get-Content $postFile)) {
                if($postFileLine.StartsWith($commandPrefix, $true, $null)){
                    continue
                }
                if(![String]::IsNullOrEmpty($postFileContent)){
                    $postFileContent += [System.Environment]::NewLine
                }
                $postFileContent += $postFileLine
            }
        }
        if(![String]::IsNullOrEmpty($postFileContent)){
            $postFileContent += [System.Environment]::NewLine
        }
        $postFileContent += $command
        $outputSilent = New-Item -ItemType File -Force $postFile -Value $postFileContent
    }
}