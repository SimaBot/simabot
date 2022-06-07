const axios = require('axios');
const jsdom = require('jsdom');
const random = require('./modules/random.js');
const vk = require('./modules/vk.js');
// const fourpda = require('./fourpda.js');
const { JSDOM } = jsdom;
const SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();
axios.defaults.timeout = 5000;

const useragents = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"];

exports.useragent = function () {
  return useragents[random.between(0, useragents.length)];
}
function artistNamesSpotify(artists) {
  var names = [];
  for (var i = 0; i < artists.length; i++) {
    names.push(artists[i].name);
  }
  return names;
}
function getFullNamesFromPlaylist(playlist) {
  const array =  playlist.items;
  var names = [];
  for (var i = 0; i < array.length; i++) {
    const song = array[i].track;
    names.push(song.name + ' - ' + artistNamesSpotify(song.artists).join(' '));
  }
  return names;
}
async function getPlaylistSpotify(id) {
  const g = await spotifyApi.getPlaylist(id);
  const c = g.body.tracks;
  var total = Math.floor(c.total/100);
  if(c.total > total * 100){
    total++;
  }
  var playlist = [];
  for (var i = 0; i < total; i++) {
    const part = await spotifyApi.getPlaylistTracks(id, {
      offset: i * 100,
      limit: 100,
      fields: 'items'
    });
    const array = getFullNamesFromPlaylist(part.body);
    playlist = playlist.concat(array);
  }
  return exports.removeClones(playlist);
}

exports.removeClones = function (arr) {
  var arr2 = [];
  for (var i = 0; i < arr.length; i++) {
    const z = arr[i];
    if(arr2.indexOf(z) == -1){
      arr2.push(z);
    }
  }
  return arr2;
}

exports.getAccessTokenSpotify = async function () {
  const a = await axios.get('https://open.spotify.com/get_access_token?reason=transport&productType=web_player');
  const token = a.data.accessToken;
  return token;
}

