process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
// const Discordself = require("discord-user-bots");
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const googleT = require('./translate.js');
const random = require('./random.js');
const webutils = require('./webutils.js');
const db = require('./db.js');
const simabot = require('./simabot.js');
const textdb = require('./textdb.js');
const wordutils = require('./wordutils.js');
const music = require('./music.js');
const nnotifer = require('./newnotifer.js');

// const clientself = new Discordself.Client(secret.selfdiscord);
const robot = new Discord.Client({partials: ["CHANNEL"],
intents: [
  'GUILDS',
  'GUILD_VOICE_STATES',
  'GUILD_MESSAGES',
  'DIRECT_MESSAGES'
],
});
const fs = require('fs');
const pjf = require('./package.json');
const he = require('he');
const axios = require('axios');

// ------- Important -------
const useBeta = false;
const envGenerate = false;
// -------------------------

var secret = null;
if(process.env.SECRET){
  try {
    secret = JSON.parse(process.env.SECRET);
  } catch (error) {
    console.log('Secret is not valid JSON');
    process.exit(1);
  }
}else{
  // check if file exists
  if(fs.existsSync('./secret/secret.json')){
    secret = require('./secret/secret.json');
  }else{
    console.log('No secret file found. Please create one.');
    process.exit();
  }
}
if(envGenerate){
  fs.writeFileSync('.env', "SECRET='" + JSON.stringify(secret) + "'");
  console.log('Generated .env file');
  process.exit();
}

db.init(secret);

const allowCrash = false;
const enableConsole = useBeta;
const selfBot = false;

var branchName = 'stable';
if(useBeta){
  branchName = 'beta';
}
db.setBranch(branchName);
db.setDebug(useBeta);

const tgEnabled = true;

var users = [];

var tgbot;

function log(e, type) {
  var msg = '';
  var idLogChannel = textdb.strings.idLogChannel;
  if(useBeta){
    idLogChannel = textdb.strings.idLogChannelBeta;
  }
  if(!type){
    type = 'Error';
  }
  msg = type + ":\n```javascript\n" + String(e).substring(0, 1900) + '```';
	msg += '> SIMABOT v' + String(pjf.version);
	if(useBeta){
		msg += '\n**RUNNING BETA VERSION**';
	}
	if(enableConsole){
		console.log(msg);
	}
	try {
		var logCh = robot.channels.cache.get(idLogChannel);
		logCh.send(msg);
	} catch (e) {
		console.log(e);
	} finally {

	}

}


function managerRoles(name, msg, give) {
  const role = msg.guild.roles.cache.find(role => role.name === name);
  const id = msg.author.id;
  const member = msg.guild.members.cache.get(id);
  if (!role){
    return;
  }
  if(member.roles.cache.has(role.id)) {
    if(give){
      return ', у вас уже есть роль: **' + name + '**';
    }else{
      member.roles.remove(role).catch(console.error);
      return ', -Role: **' + name + '**';
    }
  }else{
    if(give){
      member.roles.add(role)
      return ', +Role: **' + name + '**';
    }else{
      return ', у вас и до этого не было роли: **' + name + '**';
    }
  }
}

process.on('warning', e => console.warn(e.stack));

function giveRole(name, msg) {
  return managerRoles(name, msg, true);
}
function removeRole(name, msg) {
  return managerRoles(name, msg, false);
}
async function banHandle() { //TODO: No ban
  const z = await db.collection('users').where('banned', '==', true).get();
  z.forEach(doc => {
    var data = doc.data();
    if(data.bantimer != 0){
      data.bantimer--;
      db.collection("users").doc(doc.id).set(data);
    }
    if(data.bantimer == 0){
      data.banned = false;
      db.collection("users").doc(doc.id).set(data);
      try {
        robot.users.fetch(userid).then((user) => {
            const server = robot.guilds.cache.get('serverID'); // TODO
            const target = server.members.cache.get(userid);
            target.ban({ reason: 'Нарушение правил!' });
            createUser(userid);
            user.send(textdb.unbanMsg,{
              files: [textdb.unbanImg]
            });
        });
      } catch {
      }
    }
  });
}

var discordtoken = secret[branchName].discord;
let discordpassword = secret.password;

var uptime = 0;

