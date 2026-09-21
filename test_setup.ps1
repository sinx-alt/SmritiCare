$base = "http://localhost:8000"
$loginBody = @{ email = "demo.patient@example.com"; password = "test1234" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $loginResp.access_token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Logged in. Token loaded into `$headers. Patient ID: $($loginResp.id)" -ForegroundColor Green