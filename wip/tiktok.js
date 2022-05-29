// Download video from TikTok

const jsdom = require('jsdom');
const axios = require('axios');
// const useragent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; MSN 6.1; MSNbMSFT; MSNmen-us; MSNc00; v5m)';
// const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
const useragent = 'Mozilla/4.0 (compatible; MSIE 1.0; Windows 3.11)';
const fs = require('fs');
const fetch = require('node-fetch');
fetch("", {
    "method": "GET"
}).then(function (e) {
  console.log(e);
});
// return;
var dbg = true;
function findVideo(document){
    const removeParams = ['a', 'br', 'bt', 'cd', 'ch', 'cr', 'cs', 'cv', 'dr', 'ds', 'er', 'lr', 'vl', 'vr'];
    function patchURL(url) {
      var a = new URL(url);
      for (var i = 0; i < removeParams.length; i++) {
        a.searchParams.delete(removeParams[i]);
      }
      return a.href;
    }
    function tiktok() {
      const metas = document.getElementsByTagName('meta');
      if(!metas){
        return;
      }
      var urls = [];
      for (var i = 0; i < metas.length; i++) {
        const meta = metas[i];
        const txt = meta.content;
        if(txt.indexOf('tiktok.com/video') > -1){
          urls.push(patchURL(txt));
        }
      }
      if(urls.length > 0){
        return urls[0];
      }else{
        return;
      }
    }
    const videos = document.getElementsByTagName('video');
    if(videos){
        if(videos.length > 0){
          var src = videos[0].src;
          return src;
        }else{
          return tiktok();
        }
    }else{
      return tiktok();
    }
}

exports.video = async function (url) {
  if(url.indexOf('tiktok.com') == -1){
    return;
  }
  let promise = new Promise((resolve, reject) => {
    axios.request({
      method: 'GET',
      url: url,
      withCredentials: true,
      headers: { 'User-Agent': useragent, "Access-Control-Allow-Origin": "*"}
    }).then(function (e) {
      if(dbg){
        if(e.data.indexOf('TTGCaptcha') > -1){
          console.log('Captcha request!');
        }
      }
      console.log(e.headers['set-cookie']);
      fs.writeFileSync('test.html', e.data, { encoding: 'utf-8' });
      const document = new jsdom.JSDOM(e.data).window.document;
      const out = findVideo(document);
      if(out){
        axios.request({
          method: 'GET',
          url: out,
          responseType: 'arraybuffer',
          responseEncoding: 'binary',
          withCredentials: true,
          headers: { 'User-Agent': useragent,
           "range": "bytes=0-",
           "Access-Control-Allow-Origin": "*",
            Cookie: e.headers['set-cookie'].join(';')
          }
        }).then(function (e) {
          console.log(e.data);
          resolve('OK!');
        }).catch(function (e) {
          if(dbg){
            console.log('ERROR!');
            console.log(out);
          }
        });
      }else{
        resolve(undefined);
      }
    });
  });
  return await promise;
}

exports.video('').then(console.log)