function secToTime(seconds) {
  const s = Number(seconds);
  var date = new Date(0);
  date.setSeconds(s);
  const timeString = date.toISOString().split('T')[1].split('.')[0];
  const days = Math.floor(s / 86400);
  if (days > 0) {
    return days + ' days ' + timeString;
  } else {
    return timeString;
  }
}

function changeStatus(){
	const time = (new Date()).toUTCString();
  const msg = 'v' + pjf.version + ' ⏰ ' + time + ' 🔌 ' + secToTime(uptime);
  robot.user.setPresence({ activities: [{ name: msg }], status: 'idle' });
	uptime++;
}

robot.on('guildMemberAdd', async member => {
  const cfg = await db.getCfgServer('discord.' + member.guild.id);
  if(!welcomeId){
    return;
  }
  try {
    const welcomeChannel = robot.channels.cache.get(cfg.welcomeId);
    welcomeChanne.send(wordutils.replaceAll(cfg.welcomeMsg, member));
    for (let i = 0; i < cfg.welcomeDm.length; i++) {
      const text = cfg.welcomeDm[i];
      const urls = webutuils.urlsArray(text);
      if(urls) {
        member.send({
          files: urls
        });
      }else{
        member.send(text);
      }
    }
  } catch (e) {
    
  }
});

if(!allowCrash){
  robot.on('error', error => {
    log(error, 'Robot Error');
  });
}

robot.on("guildMemberRemove", async member => {
  const cfg = await db.getCfgServer('discord.' + member.guild.id);
  if (cfg.welcomeId){
    try {
      const msg = robot.channels.cache.get(cfg.welcomeId);
      msg.send(wordutils.replaceAll(cfg.leaveMsg, member));
    }
    catch {

    }
  }
});

function robotready() {
  notifer_send();
  music.init(robot);
  var oldInfoMusic = null;
  setInterval(async function(){
    notifer_send();
  }, 1000 * 10);
  setInterval(async function() {
    if (music.getInstances().length > 0) {
      const info = music.getInstances()[0].info;
      if (oldInfoMusic != info) {
        await db.setRadio(info);
      }
      oldInfoMusic = info;
    }
  }, 1000);
  if (!allowCrash) {
    process.on('uncaughtException', function (error) {
      log(error.stack, 'Global Error');
    });
  }
  changeStatus();
  setInterval(changeStatus, 1000);
}

async function notifer_send(){
  var msgs = await nnotifer.checkUpdates();
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    const serviceName = msg.guildid.split('.')[0];
    const isDM = serviceName.indexOf('dm') > -1;
    // TODO: custom language
    try{
      if(serviceName.startsWith('telegram')){
        tgbot.sendMessage(msg.channel, msg.msg);
      }
      if(serviceName.startsWith('discord')){
        if(isDM){
          robot.users.fetch(msg.guildid.split('.')[1]).then((user) => {
            user.send(msg.msg);
          });
        }else{
          const channel = robot.channels.cache.get(msg.channel);
          channel.send(msg.msg);
        }
      }
    }
    catch(err){
      if(useBeta){
        console.log(err);
      }
    }
    // remove msg
    msgs.slice(i, 1);
  }
}

const virtdb = {
  set: async function (serverId, namedb, array, cloud) {
    const out = await db.set(serverId, namedb, array, cloud);
    return out;
  },
  get: async function (serverId, namedb) {
    const out = await db.get(serverId, namedb);
    return out;
  },
  ls: async function (namedb) {
    const out = await db.ls(namedb);
    return out;
  }
};

function initialize() {
  nnotifer.init(db);
	robot.login(discordtoken);
  robot.on("ready", robotready);
  if (tgEnabled) {
    tgbot = new TelegramBot(secret[branchName].telegram, { polling: true });
  }
  main();
}
function isOutsideAcc(userid) {
  return String(Number(userid)) == 'NaN';
}

function nicknames(msg) {
  return '@' + msg.author.username + '#' + msg.author.discriminator;
}
async function checkAdminTG (chatId, userid) {
  const array = await tgbot.getChatAdministrators(chatId);
  for (let i = 0; i < array.length; i++) {
    const user = array[i].user;
    if(user.id == userid){
      return true;
    }
  }
  return false;
}

