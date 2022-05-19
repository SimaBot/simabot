const ytdl = require("ytdl-core");
const { joinVoiceChannel, demuxProbe, createAudioResource, createAudioPlayer, StreamType, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const webutils = require("./webutils.js");
const random = require("./random.js");
const wordutils = require("./wordutils.js");

var playlistSimaBot = [];
var robot = null;
const urlPlaylist = 'https://open.spotify.com/playlist/1KStk0ZBy3f8IsWKNHqbcl?si=12eef76aaaf74daf';
var instances = [];

exports.getInstances = function (){
	return instances;
}

async function randomSong() {
	const videoName = playlistSimaBot[random.between(0, playlistSimaBot.length)];
	const videoId = await webutils.findVideo(videoName);
	if(videoId){
		return videoId;
	}else{
		return await randomSong();
	}
}

function getInstancesByGuildId(guildId) {
	for(let i = 0; i < instances.length; i++){
		if (instances[i].guildId == guildId){
			return instances[i].guildId;
		}
	}
}

async function getAudio(data){
	var yturl = 'https://www.youtube.com/watch?v=' + data;
	try {
		songInfo = await ytdl.getInfo(yturl);
	} catch (e) {
		return;
	}

	const thmb = songInfo.videoDetails.thumbnails;
	const vd = songInfo.videoDetails;
	var data = {
		title: vd.title,
		thumbnail: thmb[thmb.length - 1].url,
		author: vd.ownerChannelName,
		time: vd.lengthSeconds,
		url: yturl,
		timestamp: wordutils.utcTimestamp(),
		duration: songInfo.videoDetails.lengthSeconds
	};
	const stream = ytdl(data.url, { quality: 'highestaudio', filter: 'audioonly', format: 'webm' });
	return [data, stream];
}
async function instanceRunner(instance){
	if(instance.radio){
		instance.url = await randomSong();
	}
	instance.data = await getAudio(instance.url);
	if(!instance.data){
		if (instance.radio) {
			await instanceRunner(instance);
		}
		return;
	}
	if (instance.data) {
		instance.stream = instance.data[1];
		instance.info = instance.data[0];
		// console.log(instance);
		if (!instance.connection) {
			instance.connection = joinVoiceChannel({
				channelId: instance.channel.id,
				guildId: instance.guildId,
				adapterCreator: instance.channel.guild.voiceAdapterCreator,
			});
		}
		if (!instance.player) {
			instance.player = createAudioPlayer();
			instance.connection.subscribe(instance.player);
		}
		instance.resource = createAudioResource(instance.stream);
		if(instance.notFirst){
			instance.player.play(instance.resource);
		}else{
			instance.connection.on(VoiceConnectionStatus.Ready, async () => {
				instance.player.play(instance.resource);
				instance.notFirst = true;
				instance.player.on(AudioPlayerStatus.Idle, async () => {
					if (!(instance.radio || instance.list.length > 0)) {
						instance.connection.destroy();
						instance.connection = null;
					}
					await instanceRunner(instance);
				});
			});
		}
	}
}

async function play(channel, url){
	// console.log(channel, url);
	//TODO: Top level - check if user have permissions.
	if (!channel.isVoice()){
		return;
	}
	if(!url){
		url = null;
	}
	const permissions = channel.permissionsFor(robot.user);
	if (permissions.has("CONNECT") && permissions.has("SPEAK")) {
		var instance = getInstancesByGuildId(channel.guild.id);
		if (!instance) {
			instance = {
				url: url,
				list: [],
				channel: channel,
				radio: true,
				guildId: channel.guild.id
			}
			instances.push(instance);
			await instanceRunner(instance);
		}
		
	}
}

exports.init = function(client){
	robot = client;
	webutils.getPlaylist(urlPlaylist).then(function (e) {
		playlistSimaBot = e;
		client.channels.fetch('787757240135450637') // TODO: For every channel server
			.then(channel => play(channel));
	});
}