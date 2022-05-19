var admin = require("firebase-admin");
const simabot = require("./simabot.js");
const textdb = require("./textdb.js");
const wordutils = require("./wordutils.js");

var prefix = 'none.';

var debug = false;

var branch = 'beta';

exports.setPrefix = function(p){
  prefix = p;
}

exports.setDebug = function(isDebug) {
  prefix = 'stable.';
  if(isDebug) {
    prefix = 'beta.';
  }
}

exports.setBranch = function(name) {
  branch = name;
  var cacheSetTimeout = 1000 * 5;
  if(name === 'stable'){
    cacheSetTimeout = 1000 * 30;
  }
  setInterval(cacheWorker, cacheSetTimeout);
}

const dbNames = ['botdb', 'goodwords', 'config', 'notifer', 'badwords'];

var fdb;
exports.init = async function (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: serviceAccount.databaseURL
  });
  fdb = admin.firestore();
}

function log(msg) {
  if(debug){
    console.log('db.js: ' + msg);
  }
}


var dbCache = {};
var lsCache = {};
// Database

exports.internalGet = async function (name, collection) {
  return await importList(name, collection);
}

exports.internalSet = async function () {
  
}

// Object User (old. Create user)

exports.user = async function (id, serverId, user) {
  var c = db.collection('U' + serverId);
  if(!id || !serverId){
    return log('[Error:user] provide id and serverId');
  }
  if(user){
    await c.doc(id).set(user);
  }else{
    const normal = {"banned": false, "badstar": 0, "bantimer": 0, "coin": 10, "lvl": 1, "op": false, "userid": id, "version": 1};
    const z = await c.where('userid', '==', id).get();
    user = z[0] || normal;
  }
  return user;
}

// Statistic for user

exports.stat = async function (id, serverId) {
	var data = await exports.user(id, serverId);
  var out = ' -= 👤 📈 =- ';
	out += '\n**LVL**: ' + Math.floor(data.lvl);
	out += '\n**$**: ' + data.coin;
  out += '\n**⚠️**: ' + data.badstar + '/15';
	return out;
}

// Ban user

exports.ban = async function (id, serverId, pref) {
  var config = pref || { 
    time: 44640
  };
  var user = exports.user(id, serverId);
  user.banned = true;
  user.bantimer = config.time;
  return await exports.user(id, serverId, user);
}

// Add to DB array

exports.ls = async function (namedb){
  const nameCollection = prefix + String(namedb);
  const keys = Object.keys(dbCache);
  var tmp = lsCache[namedb];
  if(!tmp){
    tmp = [];
    const snapshot = await fdb.collection(nameCollection).get();
    snapshot.forEach(doc => {
      tmp.push(doc.id);
    });
  }
  tmp = wordutils.removeDuplicatesFromArray(tmp.concat(keys));
  lsCache[namedb] = tmp;
  return tmp;
}

var cache = [];

async function cacheWorker(){
  // remove duplicates
  var tmpCache = [];
  for (let i = 0; i < cache.length; i++) {
    if(tmpCache.indexOf(cache[i]) === -1){
      tmpCache.push(cache[i]);
    }
  }
  cache = tmpCache;
  // set in cloud
  for(let i = 0; i < cache.length; i++){
    const e = cache[i];
    if(e){
      const data = await exports.get(e[0], e[1]);
      await exports.set(e[0], e[1], data, true);
    }
  }
  cache = [];
}

exports.set = async function (serverId, namedb, array, cloud) {
  var a = String(serverId);
  if (a.indexOf('DB') > -1) {
    a = a.replaceAll('DB', '');
  }
  a = 'DB' + a;
  if (typeof dbCache[a] == 'undefined') {
    dbCache[a] = {};
  }
  // add to lsCache if not exists
  if(!lsCache[namedb]){
    lsCache[namedb] = [];
  }
  if(lsCache[namedb].indexOf(a) === -1){
    lsCache[namedb].push(a);
  }
  if(!cloud){
    if (dbCache[a][namedb] == array) {
      log('[db.js] set: ' + namedb + ' is the same ' + cloud);
      return;
    }
  }
  dbCache[a][namedb] = array;
  if(cloud){
    log('set: ' + namedb + ' ' + array + ' cloud');
    var c = await exportList(a, namedb, array);
    return c;
  }else{
    log('set: ' + namedb + ' ' + array + ' cache');
    cache.push([serverId, namedb]);
  }
}

