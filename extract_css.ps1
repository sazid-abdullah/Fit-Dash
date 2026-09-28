$html = [System.IO.File]::ReadAllText("index.html")
$startIdx = $html.IndexOf("<style>")
$endTag = "</style>"
$endIdx = $html.IndexOf($endTag)
if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
    $cssStart = $startIdx + 7
    $cssLength = $endIdx - $cssStart
    $css = $html.Substring($cssStart, $cssLength).Trim()
    [System.IO.File]::WriteAllText("css/style.css", $css)

    $newHtml = $html.Substring(0, $startIdx) + '<link rel="stylesheet" href="css/style.css">' + $html.Substring($endIdx + $endTag.Length)
    [System.IO.File]::WriteAllText("index.html", $newHtml)
    Write-Host "CSS extracted successfully."
} else {
    Write-Host "Style tag not found."
}
