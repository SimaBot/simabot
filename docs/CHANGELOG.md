# TODO:
- Offline mode.
- Multiple instances of the bot.
- Remove unused dependencies.
- Better error handling.
- Disable discord log channel (use github issues).
- Automatic training.
- Disabled translator.
- Role assignment.
- Ban on certain channels.
- Account blocking.
- Ignore channels for bot.
- Self-learning.
- AI using brain.js.
- Telegram chat bridge.
- Minecraft chat bridge.
- Matrix chat bridge.
- Restream and Minecraft bridges bots detection.
- Brainly.
- Write news channels about simabot updates in general.
- Translated channels.
- Check edited messages.
- Detect explicit nicknames.
- Add TODO in SimaBot.
- Add Instagram/Facebook browser/downloader.

# Changes
## 3.3.2:
- Upgraded packages to latest versions.
- Fixed Telegram service.
- Optimized app.js.
## 3.3.1:
- Fixed https://github.com/SimaBot/simabot/issues/6
- Now you can bot can be in different servers in same time to play radio.
- You can change playlist and channel id for each server.
## 3.3.0:
- Fix (a is not defined at Object.exports.rss - webutils.js:553:33).
- Removed channels.js.
- Added resources/channels.json.
- textdb.js now json.
- Fixed bug: logs don't show in discord.
- NewNotifer now Notifer and it can be disabled.
## 3.2.0:
- Update packages to latest version.
- Not important parts moved to modules folder. (which can be disabled)
- Added services - allows simply add other chat messages systems support, like telegram, matrix, etc.
- Reworked uptime.
- Optimization and cleanup app.js.
- Fixed CHANGELOG.md.
## 3.1.6:
- Fixed https://github.com/SimaBot/simabot/issues/7
- Added README.md.
- Fixed CHANGELOG.md.
- Added webutils.createSprunge
- Moved rss and tgchannel to webutils.
## 3.1.5:
- Update all packages to latest version.
## 3.1.4:
- Ported simabot-closedsource to simabot
## 3.1.3:
- Porting simabot-closedsource to simabot.
- Added aoid - Always Online In Discord (see more info in docs/secret.md).
## 3.1.2:
- Reworked issue on GitHub.
## 3.1.1:
- Create issue on GitHub.
## 3.1.0:
- Auto convert secrets to environment variables.
- Beta mode when environment variable "BETA" is set "1".
- Progress: Moving string to textdb.
- Show URL in console for invite Discord bot.
## 3.0.5:
- Fixed bug with Repl.it.
- Initial NPM support.
## 3.0.4:
- Added support for Repl.it.
## 3.0.2:
- Forgot disable beta.
- Now runs web server, which allows to run the bot on repl.it.
## 3.0.1:
- SECRET2 environment variable, which is the same as SECRET, but encoded in base64.
## 3.0.0:
- Secret as environment variable (important).
- Tool to convert the secrets to environment variables.
## 2.9.9:
- Initial open-source release.

# Unkown
    //  (Sad to hear your leave) ${member}!
    // Welcome msg // TODO:
  // "{"q": ["test"], "a": "Test. Oh test, yes. I am SimaBot! By the way I am a bot. And thanks for the test. Oh test, yes, I like the test. When it just works, it\"s great. And I think I never fail in test. Good test easy, and which make smile. This test never gonna make your cry by the way. Writed by Test Test. Do you want be tester? Just be tester! Test make your life easier. Because it do not requires other test. Tester important in our life. Tester can find problem and report them to other. And it make them important in our life! Beta version not great, they requires test for final releases so make sure that you checked everything. One trouble can make a big problem. Make sure that you have enough testers! (Writen on back side of SimaBot) "}",
