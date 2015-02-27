param(
    [array]
    [parameter(ValueFromRemainingArguments=$true)]
    $args=@()
)

$runner = [io.path]::getfullpath("$psscriptroot\..\lib\cmdrunner.js")
$postfile = [io.path]::getfullpath("$psscriptroot\..\tmp-hot-envvars.ps1")

for($count = 0; $count -lt $args.length; $count++) {
    $value = $args[$count]
    if("$value".contains(" ")) {
        $value = "$value".replace("`"", "```"")
        $value = "`"$value`""
    }
    $args[$count] = $value
}

iex "& cscript `"$runner`" //nologo $args"

if(test-path $postfile){
    iex "& $postfile"
    remove-item $postfile
}
