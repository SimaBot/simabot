const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const client = new Discord.Client({
    partials: ["CHANNEL"], intents: [
        'GUILDS',
        'GUILD_VOICE_STATES',
        'GUILD_MESSAGES',
        'DIRECT_MESSAGES'
    ],
});
const serviceName = 'discord';
var internal = null;

function isOutsideAcc(userid) {
    return String(Number(userid)) == 'NaN';
}

function nicknames(msg) {
    return '@' + msg.author.username + '#' + msg.author.discriminator;
}
function giveRole(name, msg) {
    return managerRoles(name, msg, true);
}
function removeRole(name, msg) {
    return managerRoles(name, msg, false);
}
async function banHandle() { //TODO: No ban
    const z = await db.collection('users').where('banned', '==', true).get();
    z.forEach(doc => {
        var data = doc.data();
        if (data.bantimer != 0) {
            data.bantimer--;
            db.collection("users").doc(doc.id).set(data);
        }
        if (data.bantimer == 0) {
            data.banned = false;
            db.collection("users").doc(doc.id).set(data);
            try {
                client.users.fetch(userid).then((user) => {
                    const server = client.guilds.cache.get('serverID'); // TODO
                    const target = server.members.cache.get(userid);
                    target.ban({ reason: internal.textdb.strings.breakRules }); // TODO: Replace with server specific ban message + reason
                    createUser(userid);
                    user.send(internal.textdb.unbanMsg, {
                        files: [internal.textdb.unbanImg]
                    });
                });
            } catch {
            }
        }
    });
}

client.on('guildMemberAdd', async member => {
    const cfg = await internal.db.getCfgServer('discord.' + member.guild.id);
    if (!welcomeId) {
        return;
    }
    try {
        const welcomeChannel = client.channels.cache.get(cfg.welcomeId);
        welcomeChanne.send(wordutils.replaceAll(cfg.welcomeMsg, member));
        for (let i = 0; i < cfg.welcomeDm.length; i++) {
            const text = cfg.welcomeDm[i];
            const urls = internal.webutuils.urlsArray(text);
            if (urls) {
                member.send({
                    files: urls
                });
            } else {
                member.send(text);
            }
        }
    } catch (e) {

    }
});

client.on("guildMemberRemove", async member => {
    const cfg = await internal.db.getCfgServer('discord.' + member.guild.id);
    if (cfg.welcomeId) {
        try {
            const msg = client.channels.cache.get(cfg.welcomeId);
            msg.send(wordutils.replaceAll(cfg.leaveMsg, member));
        }
        catch {

        }
    }
});

function managerRoles(name, msg, give) {
    const role = msg.guild.roles.cache.find(role => role.name === name);
    const id = msg.author.id;
    const strings = internal.textdb.strings;
    const member = msg.guild.members.cache.get(id);
    if (!role) {
        return;
    }
    if (member.roles.cache.has(role.id)) {
        if (give) {
            return ', ' + strings.alreadyExistsRole + ': **' + name + '**';
        } else {
            member.roles.remove(role).catch(console.error);
            return ', -' + strings.role + ': **' + name + '**';
        }
    } else {
        if (give) {
            member.roles.add(role)
            return ', +' + strings.role + ': **' + name + '**';
        } else {
            return ', ' + strings.alreadyNotExistsRole + ': **' + name + '**';
        }
    }
}

function changeStatus(){
    const status = internal.getStatus();
    client.user.setPresence({ activities: [{ name: status }], status: 'idle' });
}

async function musicInit(music){ // TODO: Check update
    music.initClient(client);
    const servers = await internal.db.ls('config');
    for (let i = 0; i < servers.length; i++) {
        const id = servers[i];
        if (id.startsWith('DBdiscord.')){
            const guildId = id.split('.')[1];
            const cfgServer = await internal.db.getCfgServer(id);
            if(cfgServer.idRadioChannel != ' '){
                music.start(cfgServer.idRadioChannel, null, cfgServer.playlistRadio);
            }
        }
    }
    var oldInfoMusic = null;
    if (!internal.useBeta){
        setInterval(async function () {
            const instances = music.getInstances();
            if (instances.length > 0) {
                const info = instances[0].info;
                if (oldInfoMusic != info) {
                    await internal.db.setRadio(info);
                }
                oldInfoMusic = info;
            }
        }, 1000);
    }
}
function clientready(e) {
    const discordInviteURL = 'https://discord.com/api/oauth2/authorize?client_id=' + e.user.id + '&permissions=8&scope=bot';
    console.log(internal.textdb.strings.discordReady + '\n' + discordInviteURL);
    const music = internal.modules['music-discord'];
    if(music){
        musicInit(music);
    }
    changeStatus();
    setInterval(changeStatus, 1000);
}

client.on('messageCreate', async msg => {
    if (msg.author.id == client.user.id) {
        return;
    }
    const crossmsg = {
        serviceName: serviceName,
        userid: msg.author.id,
        nickname: '<@' + msg.author.id + '>',
        channelId: msg.channel.id,
        isDM: msg.guildId == null,
        guildId: msg.guildId || msg.author.id,
        content: msg.content,
        msg: msg
    };
    var out = await internal.simabot(crossmsg);
    if (out) {
        if (typeof out == 'object') {
            if (out.action == 'remove') {
                msg.delete();
                const modChannel = client.channels.cache.get(out.idModChannel);
                if (modChannel) {
                    modChannel.send(out.reason);
                }
            }
        }
        if (typeof out == 'string') {
            out = out.substring(0, 1999);
            msg.channel.send(out);
        }
    }
});

client.on('error', error => {
    internal.log(error, 'Discord ' + textdb.strings.serviceError);
});

exports.sendNotify = function (msg, isDM) {
    if (isDM) {
        client.users.fetch(msg.guildid.split('.')[1]).then((user) => {
            user.send(msg.msg);
        });
    } else {
        const channel = client.channels.cache.get(msg.channel);
        channel.send(msg.msg);
    }
    return true;
}

exports.isOP = async function (guildId, userid){
    try {
        const member = client.guilds.cache.get(guildId).members.cache.get(userid);
        return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    } catch (error) {
        return false;
    }
}

exports.log = function (msg) {
    var idLogChannel = internal.textdb.strings.idLogChannel;
    if (internal.useBeta) {
        idLogChannel = internal.textdb.strings.idLogChannelBeta;
    }
    try {
        var logCh = client.channels.cache.get(idLogChannel);
        logCh.send(msg);
    } catch (e) {
        console.log(e);
    } finally {

    }
}

exports.init = function (token, data) {
    internal = data
    client.login(token);
    client.on("ready", clientready);
}