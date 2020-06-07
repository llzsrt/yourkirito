import { ACTION, DUEL } from './constant.js';
import { MyKirito } from './mykirito.js';
import { sleep } from './utils.js';

export class DomHelper {

    myKirito;

    buttons = {}
    links = {}
    actionButtons = [];
    duelButtons = [];
    messageBlock;
    hunterButton;
    pauseButton;
    preyNameBlock;

    oldUrl = '';

    constructor() {
        this.loadLinks();
        this.loadButtons();
        this.injectionTools();
        this.checkPrey();
        this.watchUrl();
        this.messageBlock = document.getElementById('message-block');
    }

    addButton(parentId, id, content) {
        const parent = document.getElementById(parentId);
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('id', id);
        button.innerHTML = content;
        return parent.appendChild(button);
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

        for (let action in ACTION) {
            const button = this.addButton('button-group', `button-${action}`, action);
            this.actionButtons.push(button);
            button.setAttribute('class', ACTION[action] === this.action ? 'btn btn-secondary active' : 'btn btn-secondary');
            button.addEventListener('click', () => {
                self.myKirito.action = ACTION[action];
                self.myKirito.saveDefaultAction();
                self.setToolsButtonStyle();
            });
        }
        
        this.pauseButton = this.addButton('button-group', `button-pause`, '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>');
        this.setPauseButtonStyle();
        this.pauseButton.addEventListener('click', () => {
            if (!self.myKirito.isPause) {
                self.myKirito.isPause = true;
                self.myKirito.saveIsPause();
                localStorage.setItem('scriptIsPause', 'true');
            } else {
                self.myKirito.isPause = false;
                self.myKirito.saveIsPause();
                const tempSecond = self.myKirito.getTempSecond();
                self.myKirito.loadNextActionSecond(tempSecond);
            }
            self.setPauseButtonStyle();
        });

        this.preyNameBlock = hunterWrapper.appendChild(preyName);

        hunterWrapper.appendChild(duelButtonGroup);
        this.hunterButton = this.addButton('hunter-wrapper', 'button-hunter', '自動攻擊');
        this.setHunterButtonStyle();
        this.hunterButton.addEventListener('click', () => {
            if (self.isHunterMode) {
                self.myKirito.unlock();
                self.isHunterMode = false;
                self.myKirito.saveIsHunterMode();
            } else {
                const tempSecond = self.myKirito.getTempSecond();
                self.myKirito.loadNextHuntSecond(tempSecond);

                self.isHunterMode = true;
                self.myKirito.saveIsHunterMode();
            }
            self.setHunterButtonStyle();
        });

        for (let duel in DUEL) {
            const button = this.addButton('duel-group', `button-${duel}`, duel);
            this.duelButtons.push(button);
            button.setAttribute('class', DUEL[duel] === this.duel ? 'btn btn-secondary active' : 'btn btn-secondary');
            button.addEventListener('click', () => {
                self.myKirito.duel = self.DUEL[duel];
                self.myKirito.saveDefaultDuel();
                self.setToolsButtonStyle();
            });
        }
    }


    setToolsButtonStyle() {
        this.actionButtons.forEach(button => {
            button.setAttribute('class', ACTION[button.textContent] === this.action ? 'btn btn-secondary active' : 'btn btn-secondary');
        });
        this.duelButtons.forEach(button => {
            button.setAttribute('class', DUEL[button.textContent] === this.duel ? 'btn btn-secondary active' : 'btn btn-secondary');
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


    loadButtons() {
        document.querySelectorAll('button').forEach(button => {
            this.buttons[button.textContent] = button;
        });
    }


    loadLinks() {
        document.querySelectorAll('a').forEach(button => {
            this.links[button.textContent] = button;
        });
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
                self.myKirito.preyId = '';
                self.myKirito.preyName = '';
                button.textContent = '設為攻擊目標';
            } else {
                self.myKirito.preyId = location.href.split('/').pop();
                self.myKirito.preyName = !!tempName1 ? tempName1.textContent : tempName2.textContent;
                button.textContent = '移除目標';
            }

            self.myKirito.savePreyId();
            self.myKirito.savePreyName();
            self.checkPrey();
        });
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

}