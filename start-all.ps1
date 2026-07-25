$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

& .\start-database.ps1

Write-Host 'Opening backend and frontend development servers...'
$runDirectory = Join-Path $PSScriptRoot '.run'
New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null

$backendProcess = Start-Process powershell -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'start-backend.ps1') -PassThru
$frontendProcess = Start-Process powershell -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'start-frontend.ps1') -PassThru

Set-Content -LiteralPath (Join-Path $runDirectory 'backend.pid') -Value $backendProcess.Id
Set-Content -LiteralPath (Join-Path $runDirectory 'frontend.pid') -Value $frontendProcess.Id

Write-Host 'Services are starting:'
Write-Host '  Frontend: http://localhost:5173'
Write-Host '  Backend:  http://localhost:8081'
Write-Host '  MySQL:    localhost:3307'
Write-Host 'Run .\stop-all.ps1 to stop the complete stack.'
