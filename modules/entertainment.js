const axios = require('axios');
const jsdom = require('jsdom');
var textdb;
const debug = false;

const animelist = [{ 'id': '893721', 'name': 'One Piece', 'url': 'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_One_Piece' },
{ 'id': '8737539', 'name': 'Boruto: Naruto Next Generations', 'url': 'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_Boruto:_Naruto_Next_Generations' },
{ 'id': '8768654', 'name': 'That Time I Got Reincarnated as a Slime', 'url': 'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9E_%D0%BC%D0%BE%D1%91%D0%BC_%D0%BF%D0%B5%D1%80%D0%B5%D1%80%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B8_%D0%B2_%D1%81%D0%BB%D0%B8%D0%B7%D1%8C%C2%BB' },
{ 'id': '6535560', 'name': 'My Hero Academy', 'url': 'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9C%D0%BE%D1%8F_%D0%B3%D0%B5%D1%80%D0%BE%D0%B9%D1%81%D0%BA%D0%B0%D1%8F_%D0%B0%D0%BA%D0%B0%D0%B4%D0%B5%D0%BC%D0%B8%D1%8F%C2%BB' },
{ 'id': '8266391', 'name': 'Pokemon', 'url': 'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9F%D0%BE%D0%BA%D0%B5%D0%BC%D0%BE%D0%BD%C2%BB_(%D1%81%D0%B5%D0%B7%D0%BE%D0%BD%D1%8B_17%E2%80%94%D0%BD%D0%B0%D1%81%D1%82%D0%BE%D1%8F%D1%89%D0%B5%D0%B5_%D0%B2%D1%80%D0%B5%D0%BC%D1%8F)' }];

