$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'backend')

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  throw 'Java 21 or newer is required but was not found.'
}

# Load .env file from project root if present
$envFile = Join-Path $PSScriptRoot '.env'
if (Test-Path -LiteralPath $envFile) {
  Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
      $parts = $line.Split('=', 2)
      $name = $parts[0].Trim()
      $val = $parts[1].Trim()
      [System.Environment]::SetEnvironmentVariable($name, $val, 'Process')
    }
  }
}

# Apply default project database credentials to avoid conflicting system-level variables
if (-not $env:DB_USERNAME -or $env:DB_USERNAME -eq 'root') {
  $env:DB_USERNAME = 'tracker_app'
}
if (-not $env:DB_PASSWORD -or $env:DB_PASSWORD -eq 'RaNa@#1312$%') {
  $env:DB_PASSWORD = 'tracker_dev_password'
}
if (-not $env:DB_PORT) {
  $env:DB_PORT = '3307'
}

Write-Host 'Starting the Spring Boot API at http://localhost:8081'
& .\mvnw.cmd spring-boot:run
if ($LASTEXITCODE -ne 0) {
  throw 'The Spring Boot API failed to start.'
}

