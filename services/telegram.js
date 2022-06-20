process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');

const serviceName = 'telegram';
var internal, client;

async function onMessage(msg) {
    const chatId = msg.chat.id;
    const isDM = msg.chat.type == 'private';
    const lang = msg.from.language_code;
    const crossmsg = {
        serviceName: serviceName,
        userid: msg.from.id,
        nickname: '@' + msg.from.username,
        channelId: msg.chat.id,
        isDM: isDM,
        content: msg.text,
        lang: lang,
        msg: msg
    };
    var out = await internal.simabot(crossmsg);
    const messageId = msg.message_id;
    if (out) {
        if (typeof out == 'object') {
            if (out.action == 'remove') {
                client.deleteMessage(chatId, messageId);
            }
        }
        if (typeof out == 'string') {
            out = out.substring(0, 4095);
            client.sendMessage(chatId, out);
        }
    }
}

exports.isOP = async function (chatId, userid) {
    const array = await client.getChatAdministrators(chatId);
    for (let i = 0; i < array.length; i++) {
        const user = array[i].user;
        if (user.id == userid) {
            return true;
        }
    }
    return false;
}

exports.sendNotify = function (msg, isDM) {
    client.sendMessage(msg.channel, msg.msg);
    return true;
}

exports.init = function (token, data) {
    internal = data;
    client = new TelegramBot(token, { polling: true });
    client.on('message', onMessage);
}