const monthsRUS = ['январ', 'феврал', 'март', 'апр', 'мая', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
const monthsENG = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function monthOnEnglish(mouth) {
  if(!mouth){
    return;
  }
  mouth = mouth.toLocaleLowerCase();
  for (var i = 0; i < 12; i++) {
    if(mouth.indexOf(monthsRUS[i]) != -1){
      return monthsENG[i];
    }
    if(mouth.indexOf(monthsENG[i]) != -1){
      return monthsRUS[i];
    }
  }
}
function isDate(text) {
  var array = String(text).replaceAll(' ', ' ').split(' ');
  for (var i = 0; i < array.length; i++) {
    if(Math.floor(array[i]) == array[i]){
      if(array[i].length == 4){
        return Number(array[i]);
      }
    }
  }
}
function getMonth(text) {
  var array = text.split(' ');
  for (var i = 0; i < array.length; i++) {
    if(String(Number(array[i])) == 'NaN'){
      return array[i];
    }
  }
  return undefined;
}
function UTCNow() {
  const now = new Date;
  const utc_timestamp = Date.UTC(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() ,
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
  return utc_timestamp;
}
function getDay(text) {
  var array = text.split(' ');
  for (var i = 0; i < array.length; i++) {
    if(String(Number(array[i])) != 'NaN'){
      if(array[i].length == 1 || array[i].length == 2){
        return array[i];
      }
    }
  }
}
function timeIsOut(text) {
  const timestamp = Math.floor(UTCNow() / 1000) + oneDay;
  const year = isDate(text);
  if(year){
    const date = monthOnEnglish(getMonth(text)) + ' ' + year + ' ' + getDay(text);
    const timestamp2 = Math.floor((new Date(date)).getTime() / 1000);
    // console.log(timestamp, timestamp2);
    if(timestamp > timestamp2){
      return true;
    }else{
      return false;
    }
  }
  return;
}
function getSeries(seasonid) {
  let c = [];
  let naming = [];
  let outserie;
  const w = h3[seasonid].nextElementSibling.getElementsByTagName('tr');
  var ep = 0;
  for (var i = 0; i < w.length; i++) {
    if(w[i].innerHTML.indexOf('th') == -1){
      const array = w[i].getElementsByTagName('td');
      let data = {};
      var remaining;
      for (var z = 0; z < array.length; z++) {
        const e = array[z].textContent;
        if(z == 0){
          data.serie = e;
        }else{
          if(z == 1){
            data.name = e;
          }
          if(typeof data.simpletext == 'undefined'){
            data.simpletext = '';
          }
          data.simpletext += naming[z] + ': **' + e + '**';
          data.simpletext += '\n';
          // console.log('<<');
          // console.log(e);
          // if(isDate(e)){
          //   console.log('DATE DETECTED!');
          // }
          // console.log('<<');
          if(isDate(e) && String(data.simpletext).indexOf('undefined') == -1){
            const tmp = timeIsOut(e);
            // console.log(e, tmp);
            const possibleSerie = ep - 1;
            if(tmp && outserie != possibleSerie){
              outserie = possibleSerie;
            }
          }
        }
      }
      if(String(data.simpletext).indexOf('undefined') == -1){
        data.simpletext = String(data.simpletext).substring(0, String(data.simpletext).length - 1);
        c.push(data);
        ep++;
      }
    }else{
      if(w[i].innerHTML.indexOf('td') == -1){
        const o = w[i].textContent.split('\n');
        for (var k = 0; k < o.length; k++) {
          if(o[k].length != 0){
            naming.push(o[k]);
          }
        }
      }
    }
  }
  return [outserie, c]
}

exports.anime = async function(wikiid){
  let promise = new Promise((resolve, reject) => {
    const url = 'https://' + textdb.strings.lang + '.wikipedia.org/w/api.php?action=parse&format=json&pageid=' + wikiid;
    axios.get(url).then(function (response) {
        let data = response.data.parse;
        let seeurl = '';
        if(data.externallinks.length > 0){
          seeurl = data.externallinks[0];
        }
        const content = new jsdom.JSDOM(data.text['*']);
        const body = content.window.document.body;
        const h3 = body.getElementsByTagName('h3');
        let seasons = [];
        const oneDay = 24 * 60 * 60;
        // let seasonsid = [];
        for (var i = 0; i < h3.length; i++) {
          const t = h3[i].getElementsByClassName('mw-headline');
          for (var n = 0; n < t.length; n++) {
            seasons.push(t[n].textContent);
            // seasonsid.push(n);
          }
        }
        const season = seasons.length - 1;
        const tmp2 = getSeries(season);
        // if(!tmp2[0]){
        //   // console.log(tmp2[1]);
        // }
        const out = [tmp2[1], seasons[season], tmp2[0]];
        resolve(out);
      })
      .catch(function (error) {
        // console.log(error);
        resolve('');
      });
  });

  return await promise;
}

exports.msg = function(data, name, url){
  // console.log('[DATA]: ');
  // if(!data || (data.length == 0)){
  //   return;
  // }
  // if(!data[0]){
  //   return;
  // }
  // return 'A';
  if(data[2] == -1){
    data[2] = data[0].length - 1;
  }
  const e = data[0][data[2]];
  let msg = '';
  if(name){
    msg += textdb.strings.newEpisode + ' **' + name + '**!';
  }else{
    msg += textdb.strings.newEpisode2;
  }
  msg += '\n';
  if(typeof e != 'undefined'){
    msg += textdb.strings.andThisIs + ' **' + e.serie + '** ' + textdb.strings.episode + '!';
    msg += '\n';
    // msg += textdb.strings.episodeName + ': **' + e.name + '**';
    // msg += '\n';
  }
  msg += textdb.strings.seasonName + ': **' + data[1] + '**';
  msg += '\n';
  if(typeof e != 'undefined'){
    msg += e.simpletext;
  }
  // msg += textdb.strings.eta + ' **' + String(data[0].length - data[2]) + '** ' + textdb.strings.episodes + '.';
  if(url){
    msg += '\n';
    msg += textdb.strings.details + ': ' + url;
  }
  return msg;
}

if(debug){
  const animelist = [{'id': '893721', 'name': 'One Piece', 'url': 'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_One_Piece'},
{'id':'8737539', 'name': 'Boruto: Naruto Next Generations', 'url':'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_Boruto:_Naruto_Next_Generations'},
{'id':'8768654', 'name': 'That Time I Got Reincarnated as a Slime', 'url':'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9E_%D0%BC%D0%BE%D1%91%D0%BC_%D0%BF%D0%B5%D1%80%D0%B5%D1%80%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B8_%D0%B2_%D1%81%D0%BB%D0%B8%D0%B7%D1%8C%C2%BB'},
{'id':'6535560', 'name': 'My Hero Academy', 'url':'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9C%D0%BE%D1%8F_%D0%B3%D0%B5%D1%80%D0%BE%D0%B9%D1%81%D0%BA%D0%B0%D1%8F_%D0%B0%D0%BA%D0%B0%D0%B4%D0%B5%D0%BC%D0%B8%D1%8F%C2%BB'},
{'id':'8266391', 'name': 'Pokemon', 'url':'https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%81%D0%B5%D1%80%D0%B8%D0%B9_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5_%C2%AB%D0%9F%D0%BE%D0%BA%D0%B5%D0%BC%D0%BE%D0%BD%C2%BB_(%D1%81%D0%B5%D0%B7%D0%BE%D0%BD%D1%8B_17%E2%80%94%D0%BD%D0%B0%D1%81%D1%82%D0%BE%D1%8F%D1%89%D0%B5%D0%B5_%D0%B2%D1%80%D0%B5%D0%BC%D1%8F)'}];

  for (var i = 0; i < animelist.length; i++) {
    const f = animelist[i];
    exports.anime(f.id).then(function (e) {
      const msgt = exports.msg(e, f.name, f.url);
      console.log(msgt);
    });
  }
}

exports.animeStatus = async function (id) {
  const f = animelist[Number(id)];
  const e = await entertainment.animeStatus(f.id);
  const msgt = anime.msg(e, f.name, f.url);
  return msgt;
}

exports.init = function (data) {
  textdb = data.textdb;
}