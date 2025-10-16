$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
}

$body = @{
    personalizations = @(
        @{
            to = @(
                @{ email = "princesahu17125@gmail.com" }
            )
        }
    )
    from = @{
        email = "princesahu17125@gmail.com"
    }
    subject = "Test Email"
    content = @(
        @{
            type = "text/plain"
            value = "This is a test"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://api.sendgrid.com/v3/mail/send" -Method Post -Headers $headers -Body $body