# Self-healing launcher for the Sunk app (localhost:3000).
# Runs forever: if the server is not listening, it (re)starts it.
# Registered as a scheduled task so it survives logouts/reboots and shell cleanups.

$ErrorActionPreference = "Continue"
$proj = "C:\Users\Ahyaan Fouad\Documents\Default Project"
$port = 3000
$logDir = Join-Path $env:TEMP "opencode"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$outLog = Join-Path $logDir "sunk-server.log"
$errLog = Join-Path $logDir "sunk-server.err.log"
$watchLog = Join-Path $logDir "sunk-watchdog.log"

function Test-PortListening([int]$p) {
  $line = netstat -ano | Select-String "TCP\s+[^\s]+:$p\s+.*LISTENING"
  return [bool]$line
}

function Log([string]$msg) {
  Add-Content -Path $watchLog -Value ("{0}  {1}" -f (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"), $msg)
}

# Rebuild if the production build is missing.
if (-not (Test-Path (Join-Path $proj ".next\BUILD_ID"))) {
  Log "No build found - building..."
  Push-Location $proj
  & cmd /c "npm run build"
  Pop-Location
}

while ($true) {
  if (-not (Test-PortListening $port)) {
    Log "Server down - starting..."
    try {
      $proc = Start-Process -FilePath "node" `
        -ArgumentList "node_modules/next/dist/bin/next","start","-p","$port" `
        -WorkingDirectory $proj `
        -WindowStyle Hidden `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog `
        -PassThru
      $started = $false
      for ($i = 0; $i -lt 60; $i++) {
        Start-Sleep -Seconds 1
        if (Test-PortListening $port) { $started = $true; break }
        if ($proc.HasExited) { break }
      }
      if ($started) { Log "Server up (pid $($proc.Id))" } else { Log "Start failed, will retry (pid $($proc.Id))" }
    } catch {
      Log "Error starting: $($_.Exception.Message)"
    }
  }
  Start-Sleep -Seconds 20
}
