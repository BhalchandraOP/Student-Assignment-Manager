$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'backend')

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  throw 'Java 21 or newer is required but was not found.'
}

Write-Host 'Starting the Spring Boot API at http://localhost:8081'
& .\mvnw.cmd spring-boot:run
if ($LASTEXITCODE -ne 0) {
  throw 'The Spring Boot API failed to start.'
}
