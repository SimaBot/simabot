const random = require('./modules/random.js');

var bufferTextArray = {};

function splitStringArithmetic(str) {
  var index = 0;
  var splitArray = str.split("").reduce((arr, v, i) => {
    if (isNaN(parseInt(v))) {
      arr.push(str.slice(index, i));
      arr.push(v);
      index = i + 1;
    }
    return arr;
  }, []);
  splitArray.push(str.slice(index));
  return splitArray;
}

function findMultIndex(arr) {
  return arr.findIndex(i => i == "*");
}

function findDivIndex(arr) {
  return arr.findIndex(i => i == "/");
}

function findAddIndex(arr) {
  return arr.findIndex(i => i == "+");
}

function findSubIndex(arr) {
  return arr.findIndex(i => i == "-");
}

function multiply(arr) {
  var index = findMultIndex(arr);
  arr[index] = parseInt(arr[index - 1]) * parseInt(arr[index + 1]);
  return arr.filter((c, i) => {
    return i !== index - 1 && i !== index + 1;
  });
}

function divide(arr) {
  var index = findDivIndex(arr);
  arr[index] = parseInt(arr[index - 1]) / parseInt(arr[index + 1]);
  return arr.filter((c, i) => {
    return i !== index - 1 && i !== index + 1;
  });
}

function add(arr) {
  var index = findAddIndex(arr);
  arr[index] = parseInt(arr[index - 1]) + parseInt(arr[index + 1]);
  return arr.filter((c, i) => {
    return i !== index - 1 && i !== index + 1;
  });
}

function subtract(arr) {
  var index = findSubIndex(arr);
  arr[index] = parseInt(arr[index - 1]) - parseInt(arr[index + 1]);
  return arr.filter((c, i) => {
    return i !== index - 1 && i !== index + 1;
  });
}

function containsMultOrDiv(arr) {
  return arr.some(i => i === "*" || i === "/");
}

function containsAddOrSub(arr) {
  return arr.some(i => i === "+" || i === "-");
}

function simplify(arr) {
  while (containsMultOrDiv(arr)) {
    if (arr.includes("*")) {
      if (arr.includes("/")) {
        if (findDivIndex(arr) < findMultIndex(arr)) {
          arr = divide(arr);
        } else {
          arr = multiply(arr);
        }
      } else {
        arr = multiply(arr);
      }
    } else {
      arr = divide(arr);
    }
  }
  while (containsAddOrSub(arr)) {
    if (arr.includes("+")) {
      if (arr.includes("-")) {
        if (findSubIndex(arr) < findAddIndex(arr)) {
          arr = subtract(arr);
        } else {
          arr = add(arr);
        }
      } else {
        arr = add(arr);
      }
    } else {
      arr = subtract(arr);
    }
  }
  return arr;
}
exports.evaluate = function(str) {
  var arithmeticArray = splitStringArithmetic(str);

  return simplify(arithmeticArray);
}

// evaluate end

// Need reworking "botdb"

exports.addToDB = function (q, a, botdb) {
  const oldBotdb = botdb;
	const p = exports.battleSentexces(exports.arrayOfQuestions(botdb), q)[0];
	const needEdit = p > 80;
	var obj = {"q": [], "a": []};
	var id = null;
	id = exports.getRuleByAQ(q, botdb);
	obj = JSON.parse(botdb[id]);
	if(obj.q.indexOf(q) == -1){
		obj.q.push(q);
	}
	if(obj.a.indexOf(a) == -1){
		obj.a.push(a);
	}
	obj = JSON.stringify(obj);
	if(id){
		botdb[id] = obj;
	}else{
		botdb.push(obj);
	}
  if (oldBotdb != botdb){
    return botdb;
  }
}
exports.filterText = function (txt) {
  const array = txt.split(' ');
  var array2 = [];
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if(e[0] != '@'){
      array2.push(e);
    }
  }
  return array2.join(' ');
}
const warnTexts = { 'WORD': 'маты', 'WORD-EN': 'bad words' }
exports.getWarnText = function (code, badstar, count) {
  let plusbadstar = '\n⚠️ 🤲 **+1';
  if(count){
    plusbadstar += ' (' + count + ')';
  }
  plusbadstar += '**.';
  if (badstar) {
    plusbadstar = '';
  }
  let out = ', N1 🚫!(N2 🚫!)' + plusbadstar;
  code = code.replace('BAD', '');
  if (code != 'FLOOD') {
    if (typeof warnTexts[code] == 'undefined') {
      out = out.replace('N1', code);
      out = out.replace('N2', code);
    } else {
      out = out.replace('N1', warnTexts[code]);
      if (typeof warnTexts[code + '-EN'] == 'undefined') {
        out = out.replace('N2', warnTexts[code]);
      } else {
        out = out.replace('N2', warnTexts[code + '-EN']);
      }
    }
  } else {
    out = ', 🚫🔁 !!';
  }
  return out;
}
const wrongRusChar = 'qwertyuiop[]asdfghjkl;\'zxcvbnm,/`';
const rightRusChar = 'йцукенгшщзхъфывапролджэячсмитьбюё';

