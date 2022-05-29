// Script what ports spotify playlist to youtube playlist
// Only requires YouTube credentials, youtube playlist id and spotify playlist id

const axios = require('axios');
const jsdom = require('jsdom');

const fs = require('fs');
const { JSDOM } = jsdom;


var problemsAdding = 0;
const ytPlaylist = 'HIDDEN'
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function addToPlaylist (videoId, tryCount) {
  var tryes = 0;
  if(tryCount){
    tryes = tryCount;
  }
  tryes++;
  try {
    await axios.post("https://www.youtube.com/youtubei/v1/browse/edit_playlist?key=HIDDEN",
      "{\"context\":{\"client\":{\"hl\":\"ru\",\"gl\":\"UA\",\"deviceMake\":\"\",\"deviceModel\":\"\",\"visitorData\":\"HIDDEN\",\"userAgent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36,gzip(gfe)\",\"clientName\":\"WEB\",\"clientVersion\":\"2.20211026.01.00\",\"osName\":\"X11\",\"osVersion\":\"\",\"originalUrl\":\"https://www.youtube.com/\",\"platform\":\"DESKTOP\",\"clientFormFactor\":\"UNKNOWN_FORM_FACTOR\",\"configInfo\":{\"appInstallData\":\"HIDDEN\"},\"timeZone\":\"HIDDEN\",\"browserName\":\"Chrome\",\"browserVersion\":\"94.0.4606.81\",\"screenWidthPoints\":1365,\"screenHeightPoints\":966,\"screenPixelDensity\":1,\"screenDensityFloat\":1,\"utcOffsetMinutes\":180,\"userInterfaceTheme\":\"USER_INTERFACE_THEME_LIGHT\",\"connectionType\":\"CONN_CELLULAR_4G\",\"mainAppWebInfo\":{\"graftUrl\":\"https://www.youtube.com/watch?v=" + videoId + "\",\"webDisplayMode\":\"WEB_DISPLAY_MODE_BROWSER\",\"isWebNativeShareAvailable\":false}},\"user\":{\"lockedSafetyMode\":false},\"request\":{\"useSsl\":true,\"internalExperimentFlags\":[],\"consistencyTokenJars\":[]},\"clickTracking\":{\"clickTrackingParams\":\"HIDDEN\"},\"adSignalsInfo\":{\"params\":[{\"key\":\"dt\",\"value\":\"HIDDEN\"},{\"key\":\"flash\",\"value\":\"0\"},{\"key\":\"frm\",\"value\":\"0\"},{\"key\":\"u_tz\",\"value\":\"180\"},{\"key\":\"u_his\",\"value\":\"8\"},{\"key\":\"u_h\",\"value\":\"1080\"},{\"key\":\"u_w\",\"value\":\"1920\"},{\"key\":\"u_ah\",\"value\":\"1040\"},{\"key\":\"u_aw\",\"value\":\"1920\"},{\"key\":\"u_cd\",\"value\":\"24\"},{\"key\":\"bc\",\"value\":\"31\"},{\"key\":\"bih\",\"value\":\"966\"},{\"key\":\"biw\",\"value\":\"1349\"},{\"key\":\"brdim\",\"value\":\"0,0,0,0,1920,0,1920,1040,1365,966\"},{\"key\":\"vis\",\"value\":\"1\"},{\"key\":\"wgl\",\"value\":\"true\"},{\"key\":\"ca_type\",\"value\":\"image\"}],\"bid\":\"HIDDEN\"}},\"actions\":[{\"addedVideoId\":\"" + videoId + "\",\"action\":\"ACTION_ADD_VIDEO\"}],\"playlistId\":\"" + ytPlaylist + "\"}", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": "SAPISIDHASH HIDDEN",
            "content-type": "application/json",
            "x-client-data": "HIDDEN",
            "x-goog-authuser": "0",
            "x-goog-visitor-id": "HIDDEN",
            "x-origin": "https://www.youtube.com",
            "cookie": "VISITOR_INFO1_LIVE=HIDDEN; CONSENT=HIDDEN; YSC=HIDDEN; PREF=tz=HIDDEN; GPS=1; LOGIN_INFO=HIDDEN.; SIDCC=HIDDEN; __Secure-3PSIDCC=HIDDEN"
          },
          "referrer": "https://www.youtube.com/watch?v=" + videoId + "",
          "referrerPolicy": "strict-origin-when-cross-origin"
        });
  } catch (e) {
    if(tryes < 10){
      problemsAdding += 1;
      await timeout(problemsAdding);
      console.log('Retry add...' + videoId + ' ' + problemsAdding);

      await addToPlaylist(videoId, tryes);
    }
  } finally {

  }
}

async function spotifyToYT() {
  const playlistId = 'HIDDEN';
  var notFound = [];
  var g = 0;
  var ended = 0;
  var added = 0;
  const e = await getPlaylistSpotify(playlistId);
    for (var i = 0; i < e.length; i++) {
      const keywords = e[i];
      const videoId = findVideo(keywords).then(function (videoId) {
        if(videoId){
          ended++;
          const percents = ended / e.length * 100;
          const len = e.length;
          console.log([keywords, videoId, percents]);
          addToPlaylist(videoId).then(function (e) {
            added++;
            console.log('added %' + added / len * 100);
          })
        }else{
          g++;
          notFound.push(keywords);
        }
      });
      console.log(e.length, i);
    }
  return notFound;
}

getAccessTokenSpotify().then(function (token) {
  spotifyApi.setAccessToken(token);
  spotifyToYT().then(function (e) {
    console.log('Ended!');
    console.log(e.join('\n'));
  });
});
