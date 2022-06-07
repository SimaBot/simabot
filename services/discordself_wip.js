// This code need reworking
const Discordself = require("discord-user-bots");
const client = new Discordself.Client(secret.selfdiscord);

if (!debug && true) {
    clientself.on.ready = function () {
        console.log("Client online!");
        // clientself.user_settings.custom_status = {
        //   text: 'Custom Status',
        //   expires_at: null,
        //   emoji_name: null,
        //   emoji_id: null
        // };
        // console.log(clientself.user_settings.custom_status);
    }
    clientself.on.message_create = function (msg) {
        if (msg.author.id == 'not itself') {
            return;
        }
        if (msg.guild_id == 'blacklisted servers') {
            return;
        }
        const rightPerson = msg.author.id == 'rightPerson';
        const outenabled = msg.channel_id == 'rightChannel' && rightPerson;
        var txtmsg = msg.content.replaceAll('**', '').replaceAll('*', '').replaceAll('👻', '');
        modules.translate.toRu(txtmsg).then(function (txtmsg2) {
            if (txtmsg2 == '') {
                txtmsg = txtmsg;
            } else {
                txtmsg = txtmsg2;
            }
            handleBot(txtmsg, '?', '?', msg.content, true).then(function (e) {
                if (outenabled) {
                    modules.translate.toEn(e).then(function (v) {
                        var out = v;
                        if (out.length < 1) {
                            out = '...';
                        }
                        if (out.indexOf('undefined') > -1) {
                            out = '...';
                        }
                        if (out == 'I') {
                            out = 'What?';
                        }
                        setTimeout(function () {
                            clientself.send(out, "rightChannel");
                        }, 5200);
                    });
                }
            });
        });
    }
}
