param(
    [parameter(Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

Write-Host "Boot for AspNet vNext running..."

$count = 0
foreach($arg in $args) {
    Write-Host "  arg[$count] => $arg"
    $count++
}
