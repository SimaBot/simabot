const webutils = require('../webutils.js');
const axios = require('axios');
axios.defaults.timeout = 5000;

async function urlScanRblx(url) {
  var a = await webutils.unshort(url);
  if(!a){
    return '';
  }
  var log = [];
  if(a != url){
    log.push('Redirected: ' + a);
  }
  const secure = await webutils.isSecure(url);
  log.push('Secure: ' + webutils.yesno(secure));
  if(secure != false){
    if(a.indexOf('discord.com') > -1){
      log.push('Discord server AD!');
    }else{
      var scanForUrls = false;
      const req = await axios.get(a);
      const data = req.data;
      if(data.indexOf('html') == -1){
        log.push('Contains RAW data!');
        scanForUrls = true;
      }
      if(webutils.isLUA(data)){
        log.push('**>>>>>>>>>>>>> SCRIPT DETECTED <<<<<<<<<<<<<**')
      }
      if(scanForUrls){
        const urls = webutils.urlsArray(data);
        for (var i = 0; i < urls.length; i++) {
          const url = urls[i];
          const out = await urlScanRblx(url);
          log.push(out.replaceAll('\n', '\n..'));
        }
      }
    }
  }else{
    log.push('Ignored!');
  }
  return log.join('\n |_,--> ');
}
async function findScriptRblx(idea) {
  var log = [];
  const videoId = await webutils.findVideo(idea, '&sp=CAI');
  log.push('> Found "' + idea + '"!')
  log.push('URL: https://youtu.be/' + videoId);
  const initial = await webutils.ytInitial(videoId);
  if(initial){
    if(initial.playabilityStatus.status == 'OK'){
      const description = initial.videoDetails.shortDescription;
      const urls = webutils.urlsArray(description);
      log.push('Detected ' + urls.length + ' urls!');
      for (var i = 0; i < urls.length; i++) {
        const url = urls[i];
        log.push('Analyze URL: ' + url);
        const analyze = await urlScanRblx(url);
        log.push('```' + analyze + '```');
      }
      return [log, videoId];
    }
  }
}
exports.cheat = async function (idea) {
  const a = await findScriptRblx(idea);
  return a;
}
