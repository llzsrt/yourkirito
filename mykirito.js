async function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

function getRandom(x) {
    return Math.floor(Math.random() * x) + 1;
};

function addButton(parentId, id, content) {
    const parent = document.getElementById(parentId);
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('id', id);
    button.innerHTML = content;
    return parent.appendChild(button);
}

class Mykirito {
    buttons = {}
    links = {}
    actionButtons = [];
    duelButtons = [];
    messageBlock;
    hunterButton;
    pauseButton;
    preyNameBlock;

    dead = false;
    duel = 1;
    action = 5;
    randomDelay = 25;
    mercilesslyExtraCd = 0;
    nextTimeDoSomething = 0;
    isHunterMode = false;
    preyId = '';
    preyName = '';
    nextTimeHunt = 0;
    huntCount = 0;
    isBusy = false;
    isDoingSomething = false;
    isPause = false;

    oldUrl = '';
    notifications = [];

    ACTION = {
        Rabbit: 2,
        Train: 3,
        Picnic: 4,
        Girl: 5,
        DoGoodThings: 6,
        Sit: 7,
        Fishing: 8
    }

    ACTION_NAME = {
        2: '狩獵兔肉',
        3: '自主訓練',
        4: '外出野餐',
        5: '汁妹',
        6: '做善事',
        7: '坐下休息',
        8: '釣魚'
    }

    DUEL = {
        Friendly: 1,
        Seriously: 2,
        Decisively: 3,
        Mercilessly: 4
    }

    DUEL_NAME = {
        1: '友好切磋',
        2: '認真對決',
        3: '決一死戰',
        4: '我要超渡你'
    }

    constructor() {
        const tempAction = parseInt(localStorage.getItem('scriptAction'));
        this.action = !!tempAction ? tempAction : 5;
        const tempDuel = parseInt(localStorage.getItem('scriptDuel'));
        this.duel = !!tempDuel ? tempDuel : 1;

        const scriptDateTime = localStorage.getItem('scriptDateTime');
        const scriptNextTimeDoSomething = localStorage.getItem('scriptNextTimeDoSomething');
        const scriptNextTimeHunt = localStorage.getItem('scriptNextTimeHunt');
        this.nextTimeDoSomething = parseInt(scriptNextTimeDoSomething ? scriptNextTimeDoSomething : 0) + parseInt(scriptDateTime ? scriptDateTime : 0) - parseInt(+(new Date()) / 1000);
        this.nextTimeHunt = parseInt(scriptNextTimeHunt ? scriptNextTimeHunt : 0) + parseInt(scriptDateTime ? scriptDateTime : 0) - parseInt(+(new Date()) / 1000);

        this.isPause = localStorage.getItem('scriptIsPause') === 'true';
        this.isBusy = localStorage.getItem('scriptIsBusy') === 'true';
        const scriptHuntCount = localStorage.getItem('scriptHuntCount');
        this.huntCount = parseInt(scriptHuntCount ? scriptHuntCount : 0);

        this.preyId = localStorage.getItem('scriptPreyId');
        this.preyName = localStorage.getItem('scriptPreyName');
        this.isHunterMode = localStorage.getItem('scriptIsHunterMode') === 'true';

        this.getLinks();
        this.getButtons();
        this.injectionTools();
        this.checkPrey();
        this.messageBlock = document.getElementById('message-block');
        this.watchUrl();
        if (Notification.permission === 'default' || Notification.permission === 'undefined') {
            Notification.requestPermission();
        }
    }

