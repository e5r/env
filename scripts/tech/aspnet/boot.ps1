param(
    [string] $workdir,
    [parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]] $args=@()
)

@"

Exec E5R Environment Boot for AspNet vNext
---------------------------------------------------------------
  workdir => $workdir
---------------------------------------------------------------
"@ | Write-Host

$count = 0
foreach($arg in $args) {
    Write-Host "  arg[$count]  => $arg"
    $count++
}
