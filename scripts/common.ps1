$version              = "0.1-alpha1"
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
    $__ = $ErrorActionPreference
    $ErrorActionPreference = "stop"
    try {
        $command = Get-Command $commandName
        if($command) {
            return $true
        }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $__
    }
    
    return $false
}

Function Get-ProcessorArchitecture() {
    return [System.String]::Format("{0}bit", [System.IntPtr]::Size * 8)
}

Function Get-E5RVersion() {
    return $version
}