    injectionTools() {
        const self = this;
        const toolsWrapper = document.createElement('div');
        toolsWrapper.setAttribute('id', 'tools-wrapper');

        const hunterWrapper = document.createElement('div');
        hunterWrapper.setAttribute('id', 'hunter-wrapper');

        const preyName = document.createElement('div');
        preyName.setAttribute('id', 'prey-name');

        const buttonGroup = document.createElement('div');
        buttonGroup.setAttribute('class', 'btn-group');
        buttonGroup.setAttribute('id', 'button-group');

        const duelButtonGroup = document.createElement('div');
        duelButtonGroup.setAttribute('class', 'btn-group');
        duelButtonGroup.setAttribute('id', 'duel-group');

        const statusBar = document.createElement('div');
        statusBar.setAttribute('class', 'alert alert-info text-right');
        statusBar.setAttribute('id', 'status-bar');
        const messageBlock = document.createElement('div');
        messageBlock.setAttribute('id', 'message-block');
        statusBar.appendChild(messageBlock);

        document.getElementById('root').appendChild(toolsWrapper);
        toolsWrapper.appendChild(hunterWrapper);
        toolsWrapper.appendChild(buttonGroup);
        toolsWrapper.appendChild(statusBar);

        for (let action in this.ACTION) {
            const button = addButton('button-group', `button-${action}`, action);
            this.actionButtons.push(button);
            button.setAttribute('class', this.ACTION[action] === this.action ? 'btn btn-secondary active' : 'btn btn-secondary');
            button.addEventListener('click', () => {
                self.action = self.ACTION[action];
                localStorage.setItem('scriptAction', self.ACTION[action]);
                self.setToolsButtonStyle();
            });
        }
        this.pauseButton = addButton('button-group', `button-pause`, '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>');
        this.setPauseButtonStyle();
        this.pauseButton.addEventListener('click', () => {
            if (!self.isPause) {
                self.isPause = true;
                localStorage.setItem('scriptIsPause', 'true');
            } else {
                self.isPause = false;
                localStorage.setItem('scriptIsPause', 'false');
                const scriptDateTime = localStorage.getItem('scriptDateTime');
                const scriptNextTimeDoSomething = localStorage.getItem('scriptNextTimeDoSomething');
                this.nextTimeDoSomething = parseInt(scriptNextTimeDoSomething ? scriptNextTimeDoSomething : 0) + parseInt(scriptDateTime ? scriptDateTime : 0) - parseInt(+(new Date()) / 1000);

            }
            self.setPauseButtonStyle();
        });
        
        this.preyNameBlock = hunterWrapper.appendChild(preyName);
        
        hunterWrapper.appendChild(duelButtonGroup);
        this.hunterButton = addButton('hunter-wrapper', 'button-hunter', '自動攻擊');
        this.setHunterButtonStyle();
        this.hunterButton.addEventListener('click', () => {
            if (self.isHunterMode) {
                localStorage.setItem('scriptIsHunterMode', 'false');
                localStorage.setItem('scriptIsBusy', 'false');
                self.isHunterMode = false;
                self.isBusy = false;
            } else {
                const scriptDateTime = localStorage.getItem('scriptDateTime');
                const scriptNextTimeHunt = localStorage.getItem('scriptNextTimeHunt');
                this.nextTimeHunt = parseInt(scriptNextTimeHunt ? scriptNextTimeHunt : 0) + parseInt(scriptDateTime ? scriptDateTime : 0) - parseInt(+(new Date()) / 1000);
                localStorage.setItem('scriptIsHunterMode', 'true');
                self.isHunterMode = true;
            }
            self.setHunterButtonStyle();
        });

        for (let duel in this.DUEL) {
            const button = addButton('duel-group', `button-${duel}`, duel);
            this.duelButtons.push(button);
            button.setAttribute('class', this.DUEL[duel] === this.duel ? 'btn btn-secondary active' : 'btn btn-secondary');
            button.addEventListener('click', () => {
                self.duel = self.DUEL[duel];
                localStorage.setItem('scriptDuel', this.DUEL[duel]);
                self.setToolsButtonStyle();
            });
        }
    }

    setHunterButtonStyle() {
        if (this.isHunterMode) {
            this.hunterButton.textContent = '停止';
            this.hunterButton.setAttribute('class', 'btn btn-danger active');
        } else {
            this.hunterButton.textContent = '自動攻擊';
            this.hunterButton.setAttribute('class', 'btn btn-danger');
        }
    }

