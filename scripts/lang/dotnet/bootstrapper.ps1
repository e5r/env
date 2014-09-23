param(
    [parameter(Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$args=@()
)

Write-Host "Bootstrapper .NET vNext running 2..."

$count = 0
foreach($arg in $args) {
    Write-Host "  arg[$count] => $arg"
    $count++
}
