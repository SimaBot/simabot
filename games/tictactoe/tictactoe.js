var random;

if(typeof require != 'undefined'){
  random = require('./random.js');
  var stdin = process.openStdin();
}else{
  random = {};
  random.between = function (max, min) {
    const r = Math.random();
    return Math.floor( r * (max - min) + min  );
  }
}


const consolerenderinfo = {
  newline: '\n',
  empty: '...',
  fplayer: 'O',
  splayer: 'X'
};
var games = {};
function createGame(firstuser, seconduser) {
  const gameid = random.between(0, 1024 * 1024);
  const game = {
    'firstUser': firstuser,
    'secondUser': seconduser,
    'data': '---------',
    'firstPlayer': true
  };
  games[gameid] = game;
  return gameid;
}

function renderGame(data, renderinfo) {
  var msg = '';
  function ch(i) {
    if(i == '-'){
      return renderinfo.empty;
    }
    if(i == 'O'){
      return renderinfo.fplayer;
    }
    if(i == 'X'){
      return renderinfo.splayer;
    }
  }
  for (var i = 0; i < data.length; i++) {
    msg += ch(data[i]);
    if((i + 1) / 3 == Math.floor((i + 1) / 3)){
      msg += renderinfo.newline;
    }
  }
  return msg;
}

function deleteGame(gameid) {
  delete games[gameid];
}

function getXY(x, y) {
  return x + (y * 3);
}
function checkWin(gd) {
  const t = gd.replaceAll('-', '?');
  function testFor(char, badchar) {
    const p = t.replaceAll(badchar, '?').replaceAll(char, 'X');
    var winned = false;
    function xy(x, y) {
      if(x < 4){
        if(y < 4){
          return p[getXY(x, y)] == 'X'
        }
      }
      return false;
    }
    function check(x, y, x2, y2) {
      if((x < 4) && (-1 < x)){
        if((y < 4) && (-1 < y)){
          if(xy(x, y)){
            if(xy(x + x2, y + y2)){
              if(xy(x + (x * 2), y + (y2 * 2))){
                winned = true;
              }
            }
          }
        }
      }
    }
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        check(x, y, 0, 1);
        check(x, y, 0, -1);
        // check(x, y, 1, 1);
        // check(x, y, -1, -1);
        // check(x, y, -1, 1);
        // check(x, y, 1, -1);
        check(x, y, 1, 0);
        check(x, y, 0, 1);
      }
    }
    return winned;
  }
  if(testFor('X', 'O')){
    return 'X';
  }
  if(testFor('O', 'X')){
    return 'O';
  }
  if(gd.indexOf('-') == -1){
    return '=';
  }else{
    return '_';
  }
}
function AI(gd, char) {
  var badchar = 'X';
  if(char == 'X'){
    badchar = 'O';
  }
  const gds = gd;
  gd = gd.split('');
  function f() {
    const tmp = gd.join('');
    return tmp;
  }
  if(gds == '---------'){
    console.log('AI: Tactical');
    var n = 4;
    while(n == 4){
      n = random.between(0, 8);
    }
    gd[n] = char;
    return f();
  }else{
    var possible;
    console.log('AI: Interactive');
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        if(gds[getXY(x, y)] == '-'){
          if(gds[getXY(x, y + 1)] == badchar){
            possible = getXY(x, y + 1)
          }
          if(gds[getXY(x, y - 1)] == badchar){
            possible = getXY(x, y - 1)
          }
          if(gds[getXY(x + 1, y)] == badchar){
            possible = getXY(x + 1, y)
          }
          if(gds[getXY(x - 1, y)] == badchar){
            possible = getXY(x - 1, y)
          }
        }
      }
    }
    console.log('Possible' + possible);
    const temp = tryPUT(gds, possible -1, char);
    if(temp.length == 2){
      console.log('AI: Like-Random');
      for (var i = 0; i < gd.length; i++) {
        if(gd[i] == '-'){
          gd[i] = char;
          return f();
        }
      }
    }else{
      return temp;
    }
  }
  return f();
}
function tryPUT(gd, i, char) {
  const array = String(i).split('');
  var t = '';
  for (var i = 0; i < array.length; i++) {
    const v = array[i];
    if(String(v) == String(Number(v))){
      t += v;
    }
  }
  t = Number(t);
  if(String(t).length == 1){
    if(t < 10){
      if(t > 0){
        const n = t - 1;
        if(gd[n] == '-'){
          var gdt = gd.split('');
          gdt[n] = char;
          return gdt.join('');
        }else{
          return [gd, 'Место уже занято!'];
        }
      }else{
        console.log('_' + t);
        return [gd, 'Неверное значение(маленькое)!'];
      }
    }else{
      return [gd, 'Неверное значение(большое)!'];
    }
  }else{
    return [gd, '?'];
  }
}
function tick(csl) {
  if(games[myGame].firstPlayer && csl){
    const out = tryPUT(games[myGame].data, String(csl), 'O');
    if(out.length != 2){
      games[myGame].data = out;
      games[myGame].firstPlayer = false;
      const winCheck = checkWin(games[myGame].data);
      if(winCheck != '_'){
        var name = 'Draw';
        if(winCheck == 'O'){
          name = games[myGame].firstUser;
        }
        if(winCheck == 'X'){
          name = games[myGame].secondUser;
        }
        console.log('Winned:' + name);
        render();
        myGame = createGame('Console', 'AI');
      }else{
        tick();
        render();
      }
    }else{
      console.log(out[1] + '\n');
    }
  }else if(!csl){
    games[myGame].data = AI(games[myGame].data, 'X');
    games[myGame].firstPlayer = true;
  }
  // console.log(games[myGame].data);
  // games[myGame].data = 'XXXOOO--X';
}
function render() {
  // console.log('RENDER:');
  // console.log(renderGame(games[myGame].data, consolerenderinfo));
  renderGameHTML(games[myGame].data, consolerenderinfo);
}
function run() {

  render();
  // stdin.addListener("data", tick);
  tick();
}
if(typeof require != 'undefined'){
  run();
}