    setToolsButtonStyle() {
        this.actionButtons.forEach(button => {
            button.setAttribute('class', this.ACTION[button.textContent] === this.action ? 'btn btn-secondary active' : 'btn btn-secondary');
        });
        this.duelButtons.forEach(button => {
            button.setAttribute('class', this.DUEL[button.textContent] === this.duel ? 'btn btn-secondary active' : 'btn btn-secondary');
        })
    }

    setPauseButtonStyle() {
        this.pauseButton.setAttribute('class', !this.isPause ? 'btn btn-info active' : 'btn btn-secondary');
        if (this.isPause) {
            this.pauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
        } else {
            this.pauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
        }
    }

    getButtons() {
        document.querySelectorAll('button').forEach(button => {
            this.buttons[button.textContent] = button;
        });
    }

    getLinks() {
        document.querySelectorAll('a').forEach(button => {
            this.links[button.textContent] = button;
        });
    }

    doSomething() {
        setTimeout(async () => {
            this.getButtons();
            if (this.buttons['OK']) {
                this.buttons['OK'].click();
            }

            if ('領取獎勵' in this.buttons && !(this.buttons['領取獎勵'].disabled)) {
                await sleep(500);
                this.buttons['領取獎勵'].click();
                console.log('領取樓層獎勵');
            }

            if (this.ACTION_NAME[this.action] in this.buttons && !(this.buttons[this.ACTION_NAME[this.action]].disabled)) {
                await sleep(500);
                this.buttons[this.ACTION_NAME[this.action]].click();
                console.log(this.ACTION_NAME[this.action]);
            }
            this.nextTimeDoSomething = 104 + getRandom(this.randomDelay);
            this.unlock();
        }, 500);
    }

    hunt() {
        setTimeout(async () => {
            if (this.huntCount > 180) {
                this.nextTimeHunt = 300 + getRandom(this.randomDelay) + (this.duel == 4 ? this.mercilesslyCd : 0);
                this.unlock();
                return;
            }
            const tempName1 = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
            const tempName2 = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > div > table:nth-child(2) > tbody > tr:nth-child(4) > td');
            if ((!tempName1 || tempName1.textContent === '') && (!tempName2 || tempName2.textContent === '')) {
                await sleep(100);
                this.huntCount++;
                this.hunt();
                return;
            }
            this.getButtons();

            if (this.DUEL_NAME[this.duel] in this.buttons && !(this.buttons[this.DUEL_NAME[this.duel]].disabled)) {
                this.buttons[this.DUEL_NAME[this.duel]].click();
            }
            else if (this.DUEL_NAME[2] in this.buttons && !(this.buttons[this.DUEL_NAME[2]].disabled)) {
                this.buttons[this.DUEL_NAME[2]].click();
            } else {
                this.nextTimeHunt = 300 + getRandom(this.randomDelay) + (this.duel == 4 ? 1800 : 0);
                this.unlock();
                return;
            }

            await sleep(1000);

            const tempResult = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(3) > div > div');
            if (!!tempResult && (tempResult.textContent.includes(this.DUEL_NAME[4]) || tempResult.textContent.includes(this.DUEL_NAME[3]) || tempResult.textContent.includes(this.DUEL_NAME[2]) || tempResult.textContent.includes(this.DUEL_NAME[1]))) {
                console.log(tempResult.textContent);
                this.nextTimeHunt = 300 + getRandom(this.randomDelay) + (this.duel == 4 ? this.mercilesslyExtraCd : 0);
                this.unlock();
            } else {
                this.huntCount+=20;
                localStorage.setItem('scriptHuntCount', this.huntCount);
                this.unlock();
                location.reload();
            }
            this.huntCount = 0;
            localStorage.setItem('scriptHuntCount', this.huntCount);
        }, 500);
    }

