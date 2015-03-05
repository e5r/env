for($count = 0; $count -lt $args.length; $count++) {
    $value = $args[$count]
    if("$value".contains(" ")) {
        $value = "$value".replace("`"", "```"")
        $value = "`"$value`""
    }
    $args[$count] = $value
}

if(!(get-command 'e5r' -erroraction silentlycontinue)){
  write-host "E5R Environment Bootstrap..."
  $e5rrepo = "https://github.com/e5r/env/raw/migrate-to-javascript"
  invoke-webrequest "$e5rrepo/e5r-install.ps1" -outfile "$psscriptroot\e5r-install.ps1"
  iex "& `"$psscriptroot\e5r-install.ps1`""
  if(test-path "$psscriptroot\e5r-install.ps1"){
    del "$psscriptroot\e5r-install.ps1" -force | out-null
  }
}
