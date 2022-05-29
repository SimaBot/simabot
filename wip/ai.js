const brain = require('brain.js');

const net = new brain.recurrent.LSTM();

console.log('Train...');

net.train([
  { input: 'How are you?', output: 'Fine' },
  { input: 'Are you fine?', output: 'Yes' },
], { iterations: 200 });

console.log('Trained!');

// const output = net.run('I feel great!'); // 'happy'
//
// console.log(output);

function askquestion () {
  rdline.question('I: ', m => {
    // simpleLog('I: ' + m)
    if(m != 'exit' && m != 'shutdown' && m != 'quit' && m != 'halt') {
      if(m.indexOf('/') > -1){
        const trainData = m.split('/');
        net.train([
          { input: trainData[0], output: trainData[1] }
        ], { iterations: 200 });
        console.log('Trained!');
      }else{
        const output = net.run(m);
        console.log('AI: ' + output);
      }

      askquestion();
    }else {
      console.log('Goodbye!');
      process.exit();
    }
  });
}
const debug = true;
if(debug){
  const readline = require('readline');
  rdline = readline.createInterface({
     input: process.stdin,
     output: process.stdout
  });
  askquestion();
}
