import { MyKirito } from './my-kirito';
import { DomHelper } from './dom-helper';
import { ACTION_NAME, DUEL_NAME, SCRIPT_STATUS } from './constant';
import { sleep, random } from './utils';

export class Worker {

    myKirito: MyKirito;
    domHelper: DomHelper;

    constructor(myKirito: MyKirito, domHelper: DomHelper) {
        this.myKirito = myKirito;
        this.domHelper = domHelper;
        this.updateMessageBlock();
    }

    updateMessageBlock() {
        if (this.myKirito.isDead) {
            this.domHelper.messageBlock.textContent = '死掉了';
        } else {
            if (this.myKirito.isActionPause) {
                this.domHelper.messageBlock.innerHTML = '普通行動已暫停';
            } else if (this.myKirito.isActionWaitCaptcha) {
                this.domHelper.messageBlock.innerHTML = '<a href="/">等待驗證後行動</a>';
                if (location.pathname === '/' && (ACTION_NAME[this.myKirito.action] in this.domHelper.buttons && !(this.domHelper.buttons[ACTION_NAME[this.myKirito.action]].disabled) || !this.domHelper.hasIframe())) {
                    this.myKirito.isActionWaitCaptcha = false;
                    this.myKirito.saveIsActionWaitCaptcha();
                }
            } else {
                if (this.myKirito.nextActionSecond > 0) {
                    this.domHelper.messageBlock.innerHTML = `${this.myKirito.nextActionSecond} 秒後${ACTION_NAME[this.myKirito.action]}`;
                } else {
                    this.domHelper.messageBlock.innerHTML = `正在${ACTION_NAME[this.myKirito.action]}`;
                }
            }
            if (this.myKirito.isHuntPause || !this.myKirito.preyId) {
                if (this.myKirito.isPreyDead) {
                    this.domHelper.messageBlock.innerHTML += `, <a href="/profile/${this.myKirito.preyId}">他死了</a>`;
                } else {
                    this.domHelper.messageBlock.innerHTML += !this.myKirito.preyId ? ', 沒有攻擊目標' : ', 攻擊已暫停';
                }
            } else if (this.myKirito.isHuntWaitCaptcha) {
                this.domHelper.messageBlock.innerHTML += `, <a href="/profile/${this.myKirito.preyId}">等待驗證後攻擊</a>`;
                if (location.href.includes(`/profile/${this.myKirito.preyId}`) && (DUEL_NAME[1] in this.domHelper.buttons && !(this.domHelper.buttons[DUEL_NAME[1]].disabled) || !this.domHelper.hasIframe())) {
                    this.myKirito.isHuntWaitCaptcha = false;
                    this.myKirito.saveIsHuntWaitCaptcha();
                }
            } else {
                if (this.myKirito.nextHuntSecond > 0) {
                    this.domHelper.messageBlock.innerHTML += `, ${this.myKirito.nextHuntSecond} 秒後發起攻擊`;
                } else {
                    this.domHelper.messageBlock.innerHTML += `, 正在進行${DUEL_NAME[this.myKirito.duel]}`;
                }
            }
        }
    }

