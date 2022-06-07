// 1. Discord vote -> Telegram
// 2. React to vote msg
if (msg.channel.name.indexOf('vote') > -1) {
  send(null, '<>TELEGRAM<>Голосуем!(Используйте коментарии, пишите + или -):\Voting!(Use comments, write + or -):\n' + msg.content);
  msg.react('793196301634240535');
  msg.react('793196469926494218');
}
// 
const isnotdm = msg.guildId != null;
if (msg.author.id != robot.user.id) {
  const isallowechannel = true;// ignoredChannels.indexOf(String(msg.channel.id)) == -1;
  if (isnotdm) {

    if (isallowechannel) {
      try {
        var pingsender = '<@' + msg.author.id + '>';
        const nicknamesender = nicknames(msg);
        var txtmsg = String(msg.content);
        var fulltxtmsg = txtmsg;
        var outAcc = false;
        var userid = msg.author.id;
        if (msg.author.id == minecraftUserID) {
          if (txtmsg.indexOf('»') != -1) {
            txtmsg = txtmsg.replaceAll('**', '').split(' » ')[1];
            userid = pingsender = msg.content.replaceAll('**', '').split(' » ')[0].split(']')[1].replaceAll('~', '')
            outAcc = true;
          } else {
            return;
          }
        } else {
          if (msg.author.id == restreamUserID) {
            userid = pingsender = txtmsg.split('] ')[0].split(': ')[1];
            txtmsg = msg.content.split('] ')[1];
            outAcc = true;
          }
        }
        const originalmsg = txtmsg;
        var txtmsg2 = modules.translate.toRu(txtmsg);
        if (txtmsg2 == '') {
          txtmsg = txtmsg;
        } else {
          txtmsg = txtmsg2;
        }
        const bot = await simabot.bot({
          msg: textmsg,
          userid: msg.author.id,
          nickname: pingsender,
          originalMsg: msg.content,
          channelid: msg.channelId,
          idDM: false
        });
        // TODO: use ignoreAI
        // const isbotchannel = botChannel.indexOf(String(msg.channel.id)) != -1;
        // if(isbotchannel){
        msg.react('👀');
        if (bot[0] == '/') {
          const cmd = bot.replace('/', ' ');
          if (cmd == 'stat') {
            var stat;
            if (msg.mentions.users.size == 1) {
              stat = await db.stat(msg.mentions.users.first().id, msg.guildId);
              db.addCoin(2, userid, msg.guildId);
            } else {
              stat = await db.stat(msg.author.id, msg.guildId);
              db.addCoin(5, userid, msg.guildId);
            }
            if (stat) {
              msg.channel.send(stat);
            }
            return;
          }
          if (cmd.startsWith('bad')) {
            msg.delete();
            msg.channel.send(pingsender + wordutils.getWarnText(e)); // TODO: Need count stars for getWarnText
            const stars = db.giveBadstar(msg.guildId, msg.author.id);
            if (stars > 14) { // TODO: Need reworking!: custom stars, ban or mute, custom msg, ban in MC, restream (hard), custom time 
              if (isOutsideAcc(userid)) {
                robot.channels.cache.get(consoleMC).send('ban ' + + ' 30d Нарушение правил!');
              } else {
                data.banned = true;
                data.bantimer = 44640;
                try {
                  if (!msg.member.hasPermission("BAN_MEMBERS")) {
                    const target = msg.guild.members.cache.get(member);
                    target.ban({ reason: 'Нарушение правил!' });
                    robot.users.fetch(userid).then((user) => {
                      user.send(textdb.banMsg, {
                        files: ["https://cdn.discordapp.com/attachments/808726358481567764/808748990162141244/tenor.gif"]
                      });
                    });
                  }
                }
                catch {
                }
              }
            }
            return;
          }

        } else {
          if (bot == '???') {
            return msg.react('❔');
          }
          if (webutils.urlsArray(bot)) {
            db.addCoin(4, userid, msg.guildId);
          }
          const enBot = await modules.translate.toEn(e);
          msg.channel.send((bot + '\n:flag_us: ' + enBot).substring(0, 1999));
          db.addCoin(4, userid, msg.guildId);
        }
        if (!outAcc) {
          const role = e.substring(1);
          if (e[0] == '$') {
            e = pingsender + giveRole(role, msg);
          }
          if (e[0] == '!') {
            e = pingsender + removeRole(role, msg);
          }
        }
        modules.translate.impl(robot, msg, speakChannel, newsChannel, translationChannel, pingsender, newsChannelEng, jojoChannelRUS, jojoChannelENG, send);
      }
          }catch (e) {
      log(e, 'Error');
    }
  }

// unused
  function alz(chunk, userid, thisuser, muteRoleId) {
    if (!instanceRadio.detectsLoud[userid]) {
      instanceRadio.detectsLoud[userid] = 0;
    }
    var m = 0x00;
    for (var i = 0; i < chunk.length; i++) {
      m += chunk[i];
    }
    m = m / chunk.length;
    if (instanceRadio.scanUserTimer[userid] == undefined) {
      console.log('Start!');
      instanceRadio.scanUserTimer[userid] = 100;
    } else {
      if (instanceRadio.scanUserTimer[userid] == 0) {
        instanceRadio.scanUserTimer[userid]--;
        instanceRadio.detectsLoud[userid] = instanceRadio.detectsLoud[userid] / (100);
        console.log('Analyzed! - ' + instanceRadio.detectsLoud[userid]);
      } else {
        if (instanceRadio.scanUserTimer[userid] > 0) {
          if (m != 0) {
            console.log(instanceRadio.scanUserTimer[userid]);
            instanceRadio.scanUserTimer[userid]--;
            instanceRadio.detectsLoud[userid] += m;
          }
          return;
        }
      }
    }
    /*
    volumeUsers: {},
    scanUserTimer: {} */

    // 160 BAD
    // simpleLog(m, userid);
    const v = m / instanceRadio.detectsLoud[userid];
    console.log(v);
    if (m > 135) {
      instanceRadio.detectsLoud[userid]++;
    }
    if (instanceRadio.detectsLoud[userid] > 30) {
      thisuser.roles.add(muteRoleId);
      instanceRadio.detectsLoud[userid] = 0;
      setTimeout(function () {
        try {
          thisuser.roles.remove(muteRoleId);
        } catch (e) {

        }
      }, 1000 * 60);
    }
  }
  process.setMaxListeners(0);

  function louddetector(id) {
    const thisuser = guildDiscord.members.cache.get(id);
    if (doesUserIDInVC(voiceChannel, id)) {
      const audio = instanceRadio.connectionRadio.receiver.createStream(id, { mode: 'pcm', end: 'manual' });
      var detects = 0;
      const muteRoleId = guildDiscord.roles.cache.get('');
      audio.on("data", function (e) {
        alz(e, id, thisuser, muteRoleId);
      });
      return audio;
    } else {
      return;
    }
  }
