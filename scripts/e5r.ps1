for($count = 0; $count -lt $args.length; $count++) {
    $value = $args[$count]
    if("$value".contains(" ")) {
        $value = "$value".replace("`"", "```"")
        $value = "`"$value`""
    }
    $args[$count] = $value
}

$runner = [io.path]::getfullpath("$psscriptroot\..\lib\cmdrunner.js")
$postfile = [io.path]::getfullpath("$psscriptroot\..\tmp-hot-envvars.ps1")

iex "& cscript `"$runner`" //nologo $args"

if(test-path $postfile){
    iex "& $postfile"
    remove-item $postfile
}
