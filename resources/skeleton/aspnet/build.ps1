
$progresspreference = 'SilentlyContinue'
$buildstage = "build-stage"
$nugetpath = "$buildstage\.nuget"
$nuget = "$nugetpath\nuget.exe"
$packagespath = "$nugetpath%\packages"

if(!(get-command 'e5r' -erroraction silentlycontinue)){
  write-host "`nE5R Environment not installed!"
  exit 1
}

if(!(test-path "$nuget")){
  write-host "Downloading NuGet..."
  write-host "TODO: Move to E5R ENV BOOT --tech aspnet"
  if(!(test-path "$nugetpath")){
    md "$nugetpath" -force | out-null
  }
  invoke-webrequest "https://www.nuget.org/nuget.exe" -outfile "$nuget"
}

write-host "TODO: Move to Build_EnvCheck"
if(!(test-path "$nuget")){
  write-host "`nNUGET not installed!"
  exit 1
}

iex "& e5r env boot"
iex "& e5r env install"
iex "& e5r env use"
write-host "TODO: Delete packages.config and use install Sake here"
iex "& `"$nuget`" install -OutputDirectory `"$packagespath`"  -ExcludeVersion `".\packages.config`""

write-host "Building..."
iex "& `"$packagespath\Sake\tools\sake.exe`" -I `"build`" -f makefile.shade $args"