    async action() {
        this.domHelper.loadLinks();
        if (!(this.domHelper.links['我的桐人'].className.includes('active'))) {
            this.domHelper.links['我的桐人'].click();
        } else {
            this.myKirito.lock();
            this.myKirito.scriptStatus = SCRIPT_STATUS.Action;
            this.myKirito.saveScriptStatus();

            // 檢查暱稱欄位
            const tempName = await this.domHelper.waitForText('#root > div > div > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
            // 若超過10秒仍未顯示暱稱，重新整理
            if (!tempName) {
                this.myKirito.unlock();
                location.reload();
            }

            this.domHelper.loadContentBlocks();
            this.domHelper.loadButtons();

            // 有OK可以按就按OK
            if (this.domHelper.buttons['OK']) {
                this.domHelper.buttons['OK'].click();
            }

            const cd = this.domHelper.getActionCd();
            // 檢查是否在冷卻
            if (cd > 0) {
                this.myKirito.nextActionSecond = cd + random(this.myKirito.randomDelay);
                this.myKirito.unlock();
                return;
            }

            const oldLog = this.domHelper.getActionLog();
            let checkCaptchaCount = 0;

            while (checkCaptchaCount < 20) {
                checkCaptchaCount++;
                // 按下該按的按鈕
                if (ACTION_NAME[this.myKirito.action] in this.domHelper.buttons && !(this.domHelper.buttons[ACTION_NAME[this.myKirito.action]].disabled)) {
                    this.domHelper.buttons[ACTION_NAME[this.myKirito.action]].click();
                    console.log(ACTION_NAME[this.myKirito.action]);
                    break;
                } else {
                    // 檢查驗證
                    if (this.domHelper.hasIframe() && ACTION_NAME[this.myKirito.action] in this.domHelper.buttons && this.domHelper.buttons[ACTION_NAME[this.myKirito.action]].disabled) {
                        this.myKirito.isActionWaitCaptcha = true;
                        this.myKirito.saveIsActionWaitCaptcha();
                        this.myKirito.unlock();
                        return;
                    }
                }
                await sleep(500);
            }

            // 若按鈕為disable，且重試10次仍沒有出現驗證框，重新整理
            if (checkCaptchaCount >= 20) {
                this.myKirito.unlock();
                location.reload();
            }

            // 檢查行動結果
            const newLog = this.domHelper.getActionLog();
            if (newLog.length > oldLog.length && newLog[0].includes('行動成功')) {
                console.log(newLog[0]);
                this.myKirito.nextActionSecond = this.myKirito.actionCd + random(this.myKirito.randomDelay);
                this.myKirito.unlock();
            } else {
                // 若未出現應有的行動結果，重新整理
                this.myKirito.unlock();
                location.reload();
            }
        }
    }

    async hunt() {
        if (!(location.href.includes(`/profile/${this.myKirito.preyId}`))) {
            location.replace(`/profile/${this.myKirito.preyId}`);
        } else {
            this.myKirito.lock();
            this.myKirito.scriptStatus = SCRIPT_STATUS.Hunt;
            this.myKirito.saveScriptStatus();

            // 檢查暱稱欄位
            const tempName = await this.domHelper.waitForText(
                this.myKirito.profileViewType === 'detail' || !this.myKirito.profileViewType ?
                    'table > tbody > tr:nth-child(1) > td:nth-child(2)' :
                    'div > table:nth-child(2) > tbody > tr:nth-child(4) > td'
            );
            // 若超過10秒仍未顯示對手暱稱，重新整理
            if (!tempName) {
                this.myKirito.unlock();
                location.reload();
                return;
            }

            this.domHelper.loadContentBlocks();
            this.domHelper.loadButtons();

            // 檢查對手死了沒
            const tempStatus = await this.domHelper.waitForText('#root > div > div:nth-child(1) > div:nth-child(2)');
            if (!!tempStatus && tempStatus === '此玩家目前是死亡狀態') {
                this.myKirito.isPreyDead = true;
                this.myKirito.nextHuntSecond = 0;
                this.myKirito.isHuntPause = true;
                this.myKirito.saveIsHuntPause();
                this.domHelper.updateHunterButtonStyle();
                this.myKirito.unlock();
                return;
            } else {
                this.myKirito.isPreyDead = false;
            }

            const cd = this.domHelper.getDuelCd();
            // 檢查是否在冷卻
            if (cd > 0) {
                this.myKirito.nextHuntSecond = cd + random(this.myKirito.randomDelay);
                this.myKirito.unlock();
                return;
            }

            // 有OK可以按就按OK
            if (this.domHelper.buttons['OK']) {
                this.domHelper.buttons['OK'].click();
            }

            const oldLog = this.domHelper.getDuelLog();

            let checkCaptchaCount = 0;
            let duelType = '';

            while (checkCaptchaCount < 20) {
                checkCaptchaCount++;
                if (DUEL_NAME[this.myKirito.duel] in this.domHelper.buttons && !(this.domHelper.buttons[DUEL_NAME[this.myKirito.duel]].disabled)) {
                    this.domHelper.buttons[DUEL_NAME[this.myKirito.duel]].click();
                    duelType = DUEL_NAME[this.myKirito.duel];
                    break;
                } else if (DUEL_NAME[2] in this.domHelper.buttons && !(this.domHelper.buttons[DUEL_NAME[2]].disabled)) {
                    this.domHelper.buttons[DUEL_NAME[2]].click();
                    duelType = DUEL_NAME[2];
                    break;
                } else {
                    // 檢查驗證
                    if (this.domHelper.hasIframe() && DUEL_NAME[1] in this.domHelper.buttons && this.domHelper.buttons[DUEL_NAME[1]].disabled) {
                        this.myKirito.isHuntWaitCaptcha = true;
                        this.myKirito.saveIsHuntWaitCaptcha();
                        this.myKirito.unlock();
                        return;
                    }
                }
                await sleep(500);
            }

            // 若按鈕為disable，且重試20次仍沒有出現驗證框，重新整理
            if (checkCaptchaCount >= 20) {
                this.myKirito.unlock();
                location.reload();
            }

            // 檢查對戰結果
            const newLog = this.domHelper.getDuelLog();
            if (newLog.length > oldLog.length && newLog[0].includes(duelType)) {
                console.log(newLog[0]);
                this.myKirito.nextHuntSecond = this.myKirito.huntCd + random(this.myKirito.randomDelay) + (this.myKirito.duel == 4 ? this.myKirito.extraMercilesslyCd : 0);
                this.myKirito.unlock();
            } else {
                // 若未出現應有的對戰結果，重新整理
                this.myKirito.unlock();
                location.reload();
            }
        }
    }

    async endless() {

        await sleep(1000);
        this.endless();

        this.domHelper.loadButtons();

        if ('領取獎勵' in this.domHelper.buttons && !(this.domHelper.buttons['領取獎勵'].disabled) && this.myKirito.isAutoReceiveAward) {
            this.domHelper.buttons['領取獎勵'].click();
            console.log('領取樓層獎勵');
            await sleep(500);
            return;
        }

        const tempDead = document.querySelector('#root > div > div')
        if (!!tempDead && tempDead.textContent === '你的角色死亡了，請進行轉生') {
            this.myKirito.isDead = true;
        } else {
            this.myKirito.isDead = false;
        }

        this.myKirito.nextActionSecond = this.myKirito.nextActionSecond > 0 ? this.myKirito.nextActionSecond - 1 : 0;
        this.myKirito.nextHuntSecond = this.myKirito.nextHuntSecond > 0 ? this.myKirito.nextHuntSecond - 1 : 0;
        this.myKirito.saveTempSecond();
        this.myKirito.saveNextActionSecond();
        this.myKirito.saveNextHuntSecond();
        this.updateMessageBlock();

        if (!this.myKirito.isBusy) {
            if (
                this.myKirito.nextHuntSecond <= 0 &&
                !this.myKirito.isHuntPause &&
                !this.myKirito.isHuntWaitCaptcha &&
                !!this.myKirito.preyId
            ) {
                this.hunt();
            } else if (
                this.myKirito.nextActionSecond <= 0 &&
                !this.myKirito.isActionPause &&
                !this.myKirito.isActionWaitCaptcha
            ) {
                this.action();
            }
        } else {
            switch (this.myKirito.scriptStatus) {
                case SCRIPT_STATUS.Action:
                    this.action();
                    break;
                case SCRIPT_STATUS.Hunt:
                    this.hunt();
                    break;
                default:
                    this.myKirito.unlock();
            }
        }
    }
}