$targetDir = "Frontend/src"
$pattern = "console\.error\((['\"`][^'\"`]*?['\"`]),\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\)"
$replacement = 'console.error($1, $2?.message || $2)'

Get-ChildItem -Path $targetDir -Recurse -Include *.jsx,*.js | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw
    
    if ($content -match $pattern) {
        $newContent = [regex]::Replace($content, $pattern, $replacement)
        $newContent | Set-Content $filePath -NoNewline
        Write-Host "Sanitized: $filePath"
    }
}