exports.compareNumbers = function (a, b){
    return b - a;
}
exports.compareText = function (txt1, txt2) {
  var i = 0;
  var len = 0;
  var equalI = 0;
  if(txt1.length > txt2.length){
    len = txt1.length;
  }else {
    len = txt2.length;
  }
  while (i != len) {
    if(txt1.substring(i,i+1) == txt2.substring(i,i+1)){
      equalI++;
    }
    i++;
  }
  if(equalI == 0){
    return 0;
  }else{
    return Math.floor(equalI/len*100);
  }
}
const compareSentexcesNew = true;

exports.compareSentexces = function (txt1, txt2) {
  if(compareSentexcesNew){
    txt2 = exports.sortSentexce(txt1, txt2);
  }
  var a = txt1.split(' ');
  var b = txt2.split(' ');
  var answ = 0;
  var i = 0;
  if(a.length > b.length){
    len = a.length;
  }else {
    len = b.length;
  }
  while (i != len) {
    if(a.length > b.length){
      if(i < b.length){
        answ += exports.compareText(a[i], b[i]);
      }
    }else{
      if(i < a.length){
        answ += exports.compareText(a[i], b[i]);
      }
    }
    i++;
  }
  answ = answ / (i + 1);
  // simpleLog('<' + txt1 + '>', txt2, answ);
  return answ;
}
exports.battleSentexces = function (sentxs, sentx) {
  var answ = [];
  var answ2 = [];
  var i = 0;
  while (i != sentxs.length) {
    answ.push(exports.compareSentexces(sentxs[i], sentx));
    i++;
  }
  answ2 = answ.slice();
  answ2.sort(exports.compareNumbers);
  const out = [answ[answ.indexOf(answ2[0])], answ.indexOf(answ2[0])];
  return out;
}
exports.analyzeQuestion = function (text, el) {
  var i = 0;
  while (i != el.length) {
    i++;
  }
}
exports.arrayOfQuestions = function (botdb) {
  var array = [];
  if(!botdb){
    return [];
  }
  for (let i = 0; i < botdb.length; i++) {
    var g;
    try{
      g = JSON.parse(botdb[i]);
    }catch(err){
      throw new Error(botdb[i] + ":  is not a valid JSON!\n" + err.message.split('\n')[0]);
    }
    var q = g.q;
    for (let z = 0; z < q.length; z++) {
      array.push(q[z].toLowerCase());
    }
  }
  return array;
}
exports.botdbQtoArr = function (question, botdb) {
  var answ = [];
  var answ2 = [];
  for (let i = 0; i < botdb.length; i++) {
    answ.push(exports.battleSentexces(JSON.parse(botdb[i]).q, question)[0]);
  }
  answ2 = answ.slice();
  answ2.sort(exports.compareNumbers);
  return answ.indexOf(answ2[0]);
}
exports.getRuleByAQ = function (question, botdb) {
  return exports.botdbQtoArr(question, botdb);
}
exports.getRandomAnswer = function (i, botdb) {
  var arr = JSON.parse(botdb[i]).a;
  if(typeof arr === "string"){
    return arr;
  }
  var answ = arr[random.between(0, arr.length)];
  return answ;
}
exports.secToDate = function (seconds){
  var days = Math.floor(seconds / (3600*24));
  seconds  -= days*3600*24;
  var hrs   = Math.floor(seconds / 3600);
  seconds  -= hrs*3600;
  var mnts = Math.floor(seconds / 60);
  seconds  -= mnts*60;
  return (days + " дней, " + hrs + " Часов, " + mnts + " Минут, " + seconds + " Секунд");
}
exports.percentOfCAPS = function (text) {
  text = text.replaceAll(' ', '');
  text = text.replace(/[0-9]/g, '');
  const answ = exports.compareText(text, text.toUpperCase());
  return answ;
}
exports.validateZalgo = function (s) {
    return /[^\u+0300-\u+036F]/.test(s);
}
exports.calculator = function (msg) {
  msg = msg.replaceAll('**','');
  const allChars = '0,1,2,3,4,5,6,7,8,9,+,-,/,*,),(,.'
  const arr2 = allChars.split(',');
  var arr = [];
  var i = 0;
  while(i != msg.length) {
    if(arr2.includes(msg[i])){
      arr.push(msg[i]);
    }
    i++;
  }
  const number = String(arr.join(''));
  const c = exports.evaluate(arr.join(''));
  const out = String(c[0]);
  if(number == out){
    return '';
  }
  return String(c[0]);
}
exports.getQuestions = function (id, botdb){
  const a = JSON.parse(botdb[id]).q;
  var answ = '';
  var i = 0;
  while(i != a.length){
    answ += a[i] + ' ';
    i++;
  }
  answ = answ.substring(0, answ.length - 1);
  return answ;
}
exports.isQorA = function (msg, id, botdb) {
	const m = msg.toLowerCase().replaceAll(' ', '');
	var value = 0;
	const arrayForCheck = ['?', 'как', 'что', 'где', 'выбрать'];
	for (var i = 0; i < arrayForCheck.length; i++) {
		if(m.indexOf(arrayForCheck[i]) > -1){
			value++;
		}
	}
	value /= arrayForCheck.length;
	var bufferText = bufferTextArray[id];
	if(!bufferText){
		bufferText = {
			lastMsg: undefined,
			lastQ: undefined,
			lastA: undefined,
			ready: 0
		}
	}
	bufferText.lastMsg = msg;
	const o = value == 0;
	var f = 1;
	if(o){
		f = 2;
	}
  var newdb = undefined;
	if(o){
		bufferText.oldA = bufferText.lastA;
		bufferText.lastA = msg;
	}else{
		bufferText.oldQ = bufferText.lastQ;
		bufferText.lastQ = msg;
	}
	if(bufferText.ready == 0){
		bufferText.ready = f;
	}else{
		if(bufferText.lastQ){
			if(bufferText.lastA){
				if(bufferText.ready != f){
          // newdb = exports.addToDB(bufferText.lastQ, bufferText.lastA); TODO: FIX
				}
			}
		}
		bufferText.ready = 0;
	}
	bufferTextArray[id] = bufferText;
  return [o, newdb];
}
exports.getMostLookingWord = function (words, word) {
  var i = 0;
  var psa = 0;
  var prc = 0;
  var percent = 0;
  while (i != words.length) {
    percent = exports.compareText(words[i], word);
    if(percent > prc){
      psa = i;
      prc = percent;
    }
    i++;
  }
  return [psa, prc]
}
exports.sortSentexce = function (txt1, txt2) {
  var i = 0;
  var arr = txt1.split(' ');
  var arr2 = txt2.split(' ');
  var arr3 = [];
  var len = 0;
  if(txt1.length > txt2.length){
    len = txt1.length;
  }else {
    len = txt2.length;
  }
  while(i != len){
    if(arr[i] != undefined){
      arr3.push(arr2[exports.getMostLookingWord(arr2, arr[i])[0]])
    }
    i++;
  }
  return arr3.join(' ');
}