exports.document = function (g) {
    return (new JSDOM(g)).window.document;
}
function parseYt(g) {
  const data = exports.findScript(g, 'ytInitialData');
  if(!data){
    return;
  }
  z = data.replace('var ytInitialData = ', '');
  if(z[z.length - 1] == ';'){
    z = z.substring(0, z.length - 1);
  }
  return JSON.parse(z);
}
exports.isLUA = function (text) {
  if(text.indexOf('loadstring(game:HttpGet') > -1){
    return true;
  }
  const checks = ['local ', '\nend', 'print(', 'then', 'loadstring', 'nil', 'repeat'];
  var detects = 0;
  for (var i = 0; i < checks.length; i++) {
    if(text.indexOf(checks[i]) > -1){
      detects++;
    }
  }
  return detects > 3;
}
exports.isSecure = async function (url) {
  var out;
  try{
    out = await axios.get(url);
  }
  catch{
    return false;
  }
  const g = out.data;
  const a = exports.document(g).getElementsByTagName('a');
  // Detect "fake website" with same A hrefs
  var array = [];
  for (var i = 0; i < a.length; i++) {
    const z = a[i].href;
    if(z){
      array.push(z);
    }
  }
  array = exports.removeClones(array);
  if(array.length == 1){
    if(array[0].indexOf('about:') > -1){
      return false;
    }
  }
  var domain;
  try {
    domain = new URL(url).host;
  } catch (e) {

  } finally {

  }
  const blackDomain = ['1-fo.net'];
  for (var i = 0; i < blackDomain.length; i++) {
    if(domain == blackDomain[i]){
      return false;
    }
  }
  if(domain){
    const adguardUrl = 'https://reports.adguard.com/en/' + domain + '/report.html';
    const greq = await axios.get(adguardUrl);
    const guardReport = greq.data;
    const report = exports.document(guardReport).getElementsByClassName('report')[0].className;
    if(report.indexOf('danger') > -1){
      return false;
    }
  }
  return undefined;
}
exports.findScript = function (g, keywords) {
  const el = exports.document(g).getElementsByTagName('script');
  for (var i = 0; i < el.length; i++) {
    const data = el[i].textContent;
    if(data.indexOf(keywords) > -1){
      return data;
    }
  }
}
exports.ytInitial = async function (videoId) {
  const url = 'https://www.youtube.com/watch?v=' + videoId;
  var get;
  try {
    get = await axios.get(url);
  } catch (e) {
    return undefined;
  } finally {

  }
  const html = get.data;
  var z = exports.findScript(html, 'ytInitialPlayerResponse');
  z = z.replace('var ytInitialPlayerResponse = ', '');
  if(z[z.length - 1] == ';'){
    z = z.substring(0, z.length - 1);
  }
  return JSON.parse(z);
}
exports.clearUrl = function (url) {
  return url.split('\n')[0].split('\r')[0];
}
exports.yesno = function (bool) {
  if(typeof bool == 'undefined'){
    return '???';
  }
  if(bool){
    return 'YES';
  }
  return 'NO';
}
exports.urlsArray = function (text) {
  const array = text.split(' ');
  var urls = [];
  for (var i = 0; i < array.length; i++) {
    const z = array[i];
    if(z.startsWith('www.')){
      urls.push(exports.clearUrl(z));
    }else{
      if(z.startsWith('https://')){
        urls.push(exports.clearUrl(z));
      }else{
        if(z.startsWith('http://')){
          urls.push(exports.clearUrl(z));
        }
      }
    }
  }
  if(urls == []){
    return;
  }
  return urls;
}
exports.unshort = async function (url) {
  var ret;
  try {
    ret = await axios.get(url, {
      headers: {
        "User-Agent": exports.useragent()
      }
    });
  } catch (e) {
    return url;
  } finally {

  }
  var r = ret.request.res.responseUrl;
  const bypass = ["linkvertise.com", "adf.ly", "exe.io", "exey.io", "exee.io", "exe.app", "eio.io", "ouo.io", "ouo.press", "adfoc.us", "ay.live", "bc.vc", "bcvc.live", "fc.lc", "fc-lc.com", "za.gl", "za.uy", "zee.gl", "freehottip.com", "ph.apps2app.com", "gestyy.com", "shortconnect.com", "shorte.st", "sh.st", "aylink.co", "sub2get.com", "sub2unlock.net", "sub2unlock.com", "rekonise.com", "letsboost.net", "mboost.me", "sub4unlock.com", "ytsubme.com", "steps2unlock.com", "social-unlock.com", "boost.ink", "boostme.link", "boost.fusedgt.com"];
  var trypass = false;
  for (var i = 0; i < bypass.length; i++) {
    if(r.indexOf(bypass[i]) > -1){
      trypass = true;
      i = bypass.length + 1;
    }
  }
  if(trypass){
    var res;
    try{
      res = await axios.post('https://api.bypass.vip/', { url: url });
    }catch{
      return;
    }
    const data = res.data;
    if(data.success){
      r = data.destination;
    }else{
      return;
    }
  }
  if(r.indexOf('pastebin.com') > -1){
    if(r.indexOf('raw') == -1){
      return 'https://pastebin.com/raw/' + r.split('.com/')[1];
    }
  }
  return r;
}
exports.duckIt = async function (keywords) {
  const url = 'https://html.duckduckgo.com/html/';
  var get;
  try {
    const req = 'q=' + encodeURIComponent(keywords).substring(0, 172) + '&b='
    get = await axios.post(url, req, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
      }
    });
  } catch (e) {
    return undefined;
  } finally {

  }
  const html = get.data;
  var out = [];
  const el = exports.document(html).getElementsByClassName('result__snippet');
  for (var i = 0; i < el.length; i++) {
    const z = el[i];
    out.push({
      url: decodeURIComponent(z.href),
      text: z.textContent
    });
  }
  if(out.length == 0){
    return undefined;
  }
  return out;
}
exports.lastVideoOnChannel = async function (channelId) {
  var res;
  try {
    res = await axios.get('https://www.youtube.com/' + channelId + '/videos');
  } catch (e) {
    return;
  }
  const obj = parseYt(res.data);
  
  var url;
  try {
    const videos = obj.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer.items;
    url = 'https://youtu.be/' + videos[0].gridVideoRenderer.videoId;
  } catch (error) {

  }
  return url;
}
exports.findVideoOnYoutube = async function (keywords, adds){
  var a = '';
  if(adds){
    a += adds;
  }
  var url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(keywords) + a;
  var out;
  try {
    out = await axios.get(url);
  } catch (e) {
    out = await exports.findVideo(keywords);
    return out;
  }
  const z = parseYt(out.data);
  const data = z.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
  for(let i = 0; i < data.length; i++){
    const videoRenderer = data[i].videoRenderer;
    if (videoRenderer){
      if (videoRenderer.videoId) {
        return videoRenderer.videoId;
      }
    }
  }
}
exports.findVideo = async function (keywords, adds, anyUrl) {
  var idvideo;
  keywords = keywords.substring(0, 172);
  idvideo = await exports.findVideoOnYoutube(keywords, adds);
  if(!idvideo){
    const duckdata = await exports.duckIt('site:youtube.com ' + keywords);
    if(duckdata) {
      idvideo = duckdata[0].url;
      if (!anyUrl){
        idvideo = idvideo.split('v=')[1];
      }
      return idvideo;
    }else{
      return;
    }
  }
  const status = await exports.validateVideoId(idvideo)
  if(status == 'OK'){
    return idvideo;
  }
}

