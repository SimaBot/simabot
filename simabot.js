const wordutils = require('./wordutils.js');
const webutils = require('./webutils.js');
const pjf = require('./package.json');
const translate = require('./translate.js');
const { database } = require('firebase-admin');

const errorMsg = '\nError! Contact with developer! https://simabot.github.io/';
var simabot = {
  lastMsgContainer: {} // Have lastMsg for different channelIDs
};

async function internet (keywords){
  var answ = await webutils.questionWikipedia(wordutils.bigFirstLetters(keywords.replaceAll('?', '')));
  if(answ){
    if (answ.indexOf('Wikipedia') > -1){
      return;
    }
    const translated = await translate.toRu(answ);
    if(translated){
      return translated;
    }
  }
}
async function command(data) {
  const cmd = data.out.replace('/', '');
  switch (cmd) {
    case 'internet':
      const inet = await internet(data.keywords);
      return inet || '???';
    case 'youtubesubs':
      return 'TODO youtubesubs';
    case 'videoyt':
      var url = await webutils.findVideo(data.keywords, '', true);
      if(url){
        return 'Пожалуйста, вот: ' + url;
      }
    case 'qrcode':
      return 'QR: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURI(data.keywords);
    case 'photo':
      var url = await webutils.searchImage(data.keywords);
      if(url){
        return '🌟📷: ' + url[0].image + ' .';
      }
    case 'goodword':
      return 'Похоже ничего не произошло, так как код не доделан!'; // TODO
      var kl = data.keywords.split(' ')[0];
      if(typeof kl != 'undefined'){
        if (notbadwords.indexOf(kl) != -1) {
          return nickname + ' Слово уже и так **в исключение** - "' + kl + '"';
        }else{
          notbadwords.push(kl)
          return nickname + ' Добавлено **в исключение** слово - "' + kl + '"';
        }
      }
    case 'db':
      if(data.isOP){
        return '/db';
      }else{
        return '👑 Вам нужны права администратора для использования данной команды!';
      }
    case 'wrongwrite':
      const fixed = wordutils.filterText(wordutils.convertWRTR(data.originalansw || data.msg));
      var msg = 'Попробую перевести...\n' + data.nickname + ' написал: ' + fixed + '\n';
      msg = fixed;
      const e = await exports.bot(data);
      if(e.out){
        msg += e.out;
      }
      return msg;
    case 'radioplay':
      return 'TODO: Add setting server specific, fix this code (simabot [line 72])';
      const a = originalansw.split(' ');
      var playId;
      for (var i = 0; i < a.length; i++) {
        const s = a[i];
        if(s.indexOf('://') > -1){
            const myURL = new URL(s);
            var idVideo;
            if(myURL.hostname == 'youtu.be'){
              idVideo = myURL.pathname.replace('/', '');
            }else{
              if(myURL.searchParams){
                idVideo = myURL.searchParams.get('v');
              }
            }
            if(idVideo){
              playId = idVideo;
          }
        }
      }
      if(playId){
        startMusic('https://youtube.com/watch?v=' + playId);
        return 'Слушаем';
      }else{
        return 'Ничего не обнаружено!';
      }
    default:
      return '/' + data.out;
  }
}
function filter(e){
  switch (e) {
    case 'PHOTO':
      return '/photo'
    case 'INTERNET':
      return '/internet'
    case 'WRONG-WRITING':
      return '/wrongwrite'
    case 'CALC':
      return '/calc'
    default:
      return e;
  }
}
exports.chooseOneOrTwo = function (one, two, question){
  const a = wordutils.compareSentexces(one, question);
  const b = wordutils.compareSentexces(two, question);
  if(a > b){
    return one;
  }
  return two;
}
exports.bot = async function (data) {
  /*
  data: {
  msg, userid, isOP, nickname, 
  isDM,
  id, badwords, goodwords, capsPercent,
  detectionBadwordsPercent,
  detectionRateKeyword, detectionRate,
  blockAd, detectSpam
}
  */
 var originalansw, msg;
  msg = String(data.msg).toLowerCase();
  if(data.originalansw){
    originalansw = String(data.originalansw);
  }else{
    originalansw = String(data.msg);
  }
  if(!data.channelid){
    data.channelid = 0;
  }
  if(originalansw == 'undefined'){
    originalansw = msg;
  }
  if (!data.botdb){
    return 'Code: 01' + errorMsg;
  }
  if(data.botdb.length == 0){
    return 'Code: 02' + errorMsg;
  }
  
  const reason = '🔥: || ' + originalansw + ' || 👤: ' + (data.nickname || '?') + ' ' + ' ❓: ';

  if(!data.isDM){
    if(data.detectSpam || true){
      const urls = webutils.urlsArray(originalansw);
      for (var i = 0; i < urls.length; i++) {
        const url = urls[i];
        const check = await webutils.isSecure(url);
        if (check == false) {
          return { action: 'remove', reason: reason + 'Spam' };
        }
      }
    }
    const containBadWord = wordutils.containBadWord(msg.toLowerCase(), data.badwords || ['короче'], data.goodwords || ['привет'], data.detectionBadwordsPercent || 60);
    if (containBadWord){
      return { action: 'remove', reason: reason + 'Bad words: ||' + containBadWord + '||' };
    }
    if(wordutils.percentOfCAPS(originalansw) > (data.capsPercentDetection || 50)){
      if(msg.toLowerCase() != msg.toUpperCase()){
        return { action: 'remove', reason: reason + 'CAPS' };
      }
    }
    if(msg != 'undefined'){
      if(simabot.lastMsgContainer[data.channelid] == msg && simabot.lastMsgContainer[data.channelid] != ''){
        return { action: 'remove', reason: reason + 'FLOOD' };
      }
    }
    const array = originalansw.split(' ');
    if(data.blockAd || true){
      for (let i = 0; i < array.length; i++) {
        const a = array[i];
        if (a.includes('discord.gg/') || a.includes('discordapp.com/invite/')) {
          const guildId = await webutils.getGuildIdByInvite(a);
          if (guildId) {
            if (guildId != data.guildId) {
              return { action: 'remove', reason: reason + 'Promotion' };
            }
          }
        }
      }
    }
  }
  simabot.lastMsgContainer[data.channelid] = msg;
  const isqoraOut = wordutils.isQorA(msg, data.channelid, data.botdb);
  const isqora = isqoraOut[0];
  const newBotDB = isqoraOut[1];
  var c;
  try {
    c = wordutils.battleSentexces(wordutils.arrayOfQuestions(data.botdb), msg);
  }catch(err){
    return { out: 'Error in botdb:' + err.message.split('\n')[0] };
  }
  const rule = wordutils.getRuleByAQ(msg, data.botdb);
  data.out = wordutils.getRandomAnswer(rule, data.botdb);
  data.out = filter(data.out);
  data.out = data.out.replaceAll('${pjf.version}', pjf.version);
  data.keywords = wordutils.getKeyword(wordutils.getQuestions(rule, data.botdb), msg, data.detectionRateKeyword || 60);
  if(data.out == '/calc'){
    const v = wordutils.calculator(originalansw);
    if(v == ''){
      return {out: v};
    }else{
      return {out: 'Ответ: ' + v};
    }
  }
  const inet = await internet(data.keywords);
  if (c[0] > (20)){
    if(data.out[0] == '/'){
      data.out = await command(data);
    }else{
      if (inet) {
        return { out: exports.chooseOneOrTwo(inet, data.out, msg), newBotDB: newBotDB };
      }
    }
    return { out: data.out, newBotDB: newBotDB};
  }
}

function askquestion () {
  rdline.question('Я: ', m => {
    // simpleLog('Я: ' + m)
    if(m != 'закрыть' && m != 'выключить'){
      exports.bot({
        msg: m,
        nickname: 'User',
        userid: 0,
        isOP: true,
        botdb: ['{"q": "Hello", "a": "Hi!"}'],
        badwords: ['короче']
      }).then(function (e) {
        console.log('SimaBot: ' + e[0]);
        askquestion();
      })
    }else {
      console.log('До следуйшей встречи!');
      process.exit();
    }
  });
}
const debug = false;
if(debug){
  const readline = require('readline');
  rdline = readline.createInterface({
     input: process.stdin,
     output: process.stdout
  });
  askquestion();
}
