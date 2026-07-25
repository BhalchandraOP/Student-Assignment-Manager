$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Stop-TrackedProcess {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Name
  )

  $pidFile = Join-Path (Join-Path $PSScriptRoot '.run') "$Name.pid"
  if (-not (Test-Path -LiteralPath $pidFile)) {
    Write-Host "$Name PID file was not found; it may already be stopped."
    return
  }

  $processId = 0
  $pidText = (Get-Content -LiteralPath $pidFile -Raw).Trim()
  if (-not [int]::TryParse($pidText, [ref] $processId)) {
    Write-Warning "Ignoring invalid PID file for $Name."
    Remove-Item -LiteralPath $pidFile -Force
    return
  }

  if (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
    Write-Host "Stopping $Name process tree (PID $processId)..."
    & taskkill.exe /PID $processId /T /F | Out-Null
  }
  else {
    Write-Host "$Name is already stopped."
  }

  Remove-Item -LiteralPath $pidFile -Force
}

Stop-TrackedProcess -Name 'frontend'
Stop-TrackedProcess -Name 'backend'

try {
  & (Join-Path $PSScriptRoot 'stop-database.ps1')
  Write-Host 'Database container stopped; its persistent volume was retained.'
}
catch {
  Write-Warning "Frontend and backend were stopped, but Docker could not be stopped: $($_.Exception.Message)"
}

Write-Host 'Student Assignment Tracker services are stopped.'