const SimaBot = async function (msg){
  var serviceName = 'discord';
  var userid, nickname, guildId = 0, channelId = msg.channelId, isDM = false;
  var isOP = false;
  guildId = msg.guildId;
  if(!!msg.from){
    serviceName = 'telegram';
    guildId = msg.chat.id;
    userid = msg.from.id;
    nickname = '@' + msg.from.username;
    channelId = guildId; 
    isDM = msg.chat.type == 'private';
    if(isDM){
      isOP = true;
    }else{
      isOP = await checkAdminTG(guildId, userid);
    }
  }else{
    // Discord
    userid = msg.author.id;
    nickname = '<@' + msg.author.id + '>';
    isDM = msg.guildId == null;
    if(isDM){
      guildId = userid;
      isOP = true;
    }else{
      const member = robot.guilds.cache.get(guildId).members.cache.get(msg.author.id);
      isOP = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    }
  }

  if(isDM){
    serviceName = serviceName + 'dm';
  }
  guildId = serviceName + '.' + guildId;
  const text = msg.text || msg.content;
  const translatedText = await googleT.toRu(text);
  
  if (text.indexOf('simabot.github.io/') > -1){
    if(!isOP){
      return textdb.strings.noOP;
    }
    const out = await nnotifer.addNotify(text, guildId, channelId);
    if(out){
      return '⚠️: ' + out + '\n🔗: ' + textdb.strings.websiteURL;
    }else{
      return '✅';
    }
  }
  const mainDB = await db.getGuildDB(0);
  var currentDB = {};
  if(guildId != 0){
    currentDB = await db.getGuildDB(guildId);
    currentDB = db.mergeObjects(mainDB, currentDB);
  }else{
    currentDB = mainDB;
  }
  const botdb = db.botdb().concat(currentDB.botdb);
  const cfgServer = await db.getCfgServer(guildId);

  const config = {
    msg: translatedText || text,
    userid: userid,
    nickname: nickname,
    isDM: isDM,
    originalansw: text,
    channelid: channelId,
    botdb: botdb,
    badwords: currentDB.badwords,
    goodwords: currentDB.goodwords,
    capsPercent: cfgServer.capsPercent,
    detectionBadwordsPercent: cfgServer.detectionBadwords,
    detectionRateKeyword: cfgServer.detectionRateKeyword,
    detectionRate: cfgServer.aiPercent,
    isOP: isOP,
    blockAd: cfgServer.blockAd,
    detectSpam: cfgServer.detectSpam
  };
  const out = await simabot.bot(config);
  if(!out){
    return;
  }
  if(out.action){
    if(out.action == 'remove'){
      return {
        action: out.action,
        idModChannel: cfgServer.idModChannel,
        reason: out.reason
      };
    }
  }
  if(!out.out){
    return;
  }
  if(out.out[0] == '/'){
    const cmd = out.out.replaceAll('/', '');
    switch (cmd) {
      case 'db':
        return await db.helper(text, guildId, userid);
      default:
        return;
    }
  }
  if(out.newBotDB){
    console.log('TODO: remove globaldb and db.set from currentDB (272:app.js)');
    // await db.set(guildId, 'botdb', out[1]);
  }
  const needTranslate = false; // TODO
  if (out.out){
    var textout = wordutils.fixText(out.out);

    if(!needTranslate){
      return textout;
    }
    //TODO: Custom language, single language mode, specific language to user profile.
    var out2 = await googleT.toEn(out.out);
    if (out2) {
      const fixed = wordutils.fixText(out2);
      if (fixed != textout) {
        textout += '\n🇺🇸: ' + fixed;
      }
    }
    return textout;
  }
} 
function main (){
  tgbot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const isDM = msg.chat.type == 'private';
    const lang = msg.from.language_code;
    const bot = await SimaBot(msg);
    const messageId = msg.message_id;
    if (bot) {
      var out = bot.substring(0, 4095);
      if(out.startsWith('!!!')){
        try{
          
        }catch(err){
          tgbot.deleteMessage(chatId, messageId);
        }
      }else{
        tgbot.sendMessage(chatId, out);
      }
    }
  });
  robot.on('messageCreate', async msg => {
    if (msg.author.id == robot.user.id) {
      return;
    }
    var out = await SimaBot(msg);
    if(out){
      if (typeof out == 'object') {
        if (out.action == 'remove') {
          msg.delete();
          const modChannel = robot.channels.cache.get(out.idModChannel);
          if(modChannel){
            modChannel.send(out.reason);
          }
        }
      }
      if (typeof out == 'string') {
        out = out.substring(0, 1999);
        msg.channel.send(out);
      }
    }
  });
}

initialize();
