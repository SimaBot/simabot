const webutils = require('./webutils.js');
const axios = require('axios');
const { JSDOM } = require('jsdom');
// set axios default timeout to 1 seconds
axios.defaults.timeout = 3000;

const allowedTypes = ['abbr', 'img', 'b', 'a', 'br', 'code', 'i', 'strong',
 'em', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'tr', 'td',
  'textarea'];

async function searchEngine(keywords, type){
    return await webutils.duckIt(keywords);
}
async function webpageParse(dom, url){
    var text = '';
    var elements = dom.window.document.querySelectorAll('*');
    for (var i = 0; i < elements.length; i++) {
        // if allowed type
        if (allowedTypes.includes(elements[i].tagName.toLowerCase())) {
            // skip if parent is allowed type
            if (allowedTypes.includes(elements[i].parentElement.tagName.toLowerCase())) {
                if(elements[i].textContent){
                    text += elements[i].textContent;
                    text += '\n';
                }
                if(elements[i].src){
                    text += elements[i].src;
                    text += '\n';
                }
            }
        }
    }
    return text;
}
function isRelated(keywords, text){
    var keywords = keywords.toLowerCase();
    text = text.toLowerCase();
    if(text.indexOf(keywords) > -1){
        return true;
    }
    return false;
}

async function searchData(keywords, type){
    const array = await searchEngine(keywords, type);
    var out = [];
    var z = 0;
    var wait = 
    for (var i = 0; i < out.length; i++) {
        const e = out[i];
        axios.get(url, { headers: { 'User-Agent': webutils.useragent() } }).then(function(response){
            const dom = new JSDOM(response.data);
            const text = webpageParse(dom, url);
            if (isRelated(keywords, text)){
                out.push(text);
            }else{
                out.push(undefined);
            }
            z++;
            if (z == array.length){
                return out;
            }
        }).catch(function(error){
            console.log(error);
            z++;
            if (z == array.length){
                return out;
            }
        });
    }
}

searchData('shindo codes').then(function(arr){
    console.log(arr);
    // write to file with fs named 'out.txt'
    require('fs').writeFileSync('out.txt', arr.join('\n----------------\n'));
});