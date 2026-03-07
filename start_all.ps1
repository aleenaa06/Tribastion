Start-Process node -ArgumentList "src\server.js" -WorkingDirectory "backend"

echo "Starting Python PII Service..."
Start-Process python -ArgumentList "app.py" -WorkingDirectory "pii-service"

Start-Sleep -Seconds 2
Start-Process npx.cmd -ArgumentList "--yes tunnelmole 5000" -RedirectStandardOutput "tunnelmole.out.log" -RedirectStandardError "tunnelmole.err.log" -WindowStyle Hidden

while ($true) {
    if (Test-Path tunnelmole.out.log) {
        $line = Get-Content tunnelmole.out.log | Select-String "https://[a-zA-Z0-9-]+\.tunnelmole\.net" | Select-Object -First 1
        if ($line) {
            $url = $line.Matches[0].Value
            break
        }
    }
    Start-Sleep -Seconds 1
}
$envUrl = "$url/api"

Set-Content -Path "frontend\.env" -Value "REACT_APP_API_URL=$envUrl"

echo "Using backend URL: $envUrl"

Start-Process npm.cmd -ArgumentList "start" -WorkingDirectory "frontend"

echo "All services started successfully!"
