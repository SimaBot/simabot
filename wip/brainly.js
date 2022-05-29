const axios = require('axios');
const jsdom = require('jsdom');
const domain = 'znanija.com';
const fs = require('fs');
var shortUrl = require('node-url-shortener');

const proxy = '';
const useragent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; MSN 6.1; MSNbMSFT; MSNmen-us; MSNc00; v5m)';
const headers = {
    "User-Agent": useragent,
    "Accept-Language": "ru-RU",
    "Access-Control-Allow-Origin": "*"
};
function author(element) {
  return element.getElementsByClassName('sg-hide-for-small-only sg-text--small sg-text sg-text--link sg-text--bold sg-text--black')[0].textContent.replaceAll('\n', '');
}
function parseInfo(html, url) {
  const h = new jsdom.JSDOM(html).window;
  const question_elements = h.document.getElementsByClassName('brn-qpage-next-question-box-content__section');
  var question = '???';
  if(question_elements.length > 0){
    question = question_elements[0].textContent.replace('\n', '');
  }
  const post_author = author(h.document);
  var answers_collection = [];
  const answers = h.document.getElementsByClassName('js-answer');
  for (var i = 0; i < answers.length; i++) {
    const n = answers[i];
    var answer = [];
    const text = n.getElementsByClassName('js-answer-content');
    for (var k = 0; k < text.length; k++) {
      answer.push(text[k].textContent.replace('\n', ''));
    }
    const img = n.getElementsByTagName('img');
    for (var z = 0; z < img.length; z++) {
      answer.push(img[z].src);
    }
    answers_collection.push({ answer: answer, author: author(n) });
  }
  return {
    author_question: post_author,
    question: question,
    answers: answers_collection,
    google_url: 'https://www.google.com/search?q=' + encodeURIComponent(question),
    znanija_url: url
  };
}

function onlyNumbers(e) {
  var yes = true;
  for (var i = 0; i < e.length; i++) {
    if(String(Number(e[i])) != String(e[i])){
      yes = false;
    }
  }
  return yes;
}
exports.answer = async function (msg) {
  let promise = new Promise((resolve, reject) => {
    var secure_url;
    const array = msg.split('\n');
    function id(n) {
      secure_url = 'https://' + domain + '/task/' + String(n);
      end();
    }
    function search() {
      const url = 'https://' + domain + '/graphql/ru';
      const data = '[{\"operationName\":\"SearchQuery\",\"variables\":{\"query\":\"' + msg + '\",\"after\":null,\"first\":1},\"query\":\"query SearchQuery($query: String!, $first: Int!, $after: ID) {\\n  questionSearch(query: $query, first: $first, after: $after) {\\n    count\\n    edges {\\n      node {\\n        id\\n        databaseId\\n        author {\\n          id\\n          databaseId\\n          isDeleted\\n          nick\\n          avatar {\\n            thumbnailUrl\\n            __typename\\n          }\\n          rank {\\n            name\\n            __typename\\n          }\\n          __typename\\n        }\\n        content\\n        answers {\\n          nodes {\\n            thanksCount\\n            ratesCount\\n            rating\\n            __typename\\n          }\\n          hasVerified\\n          __typename\\n        }\\n        __typename\\n      }\\n      highlight {\\n        contentFragments\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}]'
      axios({
        method: 'post',
        url: url,
        headers: {
          "content-type": "application/json",
          "User-Agent": useragent
        },
        data: data
      }).then(function (json) {
        const data = json.data[0].data.questionSearch.edges;
        if(data.length > 0){
          id(data[0].node.databaseId);
        }else{
          resolve(undefined);
        }
      });
    }
    for (var i = 0; i < array.length; i++) {
      const n = array[i].replaceAll('https://', '').replaceAll('http://', '');
      if(n.startsWith(domain)){
        secure_url = 'https://' + n;
        end();
      }else{
        if(n.length == 8){
          if(onlyNumbers(n)){
            id(n);
            end();
          }
        }
      }
    }
    if(!secure_url){
      search();
    }
    function end() {
      axios.get(proxy + secure_url, { withCredentials: true, headers: headers }).then(function (e) {
        resolve(parseInfo(e.data), secure_url);
      });
    }
  });
  return await promise;
}

exports.toText = function (e, q) {
  var msg = '**Asked **: ' + e['author_question'];
  msg += '\n```' + e.question + '```\n';
  const answers = e.answers;
  for (var i = 0; i < answers.length; i++) {
    const n = answers[i];
    msg += '\n**Author answer**: ' + n.author;
    msg += '\n';
    if(typeof n.answer != 'undefined'){
      msg += n.answer.join(' ');
    }
  }
  // msg += '\nFind on Google: ' + e.google_url;
  return msg.substring(0, 1999);
}
exports.a = async function(q) {
  let promise = new Promise((resolve, reject) => {
    exports.answer(q).then(function (e) {
      if(e){
        var msg = exports.toText(e, q);
        shortUrl.short(e.google_url, function(err, url){
            if(err){
              msg += '\nFind on Google: ' + e.google_url;
            }else{
              msg += '\nFind on Google: ' + url;
            }
            resolve(msg);
        });
        /*
        const array = msg.split(' ');
        var p = 0;
        function r() {
          console.log(p, array.length);
          if(p > (array.length - 3)){
            console.log(array);
            msg = array.join(' ');
            console.log(msg);
            shortUrl.short(e.google_url, function(err, url){
                if(err){
                  msg += '\nFind on Google: ' + e.google_url;
                }else{
                  msg += '\nFind on Google: ' + url;
                }
                resolve(msg);
            });
          }else{
            p++;
          }
        }
        for (var i = 0; i < array.length; i++){
          const n = array[i];
          if(array[i].indexOf('://') > -1){
            console.log(n + '?');
            shortUrl.short(n, function(err, url){
                if(typeof url == 'string'){
                  array[i] = url;
                }
                r();
            });
          }else{
            r();
          }
        }*/
      }else{
        resolve('');
      }
    });
  });
  return await promise;
}

exports.a('сколько сторон у треугольника', console.log)
