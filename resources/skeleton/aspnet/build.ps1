$progresspreference = 'SilentlyContinue'

if(!(get-command 'e5r' -erroraction silentlycontinue)){
  write-host "`nE5R Environment not installed!"
  exit 1
}

iex "& e5r env boot"
iex "& e5r env install"
iex "& e5r env use"

if(!(get-command 'nuget' -erroraction silentlycontinue)){
  write-host "`nNuGet tool not installed!"
  exit 1
}

if(!(get-command 'sake' -erroraction silentlycontinue)){
  write-host "`nSake tool not installed!"
  exit 1
}

write-host "Building..."
iex "& sake -I `"build`" -f makefile.shade $args"

exit $lastexitcode
