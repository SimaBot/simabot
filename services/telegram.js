process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');

async function onMessage(msg) {
    const chatId = msg.chat.id;
    const isDM = msg.chat.type == 'private';
    const lang = msg.from.language_code;
    const bot = await internal.simabot(msg);
    const messageId = msg.message_id;
    if (bot) {
        var out = bot.substring(0, 4095);
        if (out.startsWith('!!!')) {
            try {

            } catch (err) {
                client.deleteMessage(chatId, messageId);
            }
        } else {
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
    const client = new TelegramBot(token, { polling: true });
    client.on('message', onMessage);
}