async function exportList(name, collection, array){
  await fdb.collection(prefix + String(collection)).doc(String(name)).set(Object.assign({}, array));
  return true;
}

exports.setRadio = async function (data){
  await fdb.collection('radio').doc('radio').set({
    info: data
  });
}
// Get DB array

exports.get = async function (serverId, namedb) {
  var a = '';
  a += serverId;
  if(a.indexOf('DB') > -1){
    a = a.replaceAll('DB', '');
  }
  a = 'DB' + a; 
  log('get ' + a + ' name ' + namedb);
  if(dbCache[a]){
    if(dbCache[a][namedb]){
      log('Using local db cache...');
      return dbCache[a][namedb];
    }else{
      dbCache[a][namedb] = [];
    }
  }else{
    dbCache[a] = {};
    return [];
  }
  log('Using cloud db...');
  const arr = await importList(a, namedb);
  for (let i = 0; i < arr.length; i++) {
    const e = arr[i];
    dbCache[a][namedb].push(e);
  }
  return arr;
}

exports.botdb = function (){
  return textdb.botdb;
}

exports.mergeObjects = function (one, two){
  const array = Object.keys(one);
  var out = {};
  for (let i = 0; i < array.length; i++) {
    const name = array[i];
    if (['config', 'notify'].indexOf(name) > -1){
      out[name] = two[name];
    }else{
      out[name] = one[name].concat(two[name]);
    }
  }
  return out;
}

exports.getGuildDB = async function (serverId){
  var db = {};
  for (let i = 0; i < dbNames.length; i++) {
    const name = dbNames[i];
    if(name == 'config'){
      db.config = await exports.getCfgServer(serverId);
    }else{
      db[name] = await exports.get(serverId, name);
    }
  }
  return db;
}

exports.setGuildDB = async function (serverId, db){
  const array = Object.keys(db);
  for (let i = 0; i < array.length; i++){
    await exports.set(serverId, array[i], db[array[i]]);
  }
}

async function importList(name, collection){
  const z = await fdb.collection(prefix + collection).doc(name).get();
  const data = z.data();
  if (typeof data == 'undefined') {
    return [];
  }
  const array = Object.assign([], data);
  return array;
}

var selectsUsers = {};

// Helper, which provides user-friendly edit.

function findNumberInArray(array){
  for (let i = 0; i < array.length; i++) {
    if (Number(array[i])){
      return array[i];
    }
  }
}

exports.typifer = function (data, def){
  if (data == 'true'){
    return true;
  }
  if(data == 'false'){
    return false;
  }
  if(data == 'null'){
    return null;
  }
  if(data == 'undefined'){
    return undefined;
  }
  if(typeof def == 'number'){
    return Number(data);
  }
  return String(data);
}

