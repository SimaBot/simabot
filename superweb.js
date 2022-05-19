const webutils = require('./webutils.js');
const axios = require('axios');
// const { JSDOM } = jsdom;
axios.defaults.timeout = 5000;

var superwebs = [];

superwebs.push(function(url, html, dom, type){
    return undefined; // Just example code.
});

exports.text = function (){

}

exports.search = function (keywords, type){

}

exports.url = async function (url, type){
    const html = await axios.get(url, { headers: { 'User-Agent': webutils.useragent() } });
    const dom = webutils.document(html);
    for (var i = 0; i < superwebs.length; i++) {
        const out = superwebs[i](url, html, dom, type);
        if(out){
            // TODO: Detect http(s) address and go to them.
            return out;
        } 
    }
    // TODO: Use exports.text();
}