Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('d:\ky5\SWP391\git-github\SWP391\docs\references\Parking_Slot_Allocation_RBL_Report (2).docx')
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
$xmlDoc = [xml]$xml
$nodes = $xmlDoc.GetElementsByTagName('w:t')
$text = ''
foreach ($node in $nodes) { $text += $node.InnerText + "`n" }
Write-Output $text | Out-File -FilePath 'd:\ky5\SWP391\git-github\SWP391\docs\references\rbl_report.txt' -Encoding UTF8