exports.questionWikipedia = async function (text, lang) {
  var res;
  const duck = await exports.duckIt('site:wikipedia.org ' + text);
  if(duck){
    text = duck[0].text.split(' - ')[0];
  }else{
    return;
  }
  const url = 'https://' + (lang || 'en') + '.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=' + encodeURI(text);
  var pages, content;
  try {
    res = await axios.get(url);
    pages = res.data.query.pages;
    content = pages[Object.keys(pages)[0]].title;
  } catch (e) {
    return;
  } finally {

  }
  return content.replaceAll(' ...', '.');
}

exports.getPlaylist = async function (url) {
  if(url.indexOf('youtube.com') > -1){
    // Get html
  }
  if(url.indexOf('spotify.com') > -1){
    const token = await exports.getAccessTokenSpotify();
    spotifyApi.setAccessToken(token);
    var playlistId, playlist;
    try {
      playlistId = (new URL(url)).pathname.split('/');
      playlistId = playlistId[playlistId.length - 1];
      playlist = await getPlaylistSpotify(playlistId);
    } catch (e) {

    } finally {

    }
    return playlist;
  }
  return undefined;
}
exports.searchImage = async function (text) {
  const keywords = encodeURIComponent(text);
  const url = 'https://duckduckgo.com/?q=' + keywords + '&t=h_&iax=images&ia=images';
  var req;
  try {
    req = await axios.get(url);
  } catch (e) {
    return undefined;
  } finally {

  }
  const d = exports.document(req.data);
  const lang = d.getElementsByTagName('html')[0].lang.toLowerCase();
  const code = exports.findScript(req.data, 'vqd=');
  const token = code.split('vqd=\'')[1].split('\'')[0];
  const url2 = 'https://duckduckgo.com/i.js?l=' + lang + '&o=json&q=' + keywords + '&vqd=' + token;
  try {
    req = await axios.get(url2);
  } catch (e) {
    return undefined;
  } finally {

  }
  return req.data.results;
}
exports.newvideobyname = async function (a) {
  const url = await webutils.findVideo(a);
  if (url) {
    return 'https://youtu.be/' + url;
  }
}
exports.infoUpdateGP = async function (data) {
  var url = 'https://play.google.com/store/apps/details?id=';
  if(data.indexOf(url) > -1){
    try {
      const urlObj = new URL(data);
      url += urlObj.searchParams.get('id');
    } catch (error) {
      return { error: 'Invalid URL' };
    }
  }else{
    url += data;
  }
  const res = await exports.get(url);
  if(!res){
    return;
  }
  const doc = exports.document(res);
  // require('fs').writeFileSync('test.html', res);
  var title = doc.getElementsByTagName('title')[0].textContent.split(' - ');
  if(title.length == 1){
    return { error: 'Page not found' };
  }else{
    title = title[0];
  }
  try {
    var script = exports.findScript(res, "AF_initDataCallback({key: 'ds:4'");
    var array = script.split('(');

    array.shift();
    script = array.join('(');

    array = script.split(');');
    array.pop();
    script = array.join(');');

    array = script.split(',[[["');
    script = array[array.length - 1];
    script = script.split('"]]],')[0];
    const version = script.split('"]]')[0];
    array = script.split('"');
    const date = array[array.length - 1];
    return title + ' (Android)!**\n--> **' + version + '** \n📅: **' + date + '**';
  } catch (error) {
    
  }
}
exports.vkGroupLastPhoto = async function (id) {
  const urlimg = await vk.getGroup(id, 1);
  if (urlimg) {
    const idphoto = new URL(urlimg).pathname;
    return urlimg;
  }
}
exports.howManySubs = async function (url) {
  var res;
  try {
    res = await axios.get(url);
  } catch (e) {
    return;
  } finally {

  }
  const data = parseYt(res.data);
  return data.header.c4TabbedHeaderRenderer.subscriberCountText.simpleText;
}
exports.get = async function (url) {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    
  }
}

exports.validateVideoId = async function (videoId) {
  const initial = await exports.ytInitial(videoId);
  if(initial){
    if(initial.playabilityStatus){
      return initial.playabilityStatus.status;
    }
  }
}
exports.getGuildIdByInvite = async function (url){
  try {
    const res = await axios.get(url);
    return res.data.split('property="og:image"')[1].split('"')[1].split('/')[4];
  } catch {
    return;
  }
}

exports.createSprunge = async function (text) {
  const url = 'http://sprunge.us/';
  try {
    const res = await axios.post(url, 'sprunge=' + String(text));
    return res.data;
  } catch (e) {
    return;
  }
}

