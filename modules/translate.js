const translatte = require('translatte');

exports.debug = true;

exports.toEn = async function (text) {
  try {
    const res = await translatte(text, { to: "en" });
    return exports.fixMentions(res.text);
  }
  catch (err) {

  }
}

exports.isRussian = function (text) {
    const chars = 'АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя';
    var i = 0;
    while(i != text.length){
        if(chars.indexOf(text[i]) != -1){
            return true;
        }
        i++;
    }
    return false;
}

exports.toRu = async function (text) {
  if (exports.isRussian(text)) {
    return text;
  }
  try {
    const res = await translatte(text, { to: "ru" });
    return exports.fixMentions(res.text);
  }
  catch (err) {

  }
}

// Text, Lang(from), Lang2(to)
exports.to = async function (text, lang, lang2) {
  if(!lang2){
    lang2 = lang;
    lang = 'auto';
  }
  // TODO
}

exports.fixMentions = function (e) {
  return e.replaceAll('<@ ', '<@').replaceAll('<# ', '<#').replaceAll('<@! ', '<@!');
}
exports.translateMsg = async function (text) {
  let promise = new Promise((resolve, reject) => {
    var msg = '';
    if(exports.isRussian(text)){
      translatte(text, { to: "en" })
        .then(res => {
          if(text != res.text){
            msg += ':flag_us: **ENG:** \n';
            msg += res.text;
          }
          msg = msg.substr(0, 1998);
          resolve(msg);
        }).catch(err => {
          if(exports.debug){
            resolve(err.message.substr(0,1998));
          }else{
            resolve('');
          }
        });
    }else{
      translatte(text, { to: "ru" })
        .then(res2 => {
          msg += '**:flag_ru: RUS:** \n';
          msg += res2.text;
          msg = msg.substr(0, 1998);
          resolve(msg);
        }).catch(err => {
          if(exports.debug){
            resolve((err.message).substr(0,1998));
          }else{
            resolve('');
          }
      });
    }
  });

  return await promise;
}

// (async function () {
//   console.log(await translateMsg(text));
// })();
