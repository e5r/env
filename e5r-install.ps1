$repositoryUrl = "https://raw.githubusercontent.com/e5r/env/v0.1.0-alpha2"
$scriptName = [io.path]::getfilenamewithoutextension($pscommandpath)
$e5rPath = "$home\.e5r"
$postFile = "$e5rPath\tmp-hot-envvars.ps1"
$installFile = "$e5rPath\bin\$scriptName.js"

md "$e5rPath\bin" -force | out-null
md "$e5rPath\lib" -force | out-null

# download
$files = ("sysutils","lib"),("fsutils","lib"),("webutils","lib"),("$scriptName","bin")

$wc = new-object system.net.webclient

foreach($file in $files){
  $url = "$repositoryUrl/scripts/{0}.js" -f $file[0]
  $path = "$e5rPath\{1}\{0}.js" -f $file[0] , $file[1]
  $wc.downloadfile($url, $path)
}

# run
iex "& cscript `"$installFile`" //nologo"

if(test-path $postfile){
    iex "& $postfile"
    remove-item $postfile
}

# gc
if (test-path $installFile){
  del $installFile -recurse
}
if (!(test-path "$e5rPath\bin\e5r.ps1")){
  rd "$e5rPath" -force -recurse
}
