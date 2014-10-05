param(
    [parameter(Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

Write-Host "E5R Command..."

$count = 0
foreach($arg in $args) {
    Write-Host "  arg[$count] => $arg"
    $count++
}