exports.tgchannel = async function (id) {
  const url = 'https://t.me/s/' + id;
  const out = await exports.get(url);
  if (!out) {
    return;
  }
  const doc = exports.document(out);
  const msgs = doc.getElementsByClassName('tgme_widget_message_wrap');
  const isMainPage = doc.getElementsByClassName('tl_main_head').length > 0;
  if (isMainPage) {
    return { error: 'Channel not found.' };
  }
  const isWrongDimension = doc.getElementsByClassName('tgme_icon_user').length > 0;
  if (isWrongDimension) {
    return { error: 'This is user.' };
  }
  const isAntiCopy = doc.getElementsByClassName('tgme_page_context_link_wrap').length > 0;
  if (isAntiCopy) {
    return { error: 'Channels\'s owner enabled “Restrict saving content”.' };
  }
  const isPrivete = doc.getElementsByClassName('tgme_page_context_link_wrap').length > 0;
  if (msgs.length == 0) {
    return { error: 'Telegram channel not public!' };
  }
  const msg = msgs[msgs.length - 1];
  const texts = msg.getElementsByClassName('tgme_widget_message_text');
  var text = '';
  if (texts.length > 0) {
    text = texts[0].textContent;
  }
  var img = '';
  const imgs = msg.getElementsByClassName('tgme_widget_message_photo_wrap');
  if (imgs.length > 0) {
    img = imgs[0].style.backgroundImage.split('url(')[1].split(')')[0];
  }
  var time = '';
  const timeElement = msg.getElementsByTagName('time');
  if (timeElement.length > 0) {
    time = timeElement[0].textContent;
  }
  var output = text;
  if (img) {
    output += '\n' + img;
  }
  if (time) {
    output += '\n' + time;
  }
  return output;
}

exports.geysermcGet = async function () {
  try {
    const urlg = 'https://ci.opencollab.dev/job/GeyserMC/job/GeyserAndroid/job/master/lastSuccessfulBuild';
    const res = await axios.get(urlg + '/');
    var g = response.data;
    const build = g.split('</title>')[0].split('<title>')[1].split('master ')[1].split('[')[0];
    g = g.split('<div id="description">')[1].split('<td><a href="')[1]
    const url = urlg + '/' + g.split('">')[0];
    const fileinfo = g.split('</a>');
    const pkgname = fileinfo[0].split('">')[1];
    const size = fileinfo[1].split('>')[2].split('<')[0];
    const msg = ('**Вышла новая версия GeyserMC Android!**\n[Скачать ' + pkgname + '](' + url + ')');
    return [msg, pkgname, size, build];
  } catch (e) {
    return;
  } finally {

  }
  return await promise;
}

exports.rss = async function (url) {
  const out = await exports.get(url);
  if (!out) {
    return;
  }
  const doc = exports.document(out);
  const rss = doc.getElementsByTagName('rss')[0];
  const rssVersion = rss.getAttribute('version');
  if (rssVersion[0] == 2) {
    const items = rss.getElementsByTagName('item');
    const item = items[0];
    const title = item.getElementsByTagName('title')[0].textContent;
    const description = item.getElementsByTagName('description')[0].textContent;
    var link = null;
    if (item.getElementsByTagName('link')[0]) {
      link = item.getElementsByTagName('link')[0].textContent;
    }
    var pubDate = null;
    if (item.getElementsByTagName('pubDate')[0]) {
      pubDate = item.getElementsByTagName('pubDate')[0].textContent;
    }
    var guid = null;
    if (item.getElementsByTagName('guid')[0]) {
      guid = item.getElementsByTagName('guid')[0].textContent;
    }
    var author = null;
    if (item.getElementsByTagName('author')[0]) {
      author = item.getElementsByTagName('author')[0].textContent;
    }
    const msg = title + '\n' + pubDate + '\n' + guid
    return msg;
  } else {
    return { error: 'Not supported RSS version! Report to developer!' };
  }
}

function test (){
  exports.lastVideoOnChannel('c/Krelez').then(function (url){
    exports.createSprunge('Test: ' + url).then(console.log);
  });
  
}

test = null;

if(typeof test === 'function'){
  console.log(test());
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
             .setTitle('GeyserMC Android update')
             .setDescription(geyserInfo[0]+'\n(Size file) Размер файла: **' + geyserInfo[2] + '**\n(Build version) Версия сборки: **' + geyserInfo[3] + '**');
          geyserUpdateChannel.send(embed);
        }
      });
    }
  });
*/

// Need reworking
function codesWiki(n) {
  return 'https://' + n + '.fandom.com/api.php?action=query&prop=revisions&titles=Codes&rvprop=content&format=json'
}
exports.spincodes = async function () {
  const res = await webutils.get(codesWiki('shindo-life-rell'));
  if (!res) {
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
exports.demonfallcodes = async function () {
  const res = await webutils.get(codesWiki('demon-fall'));
  if (!res) {
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