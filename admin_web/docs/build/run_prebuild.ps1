$process = Start-Process -FilePath "npx" -ArgumentList "expo", "prebuild", "--platform", "android", "--clean" -NoNewWindow -PassThru -WorkingDirectory "c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp"

# Wait a moment for the prompt to appear
Start-Sleep -Seconds 2

# Send "y" to answer the prompt
[System.Diagnostics.Process]::GetProcesses() | Where-Object {$_.ProcessName -eq "cmd"} | ForEach-Object {
    $_.StandardInput.WriteLine("y")
}

$process.WaitForExit()
$process.ExitCode
