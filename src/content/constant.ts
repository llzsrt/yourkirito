export const ACTION = {
    Rabbit: 2,
    Train: 3,
    Picnic: 4,
    Girl: 5,
    DoGoodThings: 6,
    Sit: 7,
    Fishing: 8
}

export const ACTION_NAME = {
    2: '狩獵兔肉',
    3: '自主訓練',
    4: '外出野餐',
    5: '汁妹',
    6: '做善事',
    7: '坐下休息',
    8: '釣魚'
}

export const DUEL = {
    Friendly: 1,
    Seriously: 2,
    Decisively: 3,
    Mercilessly: 4
}

export const DUEL_NAME = {
    1: '友好切磋',
    2: '認真對決',
    3: '決一死戰',
    4: '我要超渡你'
}

export const SCRIPT_STATUS = {
    Normal: 0,
    Action: 1,
    Duel: 2,
    ActionAfterReload: 3,
    DuelAfterReload: 4,
    Find: 5
}

export const FIND_STATUS = {
    Normal: 0,
    Processing: 1,
    Found: 2,
    NotFound: 3
}

export const CHARACTERS = [
    '不指定',
    '桐人',
    '亞絲娜',
    '克萊因',
    '艾基爾',
    '西莉卡',
    '莉茲貝特',
    '牙王',
    '提亞貝魯',
    '克拉帝爾',
    '雜燴兔',
    '羅莎莉雅',
    '柯巴茲',
    '閃耀魔眼',
    '奧伯龍',
    '詩乃',
    '尤吉歐',
    '日番谷冬獅郎',
    '藍染惣右介',
    '雛林桃',
    '六車拳西',
    '茶渡泰虎',
    '金·布拉德雷',
    '超級噴火龍X',
    '天野陽菜',
    '初見泉',
    '萊納·布朗',
    '愛麗絲',
    '鎖鏈的康妮',
    '星爆小拳石',
    '星爆隆隆石',
    '石頭',
    '努西',
    '哥德夫利',
    '猩爆戰象',
    '星爆怪力',
    '有紀',
    '尤金',
    'ALO桐人',
    '雷根',
    'GGO桐人',
    '莉法',
    '色違雷根',
    'ALO亞絲娜',
    '陸行戰鬥鷹',
    '淡忘的回憶'
]

export const PLAYER_STATUS = {
    murderer: '殺人犯',
    suspect: '橘名',
    normal: '普通',
    dead: '死人'
}

export const PLAYER_STATUS_COLOR = {
    murderer: 'var(--red)',
    suspect: 'rgb(255, 152, 0)',
    normal: 'inherit',
    dead: 'var(--grey)'
}