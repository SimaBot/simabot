const entertainment = require('./entertainment.js');
// const fourpda = require('./fourpda.js');
const vk = require('./vk.js');
const roblox = require('./roblox.js');
const webutils = require('./webutils.js');
const simabot = require('./simabot.js');
const translate = require('./translate.js');;
const superweb = require('./superweb.js');
const wordutils = require('./wordutils.js');

const animelist = [{'id': '893721', 'name': 'One Piece', 'url': 'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_One_Piece'},
{'id':'8737539', 'name': 'Boruto: Naruto Next Generations', 'url':'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_Boruto:_Naruto_Next_Generations'},
{'id':'8768654', 'name': 'That Time I Got Reincarnated as a Slime', 'url':'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9E_%D0%BC%D0%BE%D1%91%D0%BC_%D0%BF%D0%B5%D1%80%D0%B5%D1%80%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B8_%D0%B2_%D1%81%D0%BB%D0%B8%D0%B7%D1%8C%C2%BB'},
{'id':'6535560', 'name': 'My Hero Academy', 'url':'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9C%D0%BE%D1%8F_%D0%B3%D0%B5%D1%80%D0%BE%D0%B9%D1%81%D0%BA%D0%B0%D1%8F_%D0%B0%D0%BA%D0%B0%D0%B4%D0%B5%D0%BC%D0%B8%D1%8F%C2%BB'},
{'id':'8266391', 'name': 'Pokemon', 'url':'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9F%D0%BE%D0%BA%D0%B5%D0%BC%D0%BE%D0%BD%C2%BB_(%D1%81%D0%B5%D0%B7%D0%BE%D0%BD%D1%8B_17%E2%80%94%D0%BD%D0%B0%D1%81%D1%82%D0%BE%D1%8F%D1%89%D0%B5%D0%B5_%D0%B2%D1%80%D0%B5%D0%BC%D1%8F)'}];

var c = {};

c.memes = async function (id) {
  const urlimg = await vk.getGroup(id, 1);
  if (urlimg) {
    const idphoto = new URL(urlimg).pathname;
    return urlimg;
  }
}
c.videos = async function (id) {
  const url = webutils.lastVideoOnChannel(id);
  if (url) {
    return url;
  }
}
c.androidupdates = async function (pkg) {
  const url = 'https://play.google.com/store/apps/details?id=' + pkg;
  const out = await webutils.infoGP(url);
  if (out.indexOf('undefined') == -1) {
    return out;
  }
}
function codesWiki(n){
  return 'https://' + n + '.fandom.com/api.php?action=query&prop=revisions&titles=Codes&rvprop=content&format=json'
}
c.spincodes = async function () {
  const res = await webutils.get(codesWiki('shindo-life-rell'));
  if(!res){
    return;
  }
  const g = res.query.pages[431].revisions[0]['*'].split('|-|Inactive Codes:=')[0].split('|Code')[1].replaceAll('}', '==========').replaceAll('|', '').replaceAll('\'', '*').replace('!', '').replaceAll('-', '==========').replace('Reward', '').replaceAll('******', '');
  const v = g.split('\n');
  var b = [];
  for (var i = 0; i < v.length; i++) {
    if (v[i].length > 1) {
      b.push(v[i].replace(' Spins', '🌀').replace(' and ', '+').replace(' RELLCoins', '🪙').replace('==========', ''));
    }
  }
  return b.join('\n');
}
c.demonfallcodes = async function () {
  const res = await webutils.get(codesWiki('demon-fall'));
  if(!res){
    return;
  }
  var g = res.query.pages[364].revisions[0]['*'].split('<br />')[0].split('|-');
  g.shift();
  var t = [];
  for (var i = 0; i < g.length; i++) {
    const e = g[i].replaceAll('\n', '').replaceAll('|', '').replaceAll('[[', ' ').replaceAll(']]', ' ')
    if (e.length > 1) {
      t.push(e.replace('Potion', '🧪'));
    }
  }
  return t.join('\n\n');
}
c.rblxcheat = async function (a) {
  const keyword = a + ' cheat script';
  const log = await roblox.cheat(keyword);
  if (log) {
    const msgContent = log[0].join('\n').substr(0, 1999);
    return msgContent;
  }
}
c.anime = async function (i) {
  const f = animelist[Number(i)];
  const e = await entertainment.anime(f.id);
  const msgt = anime.msg(e, f.name, f.url);
  return msgt;
}
c.newvideobyname = async function (a) {
  const url = await webutils.findVideo(a);
  if(url){
    return 'https://youtu.be/' + url;
  }
}
c.simabot = async function (text, botdb) {
  const translatedText = await translate.toRu(text);
  const config = {
    msg: translatedText || text,
    userid: '0',
    nickname: '0',
    isDM: true,
    originalansw: text,
    channelid: '0',
    botdb: botdb,
    isOP: false
  };
  out = await simabot.bot(config);
  return wordutils.fixText(out.out);
}
c.url = async function (a) {
  const out = await superweb.url(text, 'any');
  return out;
}
c.rss = async function (a) {
  const out = await webutils.get(a);
  if(!out){
    return;
  }
  const doc = webutils.document(out);
  const rss = doc.getElementsByTagName('rss')[0];
  const rssVersion =  rss.getAttribute('version');
  if(rssVersion[0] == 2){
    const items = rss.getElementsByTagName('item');
    const item = items[0];
    const title = item.getElementsByTagName('title')[0].textContent;
    const description = item.getElementsByTagName('description')[0].textContent;
    var link = null;
    if(item.getElementsByTagName('link')[0]){
      link = item.getElementsByTagName('link')[0].textContent;
    }
    var pubDate = null;
    if(item.getElementsByTagName('pubDate')[0]){
      pubDate = item.getElementsByTagName('pubDate')[0].textContent;
    }
    var guid = null;
    if(item.getElementsByTagName('guid')[0]){
      guid = item.getElementsByTagName('guid')[0].textContent;
    }
    var author = null;
    if(item.getElementsByTagName('author')[0]){
      author = item.getElementsByTagName('author')[0].textContent;
    }
    const msg = title + '\n' + pubDate + '\n' + guid
    return msg;
  }else{
    return { error: 'Not supported RSS version! Report to developer!' };
  }
}
c.test = async function (a) {
  // time equal hours + : + minutes
  const time = new Date().getHours() + ':' + new Date().getMinutes();
  return a + ' test\n' + time;
}
c.tgchannel = async function (id) {
  const url = 'https://t.me/s/' + id;
  const out = await webutils.get(url);
  if(!out){
    return;
  }
  const doc = webutils.document(out);
  const msgs = doc.getElementsByClassName('tgme_widget_message_wrap');
  const isMainPage = doc.getElementsByClassName('tl_main_head').length > 0;
  if (isMainPage){
    return { error: 'Channel not found.' };
  }
  const isWrongDimension = doc.getElementsByClassName('tgme_icon_user').length > 0;
  if (isWrongDimension){
    return { error: 'This is user.' };
  }
  const isAntiCopy = doc.getElementsByClassName('tgme_page_context_link_wrap').length > 0;
  if (isAntiCopy){
    return { error: 'Channels\'s owner enabled “Restrict saving content”.' };
  }
  const isPrivete = doc.getElementsByClassName('tgme_page_context_link_wrap').length > 0;
  if (msgs.length == 0) {
    return { error: 'Telegram channel not public!' };
  }
  const msg = msgs[msgs.length - 1];
  const texts = msg.getElementsByClassName('tgme_widget_message_text');
  var text = '';
  if(texts.length > 0){
    text = texts[0].textContent;
  }
  var img = '';
  const imgs = msg.getElementsByClassName('tgme_widget_message_photo_wrap');
  if(imgs.length > 0){
    img = imgs[0].style.backgroundImage.split('url(')[1].split(')')[0];
  }
  var time = '';
  const timeElement = msg.getElementsByTagName('time');
  if(timeElement.length > 0){
    time = timeElement[0].textContent;
  }
  var output = text;
  if(img){
    output += '\n' + img;
  }
  if(time){
    output += '\n' + time;
  }
  return output;
}

/*
  Need to rework
  const wNews = robot.channels.cache.get(worldNews);
  function fpdasend(e) {
    var simg = e.mainimage;
    if(e.images.length > 1){
      simg = e.images[1];
    }
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(e.title)
      .setURL(e.url)
      .setAuthor('4PDA', 'https://i.imgur.com/BdRLB5Y.png', fourpda.domain)
      .setDescription(e.text.substring(0, 2047))
      .setThumbnail(e.mainimage)
      .setImage(simg)
      .setTimestamp();
    wNews.send(embed);
    var txt = e.title;
    txt += '\n';
    txt += e.text;
    txt += '\n';
    txt += e.mainimage;
    txt += '\n';
    txt += e.url;
    txt += '<>TELEGRAM<>';
    send(wNews, txt);
  }
  fourpda.lastArticle().then(function (data) {
    if(data){
      onChange("fpda", data.url).then(function (e) {
        if(e == true){
          fpdasend(data);
        }
      });
    }
  })
  
  // GeyserMC Android
  webutils.geysermcGet().then(function (e) {
    const geyserInfo = e;
    if(geyserInfo){
      onChange("geysermcandroid", geyserInfo[3]).then(function (e) {
        if(e == true){
          const geyserUpdateChannel = robot.channels.cache.get('845308537596149790');
          geyserUpdateChannel.send('<@&815223159002890280>');
          const embed = new Discord.MessageEmbed()
             .setColor('#34eb9e')
             .setTitle('GeyserMC Android обновлен (updated)')
             .setDescription(geyserInfo[0]+'\n(Size file) Размер файла: **' + geyserInfo[2] + '**\n(Build version) Версия сборки: **' + geyserInfo[3] + '**');
          geyserUpdateChannel.send(embed);
        }
      });
    }
  });
*/

exports.array = [
  'url',
  'simabot',
  'memes',
  'videos',
  'androidupdates',
  'spincodes',
  'demonfallcodes',
  'rblxcheat',
  'anime',
  'newvideobyname',
  'rss',
  'tgchannel',
  'test'
];
exports.channels = c;