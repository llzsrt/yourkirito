import { DomHelper } from '../service/dom-helper';
import { MyKirito } from "../service/my-kirito";
import { ACTION, DUEL, ACTION_NAME, DUEL_NAME } from "../constant";
import { addButton } from "../function/utils";

export class Dashboard {

    actionButtons: HTMLElement[] = [];
    actionPauseButton: HTMLElement;
    duelButtonWrapper: HTMLElement;
    duelButtons: HTMLElement[] = [];
    duelPauseButton: HTMLElement;
    messageBlock: HTMLElement;

    constructor(
        private myKirito: MyKirito,
        private domHelper: DomHelper
    ) {
        this.injectionDashboard();
        this.updateDashboard();
    }

    injectionDashboard() {
        const self = this;
        const toolsWrapper = document.createElement('div');
        toolsWrapper.id = 'tools-wrapper';

        this.duelButtonWrapper = document.createElement('div');
        this.duelButtonWrapper.id = 'duel-wrapper';

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'btn-group';
        buttonGroup.id = 'button-group';

        const duelButtonGroup = document.createElement('div');
        duelButtonGroup.className = 'btn-group';
        duelButtonGroup.id = 'duel-group';

        const statusBar = document.createElement('div');
        statusBar.className = 'alert alert-info text-right';
        statusBar.id = 'status-bar';
        this.messageBlock = document.createElement('div');
        this.messageBlock.id = 'message-block';
        statusBar.appendChild(this.messageBlock);

        document.getElementById('root').appendChild(toolsWrapper);
        toolsWrapper.appendChild(this.duelButtonWrapper);
        toolsWrapper.appendChild(buttonGroup);
        toolsWrapper.appendChild(statusBar);

        for (let action in ACTION) {
            const button = addButton('button-group', `button-${action}`, action);
            this.actionButtons.push(button);
            button.className = ACTION[action] === this.myKirito.action ? 'btn btn-secondary active' : 'btn btn-secondary';
            button.addEventListener('click', () => {
                self.myKirito.action = ACTION[action];
                self.myKirito.saveDefaultAction();
                self.updateButtonsStyle();
            });
        }

        this.actionPauseButton = addButton('button-group', `button-pause`, '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>');
        this.updateActionPauseButtonStyle();
        this.actionPauseButton.addEventListener('click', () => {
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
            self.updateActionPauseButtonStyle();
        });

        this.duelButtonWrapper.appendChild(duelButtonGroup);
        this.duelPauseButton = addButton('duel-wrapper', 'button-duel', '自動攻擊');
        this.updateDuelPauseButtonStyle();
        this.duelPauseButton.addEventListener('click', () => {
            if (!self.myKirito.isDuelPause) {
                self.myKirito.unlock();
                self.myKirito.isDuelPause = true;
                self.myKirito.saveIsDuelPause();
            } else {
                const tempSecond = self.myKirito.getTempSecond();
                self.myKirito.loadNextDuelSecond(tempSecond);
                self.myKirito.isDuelPause = false;
                self.myKirito.saveIsDuelPause();
            }
            self.updateDuelPauseButtonStyle();
        });

        for (let duel in DUEL) {
            const button = addButton('duel-group', `button-${duel}`, duel);
            this.duelButtons.push(button);
            button.className = DUEL[duel] === this.myKirito.duel ? 'btn btn-secondary active' : 'btn btn-secondary';
            button.addEventListener('click', () => {
                self.myKirito.duel = DUEL[duel];
                self.myKirito.saveDefaultDuel();
                self.updateButtonsStyle();
            });
        }
    }

    updateButtonsStyle() {
        this.actionButtons.forEach(button => {
            button.className = ACTION[button.textContent] === this.myKirito.action ? 'btn btn-secondary active' : 'btn btn-secondary';
        });
        this.duelButtons.forEach(button => {
            button.className = DUEL[button.textContent] === this.myKirito.duel ? 'btn btn-secondary active' : 'btn btn-secondary';
        })
    }

    updateActionPauseButtonStyle() {
        this.actionPauseButton.className = !this.myKirito.isActionPause ? 'btn btn-info active' : 'btn btn-secondary';
        if (this.myKirito.isActionPause) {
            this.actionPauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
        } else {
            this.actionPauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
        }
    }

    updateDuelPauseButtonStyle() {
        if (!this.myKirito.isDuelPause) {
            this.duelPauseButton.textContent = '停止';
            this.duelPauseButton.className = 'btn btn-danger active';
        } else {
            this.duelPauseButton.textContent = '自動攻擊';
            this.duelPauseButton.className = 'btn btn-danger';
        }
    }

    updateDashboard() {
        if (this.myKirito.isDead) {
            this.messageBlock.textContent = '死掉了';
        } else {
            if (this.myKirito.isActionPause) {
                this.messageBlock.innerHTML = '普通行動已暫停';
            } else if (this.myKirito.isActionWaitCaptcha) {
                this.messageBlock.innerHTML = '<a href="/">等待驗證後行動</a>';
                if (location.pathname === '/' && (ACTION_NAME[this.myKirito.action] in this.domHelper.buttons && !(this.domHelper.buttons[ACTION_NAME[this.myKirito.action]].disabled) || !this.domHelper.hasIframe())) {
                    this.myKirito.isActionWaitCaptcha = false;
                    this.myKirito.saveIsActionWaitCaptcha();
                }
            } else {
                if (this.myKirito.nextActionSecond > 0) {
                    this.messageBlock.innerHTML = `${this.myKirito.nextActionSecond} 秒後${ACTION_NAME[this.myKirito.action]}`;
                } else {
                    this.messageBlock.innerHTML = `正在${ACTION_NAME[this.myKirito.action]}`;
                }
            }
            if (this.myKirito.isDuelPause || !this.myKirito.preyId) {
                if (this.myKirito.isPreyDead) {
                    this.messageBlock.innerHTML += `, <a href="/profile/${this.myKirito.preyId}">${this.myKirito.preyName}</a> 已經死了`;
                } else {
                    this.messageBlock.innerHTML += !this.myKirito.preyId ? ', 沒有攻擊目標' : `, 對 <a href="/profile/${this.myKirito.preyId}">${this.myKirito.preyName}</a> 的攻擊已暫停`;
                }
            } else if (this.myKirito.isDuelWaitCaptcha) {
                this.messageBlock.innerHTML += `, <a href="/profile/${this.myKirito.preyId}">等待驗證後攻擊 ${this.myKirito.preyName}</a>`;
                if (location.href.includes(`/profile/${this.myKirito.preyId}`) && (DUEL_NAME[1] in this.domHelper.buttons && !(this.domHelper.buttons[DUEL_NAME[1]].disabled) || !this.domHelper.hasIframe())) {
                    this.myKirito.isDuelWaitCaptcha = false;
                    this.myKirito.saveIsDuelWaitCaptcha();
                }
            } else {
                if (this.myKirito.nextDuelSecond > 0) {
                    this.messageBlock.innerHTML += `, ${this.myKirito.nextDuelSecond} 秒後向 <a href="/profile/${this.myKirito.preyId}">${this.myKirito.preyName}</a> 發起攻擊`;
                } else {
                    this.messageBlock.innerHTML += `, 正在對 ${this.myKirito.preyName} 進行${DUEL_NAME[this.myKirito.duel]}`;
                }
            }
        }

        if (!this.myKirito.preyId && !this.duelButtonWrapper.hidden) {
            this.duelButtonWrapper.hidden = true;
        } else if (this.myKirito.preyId && this.duelButtonWrapper.hidden) {
            this.duelButtonWrapper.hidden = false;
        }
    }
}