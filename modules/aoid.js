// AOID - Always Online In Discord

const urlWss = 'wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream';
const debug = false;


function log(text) {
  if(debug){
    console.log('AOID:', text);
  }
}

function aoid(token, s){
  if(!token){
    return log('No token!');
  }
  var statusDefault = {
    text: 'AOID SimaBot',
    emoji: { "id": null, "name": "ð¿", "animated": false },
    status: 'online',
    afk: false
  };
  var status = statusDefault;
  if(typeof s == 'object'){
    if(s.text){
      status.text = s.text;
    }
    if(s.emoji){
      status.emoji = s.emoji;
    }
    if(s.status){
      status.status = s.status;
    }
    if(s.afk){
      status.afk = s.afk;
    }
  }

  const connectMsg = { "op": 6, "d": { "token": token, "seq": 265 } };
  const connectMsg2 = {
    "op": 2, "d": {
      "token": token, "capabilities": 509,
      "properties":
        {}
    }
  };
  const setstatusMsg = { "op": 3, "d": { "status": status.status, "since": 0, "activities": [{ "name": "Custom Status", "type": 4, "state": status.text, "emoji": status.emoji }], "afk": status.afk } };

  var WebSocketClient = require('websocket').client;

  var client = new WebSocketClient();

  client.on('connectFailed', function (error) {
    client.connect(urlWss);
  });

  client.on('connect', function (connection) {
    log('WebSocket Client Connected');
    connection.on('error', function (error) {
      client.connect(urlWss);
    });
    connection.on('close', function () {
      client.connect(urlWss);
    });
    var afterConnection = false;
    connection.on('message', function (message) {
      if (message.type === 'utf8') {
        log("Received: '" + message.utf8Data + "'");
      }
      if (message.type == 'binary') {
        const bin = message.binaryData;
        const txt = bin.toString('hex');
        if (afterConnection) {
          log('Trying set status...');
          connection.sendUTF(JSON.stringify(setstatusMsg));
          afterConnection = false;
        }
        if (txt.startsWith('789c')) {
          log('Connect request!');
          afterConnection = true;
          connection.sendUTF(JSON.stringify(connectMsg2));
        }
        // console.log(txt);
      }
    });
  });

  client.connect(urlWss);
}

function start(data) {
  if(typeof data != 'object'){
    return log('No data!');
  }
  if (Array.isArray(data)){
    for(var i = 0; i < data.length; i++){
      aoid(data[i].token, data[i].status);
    }
  }else{
    aoid(data.token, data.status);
  }
}

exports.init = function(data) {
  start(data.secret.aoid);
}