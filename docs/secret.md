# Secret directory information
## secret.json

### What is it?
This is a JSON file that contains the credentials for the Firebase service account, for the Discord bot, Telegram bot, Beta versions.

### Content
```json
{
    "stable": {
        "discord": "Your token for Discord bot",
        "telegram": "Your token for Telegram bot"
    },
    "beta": {
        "discord": "Your token for Discord bot",
        "telegram": "Your token for Telegram bot"
    },
  "type": "service_account",
  "project_id": "HIDDEN",
  "private_key_id": "HIDDEN",
  "private_key": "HIDDEN",
  "client_id": "HIDDEN",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "HIDDEN",
  "databaseURL": "HIDDEN",
  "aoid": [{
    "token": "token",
    "status": {
    "text": "Always Online In Discord",
    "emoji": {
        "id": null,
        "name": "ð¿",
        "animated": false
      },
    "status": "online",
    "afk": false
    }
  }]
}
```
You don't need beta credentials, if you don't want to use beta mode.

Aoid not required, if you don't want to use Always Online In Discord module.
Aoid logins to user and set status. Supports multiple accounts.
