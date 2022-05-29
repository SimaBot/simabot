const axios = require('axios');
const jsdom = require('jsdom');
const iconv = require('iconv-lite');
// const useragent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; MSN 6.1; MSNbMSFT; MSNmen-us; MSNc00; v5m)';
const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36';
// TODO: Move to webutils
// TODO: Try to use webarchive
const proxy = '';
const domain = 'https://4pda.to';
exports.domain = domain;

exports.parseArticle = function(html, url) {
  const h = new jsdom.JSDOM(html).window;
  const w = h.document.getElementsByClassName('container')[0];
  const title = h.document.title.replaceAll(' - 4PDA', '');
  const time_element = h.document.getElementsByClassName('date')[0];
  var time;
  if(time_element){
    time = time_element.textContent;
  }else{
    time = '???';
  }
  var p, img;
  try{
    p = w.getElementsByTagName('p');
    img = w.getElementsByTagName('img');
  }catch{
    return undefined;
  }

  var text = '';
  var images = [];
  for (var i = 0; i < p.length; i++) {
    text += p[i].textContent;
  }
  for (var i = 0; i < img.length; i++) {
    var urlimg = img[i].src;
    if(urlimg.startsWith('//')){
      urlimg = 'https:' + urlimg;
    }
    images.push(urlimg);
  }
  return {
    title: title,
    text: text,
    images: images,
    mainimage: images[0],
    time: time,
    url: url.replace(proxy, '')
  }
}
exports.lastArticleURL = async function () {
  let promise = new Promise((resolve, reject) => {
    axios.request({
      method: 'GET',
      url: proxy + domain,
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      withCredentials: true,
      headers: { 'User-Agent': useragent, "Access-Control-Allow-Origin": "*"}
    }).then(function (e) {
      e = iconv.decode(e.data, 'win1251');
      const el = new jsdom.JSDOM(e).window.document.getElementsByClassName('list-post-title');
      const url = el[0].getElementsByTagName('a')[0].href;
      resolve(proxy + url);
    });
  });

  return await promise;
}

exports.lastArticle = async function () {
  let promise = new Promise((resolve, reject) => {
    exports.lastArticleURL().then(function (n) {
      axios.request({
        method: 'GET',
        url: n,
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
        withCredentials: true,
        headers: { 'User-Agent': useragent, "Access-Control-Allow-Origin": "*"}
      }).then(function (e) {
        e = iconv.decode(e.data, 'win1251');
        resolve(exports.parseArticle(e, n));
      });
    });
  });
  return await promise;
}
// exports.lastArticle().then(function (e) {
//   console.log(e);
// })
