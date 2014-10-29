$maxDownloadRequest   = 5
$timeoutDownload      = 30000
$sleepAttemptDownload = 5000

Function Get-WebFile([string]$url, [string]$path, $requestNum = 1) {
    if($requestNum -gt 1){
        Write-Host "----> Downloading(attempt $requestNum) $url"
    }else{
        Write-Host "----> Downloading $url"
    }
    Write-Host "      To: $path"
    try {
        $webRequest = [System.Net.WebRequest]::Create($url)
        $webRequest.Timeout = $timeoutDownload
        #$webRequest.Headers.Add("UserAgent", "E5R Environment version 1.0")
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
        Write-Host "----> Download error for $url"
        Write-Host "      >> Retrying in 5 seconds ($requestNum of $maxDownloadRequest attempts)..."
        Start-Sleep -m $sleepAttemptDownload
        Get-WebFile $url $path $requestNum
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