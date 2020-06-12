import { ACTION, DUEL } from './constant';
import { MyKirito } from './my-kirito';
import { sleep } from './utils';

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

    constructor(myKirito: MyKirito) {
        this.myKirito = myKirito;
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
            button.setAttribute('class', ACTION[action] === this.myKirito.action ? 'btn btn-secondary active' : 'btn btn-secondary');
            button.addEventListener('click', () => {
                self.myKirito.action = ACTION[action];
                self.myKirito.saveDefaultAction();
                self.setToolsButtonStyle();
            });
        }
        
        this.pauseButton = this.addButton('button-group', `button-pause`, '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>');
        this.setPauseButtonStyle();
        this.pauseButton.addEventListener('click', () => {
            if (!self.myKirito.isActionPause) {
                self.myKirito.isActionPause = true;
                self.myKirito.saveIsActionPause();
                localStorage.setItem('scriptIsActionPause', 'true');
            } else {
                self.myKirito.isActionPause = false;
                self.myKirito.saveIsActionPause();
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
            if (!self.myKirito.isHuntPause) {
                self.myKirito.unlock();
                self.myKirito.isHuntPause = true;
                self.myKirito.saveIsHuntPause();
            } else {
                const tempSecond = self.myKirito.getTempSecond();
                self.myKirito.loadNextHuntSecond(tempSecond);

                self.myKirito.isHuntPause = false;
                self.myKirito.saveIsHuntPause();
            }
            self.setHunterButtonStyle();
        });

        for (let duel in DUEL) {
            const button = this.addButton('duel-group', `button-${duel}`, duel);
            this.duelButtons.push(button);
            button.setAttribute('class', DUEL[duel] === this.myKirito.duel ? 'btn btn-secondary active' : 'btn btn-secondary');
            button.addEventListener('click', () => {
                self.myKirito.duel = DUEL[duel];
                self.myKirito.saveDefaultDuel();
                self.setToolsButtonStyle();
            });
        }
    }


    setToolsButtonStyle() {
        this.actionButtons.forEach(button => {
            button.setAttribute('class', ACTION[button.textContent] === this.myKirito.action ? 'btn btn-secondary active' : 'btn btn-secondary');
        });
        this.duelButtons.forEach(button => {
            button.setAttribute('class', DUEL[button.textContent] === this.myKirito.duel ? 'btn btn-secondary active' : 'btn btn-secondary');
        })
    }


    setPauseButtonStyle() {
        this.pauseButton.setAttribute('class', !this.myKirito.isActionPause ? 'btn btn-info active' : 'btn btn-secondary');
        if (this.myKirito.isActionPause) {
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
        if (!this.myKirito.preyId || this.myKirito.preyId === 'null' || this.myKirito.preyId === '') {
            document.getElementById('hunter-wrapper').setAttribute('class', 'hidden');
            this.preyNameBlock.innerHTML = '無攻擊目標';
        } else {
            document.getElementById('hunter-wrapper').setAttribute('class', 'text-right');
            this.preyNameBlock.innerHTML = `當前攻擊目標: <a href="/profile/${this.myKirito.preyId}">${this.myKirito.preyName}</a>`;
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
        const isPrey = !!self.myKirito.preyId && self.myKirito.preyId !== '' && location.href.includes(self.myKirito.preyId);
        button.setAttribute('type', 'button');
        button.setAttribute('id', 'button-prey');
        button.setAttribute('class', 'sc-AxgMl llLWDd');
        button.textContent = isPrey ? '移除目標' : '設為攻擊目標';
        title.textContent = '';
        title.appendChild(button);
        button.addEventListener('click', () => {
            const isPrey = !!self.myKirito.preyId && self.myKirito.preyId !== '' && location.href.includes(self.myKirito.preyId);
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
        if (!this.myKirito.isHuntPause) {
            this.hunterButton.textContent = '停止';
            this.hunterButton.setAttribute('class', 'btn btn-danger active');
        } else {
            this.hunterButton.textContent = '自動攻擊';
            this.hunterButton.setAttribute('class', 'btn btn-danger');
        }
    }

}