    lock() {
        this.isBusy = true;
        localStorage.setItem('scriptIsBusy', 'true');
    }

    unlock() {
        this.isBusy = false;
        localStorage.setItem('scriptIsBusy', 'false');
    }

    endless() {
        setTimeout(() => {
            if (document.querySelector('div > iframe')) {
                if (this.isHunterMode || !(location.href.includes(`/profile/${this.preyId}`))) {
                    setTimeout(() => {
                        if (document.querySelector('div > iframe')) {
                            this.notifications.push(this.pushCaptchaNotification());
                        }
                    },1600);
                    this.waitCaptcha();
                    return;
                }
            }

            this.endless();

            this.getButtons();
            if ('領取獎勵' in this.buttons && !(this.buttons['領取獎勵'].disabled)) {
                this.buttons['領取獎勵'].click();
                console.log('領取樓層獎勵');
            }

            const tempDead = document.querySelector('#root > div > div')
            if (!!tempDead && tempDead.textContent === '你的角色死亡了，請進行轉生') {
                this.dead = true;
            } else {
                this.dead = false;
            }

            if (!this.isBusy) {

                if (this.nextTimeHunt <= 0 && this.isHunterMode && !!this.preyId && this.preyId !== 'null' && this.preyId !== '') {
                    if (!(location.href.includes(`/profile/${this.preyId}`))) {
                        location.replace(`/profile/${this.preyId}`);
                    } else {
                        this.lock();
                        this.hunt();
                    }
                }
                else if (this.nextTimeDoSomething <= 0 && !this.isPause) {
                    if (!(this.links['我的桐人'].className.includes('active'))) {
                        this.links['我的桐人'].click();
                    }
                    this.lock();
                    this.doSomething();
                }
            }

            if (!this.dead) {
                this.nextTimeDoSomething = this.nextTimeDoSomething > 0 ? this.nextTimeDoSomething - 1 : 0;
                this.nextTimeHunt = this.nextTimeHunt > 0 ? this.nextTimeHunt - 1 : 0;

                if (!this.isPause) {
                    if (this.nextTimeDoSomething > 0) {
                        this.messageBlock.textContent = `${this.nextTimeDoSomething} 秒後${this.ACTION_NAME[this.action]}`;
                    } else {
                        this.messageBlock.textContent = `正在${this.ACTION_NAME[this.action]}`;
                    }
                } else {
                    this.messageBlock.textContent = '普通行動已暫停';
                }


                if (this.isHunterMode && !!this.preyId && this.preyId !== 'null' && this.preyId !== '') {
                    if (this.nextTimeHunt > 0) {
                        this.messageBlock.textContent += `, ${this.nextTimeHunt} 秒後發起攻擊`;
                    } else {
                        this.messageBlock.textContent += `, 正在進行${this.DUEL_NAME[this.duel]}`;
                    }
                }
                localStorage.setItem('scriptDateTime', parseInt(+(new Date()) / 1000));
                localStorage.setItem('scriptNextTimeDoSomething', this.nextTimeDoSomething);
                localStorage.setItem('scriptNextTimeHunt', this.nextTimeHunt);
            } else {
                this.messageBlock.textContent = '死掉了';
            }
        }, 1000);
    }

    syncTimer() {
        const scriptDateTime = localStorage.getItem('scriptDateTime');
        const scriptNextTimeDoSomething = localStorage.getItem('scriptNextTimeDoSomething');
        const scriptNextTimeHunt = localStorage.getItem('scriptNextTimeHunt');
        this.nextTimeDoSomething = parseInt(scriptNextTimeDoSomething ? scriptNextTimeDoSomething : 0) + parseInt(scriptDateTime ? scriptDateTime : 0) - parseInt(+(new Date()) / 1000);
        this.nextTimeHunt = parseInt(scriptNextTimeHunt ? scriptNextTimeHunt : 0) + parseInt(scriptDateTime ? scriptDateTime : 0) - parseInt(+(new Date()) / 1000);
    }