exports.bigFirstLetter = function (word) {
  return word.charAt(0).toUpperCase() + word.substring(1, word.length);
}
exports.bigFirstLetters = function (text) {
  const arr = text.split(' ');
  var arr2 = [];
  var i = 0;
  while (i != arr.length) {
    arr2.push(exports.bigFirstLetter(arr[i]));
    i++;
  }
  return arr2.join(' ');
}

exports.getKeyword = function (questionV, msg, keywordPercent){
  const q = questionV.split(' ');

  var arr = [];
  var arr2 = msg.split(' ');
  var i = 0;
  while(i != arr2.length){
    if(exports.getMostLookingWord(q, arr2[i])[1] < keywordPercent){
      arr.push(arr2[i]);
    }
    i++;
  }
  const answ = arr.join(' ');
  return answ;
}

exports.convertWRTR = function (text) {
  var i = 0;
  var out = '';
  var tmp, tmp2;
  while(i != text.length){
    tmp2 = wrongRusChar.indexOf(text.charAt(i).toLowerCase())
    if(tmp2 == -1){
      out += text.charAt(i);
    }
    else {
      tmp = rightRusChar.charAt(tmp2);
      if(text.charAt(i).toLowerCase() == text.charAt(i)){
        out += tmp;
      }else {
        out += tmp.toUpperCase();
      }
    }
    i++;
  }
  return out;
}

exports.isBadWord = function (word, badwords, goodwords, percents) {
  var i = 0;
  while (i != badwords.length) {
    const answ = exports.compareText(word, badwords[i]);
    if(answ > percents){

      if(goodwords.indexOf(word) == -1){
        return true;
      }
    }
    i++;
  }
  return false;
}

exports.containBadWord = function (msg, badwords, goodwords, percents) {
  msg = msg.split(' ');
  var i = 0;
  while (i != msg.length) {
    if(exports.isBadWord(msg[i], badwords, goodwords, percents)){
      return msg[i];
    }
    i++;
  }
  return false;
}

exports.utcTimestamp = function () {
  const now = new Date;
  return Date.UTC(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
}

// SimaBot v3.0

exports.fixText = function (text){
  // TOOD: Better visual fix.
  var t = text[0].toUpperCase() + text.substring(1, text.length);
  const endChars = ['!', '.', '?'];
  if (endChars.indexOf(t[t.length - 1]) == -1) {
    t += '.';
  }
  return t;
}

exports.replaceArg = function (msg, inside) {
  var msg2 = msg;
  if (!msg) {
    msg2 = '';
  }
  const oldMsg = msg2;
  var msg2 = msg.replace('[]', inside);
  if (msg2 == oldMsg) {
    msg2 += inside;
  }
  return msg2;
}

exports.removeDuplicatesFromArray = function (array){
  var tmp = [];
  for (let i = 0; i < array.length; i++) {
    if(tmp.indexOf(array[i]) == -1) {
      tmp.push(array[i]);
    }
  }
  return tmp;
}