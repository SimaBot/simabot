const axios = require('axios');
const jsdom = require('jsdom');
const debug = false;

const proxy = '/?';
function parseImage(html, id) { // default 1
  // console.log(html);
  const d = new jsdom.JSDOM(html).window.document;
  const thmbList = d.getElementsByClassName('thumbs_list');
  if(thmbList.length == 0){
    return undefined;
  }
  try {
    return 'https://' + thmbList[id].getElementsByClassName('al_photo')[0].getElementsByTagName('div')[0].style.backgroundImage.split('https://')[1].split('&type')[0];
  } catch (e) {
    return undefined;
  }
}

exports.getGroup = async function (id, idpost) {
  const url = proxy + 'https://m.vk.com/' + id;
  if(debug){
    console.log('Request url: ' + url);
  }
  var out;
  try{
    out = await axios.get(url);
  }
  catch{
    return undefined;
  }
  return parseImage(out.data, idpost);
}
function test() {
  console.log('Testing...');
  const arrayMemesGroups = ['minememes', 'fckbrain', 'terraria_comunity'];
  for (var i = 0; i < arrayMemesGroups.length; i++) {
    exports.getGroup(arrayMemesGroups[i], 1).then(console.log);
  }

}
// for (var i = 0; i < 1000; i++) {
//   test();
// }
