# Secret directory information
## fb.json

### What is it?
This is a JSON file that contains the credentials for the Firebase service account.

### Content
```json
{
  "type": "service_account",
  "project_id": "HIDDEN",
  "private_key_id": "HIDDEN",
  "private_key": "HIDDEN",
  "client_id": "HIDDEN",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "HIDDEN",
  "databaseURL": "HIDDEN"
}

```
## secret.json

### What is it?
This is a JSON file that contains the credentials for the Discord bot, Telegram bot, Beta versions.
```json
{
    "stable": {
        "discord": "Your token for Discord bot",
        "telegram": "Your token for Telegram bot"
    },
    "beta": {
        "discord": "Your token for Discord bot",
        "telegram": "Your token for Telegram bot"
    }
}
```
You don't need beta credentials, if you don't want to use beta mode.