function notiferPeopleFriendly (out){
  try{
    const obj = JSON.parse(out);
    return '🔗: ' + obj.url + ' | ChannelID: ' + obj.channel;
  }catch (err){
    return '(SimaBot saying..: Error parsing JSON!) ' + out;
  }
}
exports.helper = async function (msg, guildId, userId) {
  var dbName = null;
  for (let i = 0; i < dbNames.length; i++) {
    if (msg.indexOf(dbNames[i]) > -1) {
      dbName = dbNames[i];
    }
  }
  if (!dbName) {
    dbName = selectsUsers[userId];
  }
  selectsUsers[userId] = dbName;
  if(!dbName) {
    return 'Please enter full name of db to proceed. Learn more at https://simabot.github.io/';
  } 

  var mode = 'get';

  if(msg.indexOf('[=]') > -1) {
    mode = 'set';
  }
  if (msg.indexOf('[+]') > -1) {
    mode = 'add';
  }
  if (msg.indexOf('[-]') > -1) {
    mode = 'remove';
  }
  if (dbName == 'config') {
    if(msg.indexOf('`') > -1) {
      mode = 'set';
    }else{
      mode = 'get';
    }
  }

  var n = findNumberInArray(msg.split(' '));
  var data = null;

  try {
    data = msg.split('`')[1].split('`')[0];
  }
  catch (err){

  }
  var page = n || 1;

  const sizePage = 10;
  var msg = '';

  var db, configdb;

  if(dbName == 'config') {
    configdb = await exports.getCfgServer(guildId);
    db = Object.keys(configdb);
  }else{
    db = await exports.get(guildId, dbName);
  }

  switch (mode) {
    case 'get':
      var maxPage = (db.length / sizePage);
      maxPage = Math.floor(maxPage + 1);
      if(maxPage < 0){
        maxPage = 1;
      }
      if (1 > page){
        page = 1;
      }
      if(page > maxPage){
        page = maxPage;
      }
      var start = sizePage * (page - 1);
      if(start > db.length) {
        start = db.length - sizePage;
      }
      if(start < 0) {
        start = 0;
      }
      msg += '📓 ' + (textdb.db[dbName] || dbName) + ' (📄 ' + page + '/' + maxPage + '):\n';
      for (let i = start; i < (start + sizePage); i++) {
        var out = db[i];
        if (db[i]){
          if (dbName == 'notifer') {
            out = notiferPeopleFriendly(out);
          }
          if(dbName == 'config'){
            out = textdb.config[out] + ': `' + configdb[out] + '`'; 
          }
          msg += '*[' + i + ']* ' + out + '\n';
        }
      }
      return msg;
    case 'remove':
      if(n > db.length) {
        return 'No such element ' + n + ' in db ' + dbName + '. (0 - ' + db.length + ')';
      }
      var tmp = db[n];
      if(dbName == 'notifer') {
        tmp = notiferPeopleFriendly(tmp);
      }
      db.splice(n, 1);
      await exports.set(guildId, dbName, db);
      return '✅ 🔥' + n + '! Backup:\n' + tmp; // TODO: Disable backup via config
    case 'set':
      if(dbName == 'notifer') {
        return '🚫 Action ' + mode + ' not allowed for ' + dbName + '.';
      }
      if (n > db.length) {
        return 'No such element ' + n + ' in db ' + dbName + '. (0 - ' + db.length + ')';
      }
      if (!data) {
        return 'Enter data "`"!';
      }
      if(dbName == 'config'){
        // if config empty, set default
        configdb[db[n]] = data;
        await exports.set(guildId, dbName, [JSON.stringify(configdb)]);
        return '✅ ✍️!';
      }else{
        db[n] = data;
      }
      await exports.set(guildId, dbName, db);
      return '✅ ✍️!';
    case 'add':
      if (dbName == 'notifer') {
        return '🚫 Use Notify Editor: https://simabot.github.io/.';
      }
      if(!data){
        return 'Enter data in "`"!';
      }
      db.push(data);
      await exports.set(guildId, dbName, db);
      return '✅ Added!';
  }
  
}

var defaultCfg = {
  
}
exports.getCfgServer = async function (serverId){
  const cfg = await exports.get(serverId, 'config');
  const defaultConfig = textdb.configDefaults;
  var config;
  try {
    config = JSON.parse(cfg[0]);
  } catch (err) {
    return defaultConfig;
  }
  var outConfig = {};
  const array = Object.keys(defaultConfig);
  for(let i = 0; i < array.length; i++){
    if(config[array[i]]){
      outConfig[array[i]] = exports.typifer(config[array[i]], defaultConfig[array[i]]);
    }else{
      outConfig[array[i]] = defaultConfig[array[i]];
    }
  }
  return outConfig;
}

exports.addCoin = async function (coin, userid, guildId) { // TODO: Detect bots and ignore them.
  var user = await exports.user(userid, guildId);
  user.coin += coin;
  user.lvl += Math.abs(coin / data.lvl * 10);
  await exports.user(userid, guildId, user);
}

exports.giveBadstar = async function (serverId, id, config){ //TODO: Config
  if(!msg){
    return log('Not specified giveBadstar: msg!');
  }
  var user = exports.user(id, serverId);
  data.badstar++;
  data.lvl--;
  data.coin -= 10;
  await exports.user(id, serverId, user);
  return data.badstar;
}