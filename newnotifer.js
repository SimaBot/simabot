const channels = require('./channels.js');
const wordutils = require('./wordutils.js');
const crypto = require('crypto');

var cache = {};
var db = null;

var debug = false;
function log(msg){
    if(debug) console.log(msg);
}
var waitingMsgs = [];

function checksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

// clear cache 10 seconds
setInterval(function () {
    cache = {};
}, 10000);

exports.parser = function (url) {
    const simabot = typeof channels !== 'undefined';
    var out = {
        id: -1,
        data: '',
        msg: '',
        bigbuffer: false
    };
    var urlObj = null;

    try {
        urlObj = new URL(url);
    }
    catch (err) {
        return { error: '04' };
    }

    if (!urlObj) {
        return { error: '03' };
    }
    if (simabot) {
        if (urlObj.host != 'simabot.github.io') {
            return { error: '05' };
        }
    }
    const params = urlObj.searchParams;
    out.id = Number(params.get('i')) || -1;
    if (out.id == -1) {
        return { error: '07' };
    }
    if (simabot) {
        // Check if id not out of range
        const arr = Object.keys(channels.channels);
        if ((out.id + 1) > arr.length) {
            return { error: '14' };
        }
    }
    const data = params.get('d');
    if (data) {
        out.data = decodeURIComponent(data);
    }
    const msg = params.get('m');
    if (msg) {
        out.msg = decodeURIComponent(msg);
    }
    return out;
}

function createError (code, url, msg){
    var message = '';
    if(msg){
        message = ('\n💬: ' + msg);
    }
    var error = 'Notify: ⚠️!';
    if(code){
        error += ' Code: ' + code;
    }
    error += '\n🔔: ' + url + message;
    return { error:  error };
}

async function get(id, data, url){
    const name = channels.array[id];
    var pt = null;
    if (name == 'simabot'){
        pt = db.get('0', 'botdb');
    }
    try{
        const out = await channels.channels[name](data, pt);
        if(!out){
            return createError(3, url);
        }
        if(typeof out === 'object'){
            if(out.error){
                return createError(null, url, out.error);
            }else{
                return createError(3, url);
            }
        }
        return out;
    }catch(err){
        const stack = String(err.stack).split('\n').slice(0, 2).join('\n');
        return createError(16, url, stack);
    }
}

exports.url = async function (url){
    const a = exports.parser(url);
    if(a.error){
        return createError(a.error, url);
    }
    var out;
    const id = a.id;
    const data = a.data;
    out = cache[data + id];
    if (!out) {
        out = await get(id, data, url);
    }
    cache[data + id] = out;
    if (out) {
        if(typeof out === 'object'){
            if (out.error){
                return out;
            }else{
                return createError(11, url);
            }
        }else{
            return wordutils.replaceArg(a.msg, out);
        }
    } else {
        return createError(11, url);
    }
}

async function checkUpdate (data){
    const out = await exports.url(data.url);
    if(!data.url){
        return;
    }
    if(!out){
        return;
    }
    var chksum = null;
    var echksum = null;
    var msg = out;
    if(typeof out === 'object'){
        if (out.error){
            echksum = checksum(out.error);
            msg = out.error;
        }
    }else{
        chksum = checksum(out);
    }
    if (!data.chksums){
        data.chksums = [];
    }
    if (!data.echksums) {
        data.echksums = [];
    }
    if (out.bigbuffer){
        if(data.chksums.length > 99){
           data.chksums.shift();
        }
    }
    if (data.echksums.length > 99) {
        data.chksums.shift();
    }
    const info = { msg: msg, channel: data.channel, guildid: data.guildid };
    if (echksum) {
        if (data.echksums.indexOf(echksum) == -1) {
            waitingMsgs.push(info);
            data.echksums.push(echksum);
        }
    }
    if (chksum) {
        if(data.chksums.indexOf(chksum) == -1){
            waitingMsgs.push(info);
            if (!out.bigbuffer) {
                data.chksums = [];
            }
            data.chksums.push(chksum);
        }
    }
    return data;
}

async function checkUpdatesFromList (list){
    var newlist = [];
    var done = 0;
    if(list.length == 0){
        return newlist;
    }
    let promise = new Promise((resolve, reject) => {
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            try {
                const data = JSON.parse(item);
                checkUpdate(data).then(function (out) {
                    log(out);
                    if(out){
                        done++;
                        newlist.push(JSON.stringify(out));
                        log('done: ' + done, 'total: ' + list.length);
                        if(done == list.length){
                            resolve(newlist);
                        }
                    }
                });
            }
            catch (err) {
                done++;
                newlist.push(list[i]);
                log('done: ' + done, 'total: ' + list.length);
                // console.log(err);
                if (done == list.length) {
                    resolve(newlist);
                }
            }
        }
    });
    return await promise;
}

exports.checkUpdates = async function (){
    waitingMsgs = [];
    log('checkUpdates 217');
    const dbs = await db.ls('notifer');
    log('checkUpdates db.ls');
    log(dbs);
    var z = 0;
    log('preparation');
    let promise = new Promise((resolve, reject) => {
        for(let i = 0; i < dbs.length; i++){
            const guild = dbs[i];
            db.get(guild, 'notifer').then(async function (list){
                log(list);
                const newlist = await checkUpdatesFromList(list);
                log('checkUpdates ' + guild + ' ' + newlist.length);
                log(newlist);
                if (newlist.join('.') != list.join('.')) {
                    db.set(guild, 'notifer', newlist);
                    z++;
                    if (z == dbs.length) {
                        resolve();
                    }
                } else {
                    z++;
                    if (z == dbs.length) {
                        resolve();
                    }
                }
            });
        } 
    });
    await promise;
    log('resolve');
    // remove repeated messages
    var newWaitingMsgs = [];
    for(let i = 0; i < waitingMsgs.length; i++){
        const item = waitingMsgs[i];
        if(newWaitingMsgs.indexOf(item) == -1){
            newWaitingMsgs.push(item);
        }
    }
    return newWaitingMsgs;
}
exports.addNotify = async function (url, guildId, channelId){
    const urlCheck = exports.parser(url);
    if(urlCheck.error){
        return urlCheck.error;
    }
    var list = await db.get(guildId, 'notifer');
    list.push(JSON.stringify({ url: url, channel: channelId, guildid: guildId }));
    const save = await db.set(guildId, 'notifer', list);
}
exports.init = function (dbaccess){
    db = dbaccess;
}