exports.configDefaults = {
    banMsg: 'Вас заблокировано на срок 1 месяц!',
    unbanMsg: 'Вас было раблокировано!',
    muteOrBan: 1,
    welcomeMsg: 'Привет []!',
    detectBadwords: true,
    detectFlood: true,
    detectionBadwords: 60,
    detectCaps: true,
    detectionCaps: 50,
    detectSpam: true,
    detectZalgo: true,
    welcomeId: ' ',
    everyoneDJ: true,
    aiPercent: 20,
    timeBlock: 44640,
    mcConsole: '',
    captcha: false,
    captchIdChannel: undefined,
    verifiedRoleId: undefined,
    welcomeDm: 'Приветсвую на сервере!',
    leaveMsg: '[]! 💔 Ты покинул нас...',
    blockAd: true,
    idModChannel: ' '
};
exports.botdb = [
    // '{"q": ["test", "тест", "Контрольная"], "a": "Test. Oh test, yes. I am SimaBot! By the way I am a bot. And thanks for the test. Oh test, yes, I like the test. When it just works, it\'s great. And I think I never fail in test. Good test easy, and which make smile. This test never gonna make your cry by the way. Writed by Test Test. Do you want be tester? Just be tester! Test make your life easier. Because it do not requires other test. Tester important in our life. Tester can find problem and report them to other. And it make them important in our life! Beta version not great, they requires test for final releases so make sure that you checked everything. One trouble can make a big problem. Make sure that you have enough testers! (Writen on back side of SimaBot) "}',
    '{"q": ["дата база", "база данных", "дб"], "a": "/db"}'
]
exports.config = {
    banMsg: 'Сообщение при блокировке',
    unbanMsg: 'Сообщение при раблокировке',
    muteOrBan: '1 - Глушить или 2 - блокировать пользователь при нарушении', 
    welcomeMsg: 'Введи текст приветствия, которое будет отправлено когда зайдет новый участник',
    detectBadwords: 'Удалять сообщения с плохими словами',
    detectFlood: 'Удалять Flood',
    detectionBadwords: '% Распознавание плохих слов',
    detectCaps: 'Удалять Caps',
    detectionCaps: '% Распознавание Caps',
    detectSpam: 'Удалять Spam (BETA)',
    detectZalgo: 'Удалять Zalgo (BETA)',
    welcomeId: 'Канал для приветствий (только Discord)',
    everyoneDJ: 'Любой пользователь может ставить музыку',
    aiPercent: '% Срабатывание ИИ',
    timeBlock: 'Время блокировки пользователя в секундах',
    mcConsole: 'ID канала с консолью Minecraft (для выполение блокировок)',
    captcha: 'Включить Captcha для новых участников (я сам настрою)',
    captchIdChannel: 'Канал для Captcha',
    verifiedRoleId: 'RoleID проверенных пользователь',
    welcomeDm: 'Приветсвие для личных сообщений',
    leaveMsg: 'Сообщение при выходе с сервере',
    blockAd: 'Блокировать саморекламу (BETA)',
    idModChannel: 'ID канала для журналирования модерации'
};
exports.db = {
    botdb: 'Знания SimaBot',
    config: '⚙️',
    notify: '⚙️ Notify',
    badwords: 'Запрещенные слова',
    goodwords: 'Разрешенные слова',
    blackchannels: 'Запрещенные каналы'
};

exports.strings = {
    noOP: '👑 🚫 06',
    websiteURL: 'https://simabot.github.io/',
    idLogChannel: '871695676696825906',
    // idModChannelAlt: 'TODO', Alternative channel
    idLogChannelBeta: '910988806038126622',
    // idLogChannelBetaAlt: 'TODO', Alternative channel
    running: 'Running',
    botName: 'SimaBot',
    error: 'Error',
    envGenerated: 'Generated .env file',
    helloWorld: 'Hello World',
    secretError: 'Secret is not valid JSON',
    secret2Error: 'Secret2 is not valid JSON / Base64',
    alreadyExistsRole: 'у вас уже есть роль', 
    alreadyNotExistsRole: 'у вас и до этого не было роли',
    role: 'Role',
    breakRules: 'Нарушение правил',
    days: 'days',
    serviceInitError: 'Service init error',
    serviceError: 'Service Error',
    moduleError: 'Module Error',
    globalError: 'Global Error',
    domain: 'simabot.github.io',
    newEpisode: 'Новая серия',
    details: 'Подробнее',
    newEpisode2: 'Новая серия аниме/манги/сериала/комикса!',
    spotifyURLPlaylist: 'https://open.spotify.com/playlist/1KStk0ZBy3f8IsWKNHqbcl?si=12eef76aaaf74daf',
    seasonName: 'Название сезона',
    episodeName: 'Название серии',
    episode: 'серия',
    episodes: 'серии',
    andThisIs: 'И это у нас уже',
    eta: 'Также должны выйти ёще',
    lang: 'ru',
    discordReady: 'Connected to Discord! Invite: ',
    issueGH: 'https://api.github.com/repos/SimaBot/simabot/issues'
}
//  (Sad to hear your leave) ${member}!
// Welcome msg // TODO: