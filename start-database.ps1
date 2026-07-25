$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Test-MySqlPort {
  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connection = $client.BeginConnect('127.0.0.1', 3307, $null, $null)
    if (-not $connection.AsyncWaitHandle.WaitOne(1500)) {
      return $false
    }
    $client.EndConnect($connection)
    return $true
  }
  catch {
    return $false
  }
  finally {
    $client.Dispose()
  }
}

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCommand) {
  if (Test-MySqlPort) {
    Write-Host 'MySQL is already available on localhost:3307; Docker CLI check skipped.'
    return
  }
  throw 'MySQL is not running and docker.exe is not available in this PowerShell session. Start Docker from the shell where the docker command works, or add docker.exe to PATH.'
}

$originalErrorActionPreference = $ErrorActionPreference
try {
  # Windows PowerShell 5.1 treats harmless Docker stderr warnings as errors.
  # Docker's process exit code is the reliable success indicator.
  $ErrorActionPreference = 'Continue'
  & $dockerCommand.Source info *> $null
  $dockerInfoExitCode = $LASTEXITCODE
}
finally {
  $ErrorActionPreference = $originalErrorActionPreference
}

if ($dockerInfoExitCode -ne 0) {
  throw 'Docker is installed, but its engine is not running. Start Docker Desktop and try again.'
}

Write-Host 'Starting the Student Assignment Tracker MySQL database...'
try {
  $ErrorActionPreference = 'Continue'
  & $dockerCommand.Source compose up -d --wait mysql
  $composeExitCode = $LASTEXITCODE
}
finally {
  $ErrorActionPreference = $originalErrorActionPreference
}

if ($composeExitCode -ne 0) {
  throw 'The MySQL container failed to start. Run docker compose logs mysql for details.'
}

Write-Host 'MySQL is healthy and available on localhost:3307.'
Write-Host 'Database: student_assignment_tracker | User: tracker_app'
