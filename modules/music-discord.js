const ytdl = require("ytdl-core");
const { joinVoiceChannel, demuxProbe, createAudioResource, createAudioPlayer, StreamType, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
var webutils, random, wordutils;
var client = null, random = null;
var instances = [];

exports.getInstances = function (){
	return instances;
}

async function getSong(playlist, instance) {
	var videoName;
	if (instance.random){
		if (random) {
			videoName = playlist[random.between(0, playlist.length)];
		}
	} 
	if (!videoName) {
		videoName = playlist[instance.i];
		instance.i++;
	}
	if(instance.i >= playlist.length){
		instance.i = 0;
	}
	const videoId = await webutils.findVideo(videoName);
	if(videoId){
		return videoId;
	}else{
		return await getSong(playlist);
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
		if (instance.playlist){
			instance.url = await getSong(instance.playlist, instance);
		}else{
			return;
		}
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

async function play(channel, url, playlist){
	// console.log(channel, url);
	//TODO: Top level - check if user have permissions.
	if (!channel.isVoice()){
		return;
	}
	if(!url){
		url = null;
	}
	if(playlist){
		if(!Array.isArray(playlist)){
			try {
				const url = new URL(playlist);
				if (url.hostname == 'open.spotify.com') {
					playlist = await webutils.getPlaylist(playlist);
				}
			} catch (error) {

			}
			if(!Array.isArray(playlist)){
				return { error: 'Invalid playlist' };
			}
		}
	}
	const permissions = channel.permissionsFor(client.user);
	if (permissions.has("CONNECT") && permissions.has("SPEAK")) {
		var instance = getInstancesByGuildId(channel.guild.id);
		if (!instance) {
			instance = {
				url: url,
				list: [],
				channel: channel,
				radio: true,
				guildId: channel.guild.id,
				playlist: playlist,
				i: 0,
				random: true
			}
			instances.push(instance);
			await instanceRunner(instance);
		}
		
	}
}

exports.init = function(internal){
	webutils = internal.webutils;
	if(internal.modules.random){
		random = internal.modules.random;
	}
	wordutils = internal.wordutils;
}

exports.initClient = function(c){
	client = c;
}
exports.start = function (channelId, url, playlist){
	client.channels.fetch(channelId).then(channel => play(channel, url, playlist));
}