    pushCaptchaNotification() {
        return new Notification('等待驗證', {
            body: '快來協助我們訓練使用者辨識公交車、飛機、自行車與船！',
            icon: '/favicon.135392cf.png',
            tag: 'waitCaptcha'
        });
    }

    clearCaptchaNotification() {
        this.notifications.forEach(notification => {
            notification.close();
        })
        this.notifications = [];
    }

    waitCaptcha() {
        setTimeout(() => {
            this.getButtons();
            if ('領取獎勵' in this.buttons && !(this.buttons['領取獎勵'].disabled)) {
                this.buttons['領取獎勵'].click();
                console.log('領取樓層獎勵');
            }
            
            if (document.querySelector('div > iframe')) {
                this.messageBlock.textContent = '等待驗證';
                
                if (this.ACTION_NAME[this.action] in this.buttons && !(this.buttons[this.ACTION_NAME[this.action]].disabled)) {
                    if (!this.isPause) {
                        this.lock();
                        this.doSomething();
                    }
                    this.syncTimer();
                    this.clearCaptchaNotification();
                    this.endless();
                } else if (this.DUEL_NAME[1] in this.buttons && !(this.buttons[this.DUEL_NAME[1]].disabled)) {
                    this.lock();
                    this.hunt();
                    this.syncTimer();
                    this.clearCaptchaNotification();
                    this.endless();
                } else {
                    this.waitCaptcha();
                }
            } else {
                this.clearCaptchaNotification();
                this.endless();
            }
        }, 1000);
    }

    checkPrey() {
        if (!this.preyId || this.preyId === 'null' || this.preyId === '') {
            document.getElementById('hunter-wrapper').setAttribute('class', 'hidden');
            this.preyNameBlock.innerHTML = '無攻擊目標';
        } else {
            document.getElementById('hunter-wrapper').setAttribute('class', 'text-right');
            this.preyNameBlock.innerHTML = `當前攻擊目標: <a href="/profile/${this.preyId}">${this.preyName}</a>`;
        }
    }

    async watchUrl() {
        if (location.href != this.oldUrl) {
            this.oldUrl = location.href;
            // window.dispatchEvent(new Event('urlChange'));
            if (location.href.includes('profile')) {
                this.injectionDuelButton();
            }
        }
        await sleep(50);
        this.watchUrl();
    }

    async injectionDuelButton() {
        const self = this;
        const tempName1 = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
        const tempName2 = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > div > table:nth-child(2) > tbody > tr:nth-child(4) > td');
        if ((!tempName1 || tempName1.textContent === '') && (!tempName2 || tempName2.textContent === '')) {
            await sleep(50);
            if (location.href.includes('profile')) {
                this.injectionDuelButton();
            }
            return;
        }
        const title = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > h3');
        const button = document.createElement('button');
        const isPrey = !!this.preyId && this.preyId !== '' && location.href.includes(this.preyId);
        button.setAttribute('type', 'button');
        button.setAttribute('id', 'button-prey');
        button.setAttribute('class', 'sc-AxgMl llLWDd');
        button.textContent = isPrey ? '移除目標' : '設為攻擊目標';
        title.textContent = '';
        title.appendChild(button);
        button.addEventListener('click', () => {
            const isPrey = !!this.preyId && this.preyId !== '' && location.href.includes(this.preyId);
            if (isPrey) {
                self.preyId = '';
                self.preyName = '';
                button.textContent = '設為攻擊目標';
            } else {
                self.preyId = location.href.split('/').pop();
                self.preyName = !!tempName1 ? tempName1.textContent : tempName2.textContent;
                button.textContent = '移除目標';
            }

            localStorage.setItem('scriptPreyId', self.preyId);
            localStorage.setItem('scriptPreyName', self.preyName);
            self.checkPrey();
        });
    }
}


let kirito = new Mykirito();
kirito.endless();