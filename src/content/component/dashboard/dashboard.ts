import { FIND_STATUS, SCRIPT_STATUS } from './../../constant';
import { DomHelper } from '../../service/dom-helper';
import { MyKirito } from "../../service/my-kirito";
import { ACTION, DUEL, ACTION_NAME, DUEL_NAME } from "../../constant";
import { addButton } from "../../function/utils";
import style from './dashboard.css';
import { ProcessType } from '../../schedule';

export class Dashboard {

    actionButtons: HTMLElement[] = [];
    actionPauseButton: HTMLElement;
    actionButtonsWrapper: HTMLElement;
    actionButtonGroup: HTMLElement;
    duelButtonWrapper: HTMLElement;
    duelButtons: HTMLElement[] = [];
    duelPauseButton: HTMLElement;
    messageBlock: HTMLElement;
    quitFindModeButton: HTMLButtonElement;
    schedulePauseButton: HTMLButtonElement;

    constructor(
        private myKirito: MyKirito,
        private domHelper: DomHelper
    ) { }

    injectionComponent() {
        const self = this;
        const toolsWrapper = document.createElement('div');
        toolsWrapper.id = 'tools-wrapper';
        toolsWrapper.className = `${style.toolsWrapper}`;

        this.duelButtonWrapper = document.createElement('div');
        this.duelButtonWrapper.id = 'duel-wrapper';

        this.actionButtonGroup = document.createElement('div');
        this.actionButtonGroup.className = `${style.btnGroup}`;
        this.actionButtonGroup.id = 'button-group';

        this.actionButtonsWrapper = document.createElement('div');
        this.actionButtonsWrapper.id = 'action-wrapper';
        this.actionButtonsWrapper.appendChild(this.actionButtonGroup);

        const duelButtonGroup = document.createElement('div');
        duelButtonGroup.className = `${style.btnGroup}`;
        duelButtonGroup.id = 'duel-group';

        const statusBar = document.createElement('div');
        statusBar.className = `${style.alert} ${style.alertInfo} ${style.textRight}`;
        statusBar.id = 'status-bar';
        this.messageBlock = document.createElement('div');
        this.messageBlock.id = 'message-block';
        statusBar.appendChild(this.messageBlock);

        this.quitFindModeButton = document.createElement('button');
        this.quitFindModeButton.textContent = '離開尋找模式';
        this.quitFindModeButton.hidden = true;
        this.quitFindModeButton.classList.add(style.btn, style.btnInfo, style.buttonQuitFind);
        this.quitFindModeButton.addEventListener('click', () => {
            self.myKirito.findStatus = FIND_STATUS.Normal;
            self.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
            self.myKirito.isBusy = false;
        });

        this.schedulePauseButton = document.createElement('button');
        this.schedulePauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>';
        this.schedulePauseButton.hidden = true;
        this.schedulePauseButton.classList.add(style.btn, style.btnSecondary, style.buttonSchedulePause);
        this.updateSchedulePauseButtonStyle();
        this.schedulePauseButton.addEventListener('click', () => {
            const tempIsPause = self.myKirito.schedule.isPause;
            if (!tempIsPause) {
                self.myKirito.schedule.isPause = true;
                self.myKirito.saveSchedule();
            } else {
                self.myKirito.schedule.isPause = false;
                self.myKirito.saveSchedule();
                const tempSecond = self.myKirito.getTempSecond();
                self.myKirito.loadNextActionSecond(tempSecond);
                self.myKirito.loadNextDuelSecond(tempSecond);
            }
            self.updateSchedulePauseButtonStyle();
        });

        document.getElementById('root').appendChild(toolsWrapper);
        toolsWrapper.appendChild(this.duelButtonWrapper);
        toolsWrapper.appendChild(this.actionButtonsWrapper);
        statusBar.appendChild(this.quitFindModeButton);
        statusBar.appendChild(this.schedulePauseButton);
        toolsWrapper.appendChild(statusBar);

        for (let action in ACTION) {
            const button = addButton('button-group', `button-${action}`, action);
            this.actionButtons.push(button);
            button.className = ACTION[action] === this.myKirito.action ? `${style.btn} ${style.btnSecondary} ${style.active}` : `${style.btn} ${style.btnSecondary}`;
            button.addEventListener('click', () => {
                self.myKirito.action = ACTION[action];
                self.myKirito.saveDefaultAction();
                self.updateButtonsStyle();
            });
        }


        this.actionPauseButton = addButton('action-wrapper', `button-pause`, '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>');
        this.updateActionPauseButtonStyle();
        this.actionPauseButton.addEventListener('click', () => {
            const tempIsPause = self.myKirito.isActionPause;
            if (!tempIsPause) {
                self.myKirito.isActionPause = true;
                self.myKirito.saveIsActionPause();
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
            button.className = DUEL[duel] === this.myKirito.duel ? `${style.btn} ${style.btnSecondary} ${style.active}` : `${style.btn} ${style.btnSecondary}`;
            button.addEventListener('click', () => {
                self.myKirito.duel = DUEL[duel];
                self.myKirito.saveDefaultDuel();
                self.updateButtonsStyle();
            });
        }
    }

    updateButtonsStyle() {
        this.actionButtons.forEach(button => {
            button.className = ACTION[button.textContent] === this.myKirito.action ? `${style.btn} ${style.btnSecondary} ${style.active}` : `${style.btn} ${style.btnSecondary}`;
        });
        this.duelButtons.forEach(button => {
            button.className = DUEL[button.textContent] === this.myKirito.duel ? `${style.btn} ${style.btnSecondary} ${style.active}` : `${style.btn} ${style.btnSecondary}`;
        })
    }

    updateActionPauseButtonStyle() {
        const tempIsPause = this.myKirito.isActionPause;
        this.actionPauseButton.className = !tempIsPause ? `${style.btn} ${style.btnInfo} ${style.active}` : `${style.btn} ${style.btnSecondary}`;
        if (this.myKirito.isActionPause) {
            this.actionPauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>';
        } else {
            this.actionPauseButton.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pause-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>';
        }
    }

    updateSchedulePauseButtonStyle() {
        this.schedulePauseButton.className = !this.myKirito.schedule.isPause ? `${style.btn} ${style.btnInfo} ${style.buttonSchedulePause} ${style.active}` : `${style.btn} ${style.btnSecondary} ${style.buttonSchedulePause}`;
        if (this.myKirito.schedule.isPause) {
            this.schedulePauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>';
        } else {
            this.schedulePauseButton.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pause-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>';
        }
    }

    updateDuelPauseButtonStyle() {
        if (!this.myKirito.isDuelPause) {
            this.duelPauseButton.textContent = '停止';
            this.duelPauseButton.className = `${style.btn} ${style.btnDanger} ${style.buttonDuel} ${style.active}`;
        } else {
            this.duelPauseButton.textContent = '自動攻擊';
            this.duelPauseButton.className = `${style.btn} ${style.btnDanger}`;
        }
    }

    updateButtonsShowHide() {
        if (!this.myKirito.preyId && !this.duelButtonWrapper.hidden || this.myKirito.scriptStatus === SCRIPT_STATUS.Find || this.myKirito.schedule.isEnable && this.myKirito.schedule.isDuelScheduleEnable) {
            this.duelButtonWrapper.hidden = true;
        } else if (this.myKirito.preyId && this.duelButtonWrapper.hidden) {
            this.duelButtonWrapper.hidden = false;
        }

        if (this.myKirito.scriptStatus === SCRIPT_STATUS.Find || this.myKirito.schedule.isEnable) {
            this.actionButtonsWrapper.hidden = true;
        } else {
            this.actionButtonsWrapper.hidden = false;
        }

        if (this.myKirito.scriptStatus === SCRIPT_STATUS.Find) {
            this.quitFindModeButton.classList.remove(style.hidden);
        } else {
            this.quitFindModeButton.classList.add(style.hidden);
        }

        if (this.myKirito.schedule.isEnable) {
            this.schedulePauseButton.classList.remove(style.hidden);;
        } else {
            this.schedulePauseButton.classList.add(style.hidden);
        }

    }

    updateDashboard() {
        if (this.myKirito.scriptStatus === SCRIPT_STATUS.Find) {
            switch (this.myKirito.findStatus) {
                case FIND_STATUS.Processing:
                    this.messageBlock.textContent = '正在尋找符合條件的對象... ';
                    break;
                case FIND_STATUS.Found:
                    this.messageBlock.textContent = '找到了 ';
                    break;
                case FIND_STATUS.NotFound:
                    this.messageBlock.textContent = '找不到符合條件的對象 ';
            }
        } else if (this.myKirito.isDead) {
            this.messageBlock.textContent = '死掉了';
        } else if (this.myKirito.schedule.isEnable) {
            const messages = [];
            if (this.myKirito.schedule.isPause) {
                if (this.myKirito.isPreyDead && this.myKirito.schedule.isDuelScheduleEnable) {
                    messages.push(this.getDuelStatus());
                } else {
                    messages.push('排程行動已暫停');
                }
            } else if (!!this.myKirito.schedule.current) {
                switch (this.myKirito.schedule.current.type) {
                    case ProcessType.Action:
                        messages.push(this.getActionStatus());
                        break;
                    case ProcessType.Duel:
                        messages.push(this.getDuelStatus());
                        break;
                }
            } else {
                messages.push('目前沒有行動');
            }

            if (!this.myKirito.schedule.isDuelScheduleEnable) {
                messages.push(this.getDuelStatus());
            }

            this.messageBlock.innerHTML = messages.join(', ');
        } else {
            const messages = [];
            messages.push(this.getActionStatus());
            messages.push(this.getDuelStatus());

            this.messageBlock.innerHTML = messages.join(', ');
        }

        this.updateButtonsShowHide();
    }

    getActionStatus() {
        if (this.myKirito.isActionPause && !this.myKirito.schedule.isEnable) {
            return '普通行動已暫停';
        } else if (this.myKirito.isActionWaitCaptcha) {
            return '<a href="/">等待驗證後行動</a>';
        } else {
            if (this.myKirito.nextActionSecond > 0) {
                return `${this.myKirito.nextActionSecond} 秒後${ACTION_NAME[this.myKirito.action]}`;
            } else {
                return `正在${ACTION_NAME[this.myKirito.action]}`;
            }
        }
    }

    getDuelStatus() {
        if (!this.myKirito.preyId) {
            return '沒有攻擊目標';
        } else if (this.myKirito.isPreyDead) {
            return `<a href="/profile/${this.myKirito.preyId}">${this.myKirito.preyName}</a> 已經死了`;
        } else if (this.myKirito.isDuelPause && !(this.myKirito.schedule.isEnable && this.myKirito.schedule.isDuelScheduleEnable)) {
            return `對 <a href="/profile/${this.myKirito.preyId}">${this.myKirito.preyName}</a> 的攻擊已暫停`;
        } else if (this.myKirito.isDuelWaitCaptcha) {
            return `<a href="/profile/${this.myKirito.preyId}">等待驗證後攻擊 ${this.myKirito.preyName}</a>`;
        } else {
            if (this.myKirito.nextDuelSecond > 0) {
                return `${this.myKirito.nextDuelSecond} 秒後向 <a href="/profile/${this.myKirito.preyId}">${this.myKirito.preyName}</a> 發起攻擊`;
            } else {
                return `正在對 ${this.myKirito.preyName} 進行${DUEL_NAME[this.myKirito.duel]}`;
            }
        }
    }
}