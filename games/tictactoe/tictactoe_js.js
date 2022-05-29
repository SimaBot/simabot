var game = document.getElementById('game');

function createWorkspace() {
  for (var y = 0; y < 3; y++) {
    var div = document.createElement('div');
    for (var x = 0; x < 3; x++) {
      var sheet = document.createElement('b');
      sheet.innerText = '-';
      sheet.className = 'sheet';
      const n = getXY(x, y) + 1;
      sheet.id = String(n);
      sheet.onclick = function (e) {
        tick(e.target.id);
      }
      div.appendChild(sheet);
    }
    game.appendChild(div);
  }
}

function renderGameHTML(gd, renderinfo) {
  gd = gd.split('');
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
    return '-';
  }
  for (var i = 0; i < gd.length; i++) {
    var el = document.getElementById(String(i + 1))
    el.innerText = ch(gd[i]);
  }
}

console.log = function (e) {
  var c = document.getElementById('console');
  var p = document.createElement('p');
  p.innerText = e;
  c.appendChild(p);
}

createWorkspace();

var myGame = createGame('Console', 'AI');
render();
