$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCommand) {
  throw 'docker.exe is not available in this PowerShell session. Run this script from the shell where the docker command works, or add docker.exe to PATH.'
}

& $dockerCommand.Source compose down
