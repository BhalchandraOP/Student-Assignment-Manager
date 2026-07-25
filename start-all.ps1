$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

& .\start-database.ps1

Write-Host 'Opening backend and frontend development servers...'
Start-Process powershell -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'start-backend.ps1')
Start-Process powershell -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'start-frontend.ps1')

Write-Host 'Services are starting:'
Write-Host '  Frontend: http://localhost:5173'
Write-Host '  Backend:  http://localhost:8081'
Write-Host '  MySQL:    localhost:3307'
