const googleT = require('./translate.js');
const webutils = require('./webutils.js');
const db = require('./db.js');
const simabot = require('./simabot.js');
const textdb = require('./textdb.js');
const wordutils = require('./wordutils.js');
const nnotifer = require('./newnotifer.js');
const aoid = require('./modules/aoid.js');
const web = require('./modules/web.js');
const fs = require('fs');
const pjf = require('./package.json');
const axios = require('axios');
var useBeta = false;

if(process.env.BETA == "1"){
  useBeta = true;
}

var secret = null;
if(process.env.SECRET){
  try {
    secret = JSON.parse(process.env.SECRET);
  } catch (error) {
    console.log(textdb.strings.secretError);
    process.exit(1);
  }
}else{
   // secret2 uses base64
  if (process.env.SECRET2) {
    try {
      secret = JSON.parse(Buffer.from(process.env.SECRET2, 'base64').toString());
    } catch (error) {
      console.log(textdb.strings.secret2Error);
      process.exit(1);
    }
  } else {
    // check if file exists
    if(fs.existsSync('./secret/secret.json')){
      secret = require('./secret/secret.json');
    }else{
      console.log('No secret file found. Please create one.');
      process.exit();
    }
  }
}

async function envGenerate(){
  const content = "SECRET2='" + Buffer.from(JSON.stringify(secret)).toString('base64') + "'";
  // check if file exists
  if(fs.existsSync('.env')){
    var fileContent = null;
    try {
      fileContent = fs.readFileSync('.env', 'utf8');
    } catch (error) {
      return console.log(error);
    }
    if (typeof fileContent === 'string') {
      if(fileContent.indexOf(content) > -1){
        return;
      }
    }
  }
  fs.writeFileSync('.env', content);
  console.log(textdb.strings.envGenerated);
}

envGenerate();
db.init(secret);

if(typeof github == 'object'){
  github.setSecret(secret);
}

var services = {};
var modules = {};
var internal = {
  getStatus: getStatus,
  log: log,
  textdb: textdb,
  db: db,
  wordutils: wordutils,
  webutils: webutils,
  modules: modules,
  secret: secret
};

var enabledServices = ['discord', 'telegram'];
var enabledModules = ['random', 'aoid', 'web', 'music-discord']; //'github'
var service = {
  for: function(name, ...args){
    for (let i = 0; i < enabledServices.length; i++) {
      const serviceName = enabledServices[i];
      if(service[serviceName]){
        if(service[serviceName][name]){
          service[serviceName][name](...args);
        }
      }
    }
  },
  log: function(msg){
    service.for('log', msg);
  }
};

function initModules() {
  for (let i = 0; i < enabledModules.length; i++) {
    const moduleName = enabledModules[i];
    try {
      modules[moduleName] = require('./modules/' + moduleName + '.js');
      if (modules[moduleName].init){
        modules[moduleName].init(internal);
      }
    }
    catch (error) {
      modules[moduleName] = null;
      log(textdb.strings.moduleError + ': ' + moduleName, error);
    }
  }
}
function initServices(){
  const secretBranch = secret[branchName];
  for (let i = 0; i < enabledServices.length; i++) {
    const name = enabledServices[i];
    const secretService = secretBranch[name];
    try {
      services[name] = require('./services/' + name + '.js');
      services[name].init(secretService, internal);
    } catch (error) {
      services[name] = null;
      log(textdb.strings.serviceInitError + ': ' + name, error);
    }
  }
}

var branchName = 'stable';
if(useBeta){
  branchName = 'beta';
}
db.setBranch(branchName);
db.setDebug(useBeta);

function log(e, type) {
  var msg = '';
  if(!type){
    type = textdb.strings.error;
  }
  msg = type + ":\n```javascript\n" + String(e).substring(0, 1900) + '```';
  msg += '> (SimaBot⚡) Bot name: ' + textdb.strings.botName + ' v' + String(pjf.version);
  msg += '\n**' + textdb.strings.running + ' ' + branchName + '**';
  if (typeof github == 'object'){
    github.newIssue(String(e).substring(0, 50) + ' ' + textdb.strings.botName + ' ' + branchName + ' v' + String(pjf.version), msg.substring(0, 5000));
  }
  if (useBeta){
		console.log([msg]);
	}
  service.log(msg);
}

process.on('warning', e => console.warn(e.stack));

function secToTime(seconds) {
  const s = Number(seconds);
  var date = new Date(0);
  date.setSeconds(s);
  const timeString = date.toISOString().split('T')[1].split('.')[0];
  const days = Math.floor(s / 86400);
  if (days > 0) {
    return days + ' ' + textdb.strings.days + ' ' + timeString;
  } else {
    return timeString;
  }
}
const uptime = Math.round((new Date()).getTime() / 1000);
function getStatus() {
  const currentTime = Math.round((new Date()).getTime() / 1000);
  const msg = 'v' + pjf.version + ' ⏰ ' + (new Date()).toUTCString() + ' 🔌 ' + secToTime(currentTime - uptime);
  return msg;
}

process.on('uncaughtException', function (error) {
  log(error.stack, textdb.strings.globalError);
});

async function notifer_send(){
  var msgs = await nnotifer.checkUpdates();
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    const serviceName = msg.guildid.split('.')[0];
    const isDM = serviceName.indexOf('dm') > -1;
    // TODO: custom language
    var success = false;
    try{
      for (let i = 0; i < enabledServices.length; i++) {
        const name = enabledServices[i];
        if (serviceName.startsWith(name)) {
          if(services[name]){
            if(services[name].sendNotify){
              const output = services[name].sendNotify(msg, isDM);
              if(!success){
                if(output){
                  success = true;
                }
              }
            }
          }
        }
      }
    }
    catch(err){
      if(useBeta){
        console.log(err);
      }
    }
    if (success){
      msgs.slice(i, 1);
    }
    // remove msg
  }
}

const SimaBot = async function (msg){
  var serviceName = 'discord';
  var userid, nickname, guildId = 0, channelId = msg.channelId, isDM = false;
  var isOP = -1;
  guildId = msg.guildId;
  if(!!msg.from){
    serviceName = 'telegram';
    guildId = msg.chat.id;
    userid = msg.from.id;
    nickname = '@' + msg.from.username;
    channelId = guildId; 
    isDM = msg.chat.type == 'private';
  }else{
    // Discord
    userid = msg.author.id;
    nickname = '<@' + msg.author.id + '>';
    isDM = msg.guildId == null;
    if(isDM){
      guildId = userid;
    }
  }
  if(isDM){
    isOP = true;
  }
  if(isOP == -1){
    isOP = await services[serviceName].isOP(guildId, userid);
  }
  if(isDM){
    serviceName = serviceName + 'dm';
  }
  guildId = serviceName + '.' + guildId;
  const text = msg.text || msg.content;
  const translatedText = await googleT.toRu(text);
  
  if (text.indexOf(textdb.strings.domain + '/') > -1){
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
    console.log('TODO: remove globaldb and db.set from currentDB (314:app.js)');
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
internal.simabot = SimaBot;

function init() {
  nnotifer.init(db);
  initModules();
  initServices();
  notifer_send();
  setInterval(async function () {
    notifer_send();
  }, 1000 * 10);
}

init();
