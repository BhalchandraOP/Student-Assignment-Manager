$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'Node.js and npm are required. Install Node.js 20 LTS or newer and try again.'
}

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules'))) {
  Write-Host 'Installing frontend dependencies...'
  npm install
  if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }
}

Write-Host 'Starting Student Assignment Tracker at http://localhost:5173'
npm run dev
