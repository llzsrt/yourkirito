import { Dashboard } from './component/dashboard/dashboard';
import { MyKirito } from './service/my-kirito';
import { DomHelper } from './service/dom-helper';
import { ACTION_NAME, DUEL_NAME, SCRIPT_STATUS, FIND_STATUS } from './constant';
import { sleep, random } from './function/utils';
import { DuelTools } from './component/duel-tools/duel-tools';
import { UrlChangeEventDetail } from './event/url-change';
import { UserListTools } from './component/user-list-tools/user-list-tools';
import { ProcessType } from './schedule';

export class App {

    dashboard: Dashboard;
    duelTools: DuelTools;
    userListTools: UserListTools;

    constructor(
        private myKirito: MyKirito,
        private domHelper: DomHelper
    ) {
        this.dashboard = new Dashboard(myKirito, domHelper);
        this.duelTools = new DuelTools(myKirito, domHelper);
        this.userListTools = new UserListTools(myKirito, domHelper);

        this.dashboard.injectionComponent();
        this.dashboard.updateDashboard();

        window.addEventListener('urlChange', async (event: CustomEvent<UrlChangeEventDetail>) => {

            if (this.myKirito.findStatus === FIND_STATUS.Found && !event.detail.currentUrl.includes('profile')) {
                this.dashboard.quitFindModeButton.click();
            }

            if (event.detail.currentUrl.includes('profile')) {
                await this.duelTools.injectionComponent();
                if (this.myKirito.scriptStatus === SCRIPT_STATUS.Find) {
                    if (this.myKirito.findStatus === FIND_STATUS.Found && this.myKirito.setFoundUserAsPrey && !this.duelTools.isPrey) {
                        this.duelTools.setPreyButton.click();
                        this.dashboard.quitFindModeButton.click();
                    }
                }
            } else if (event.detail.currentUrl.includes('user-list')) {
                this.userListTools.injectionComponent();
            }
        });
    }

    private async action() {
        this.domHelper.loadLinks();
        if (!(this.domHelper.links['我的桐人'].className.includes('active'))) {
            this.domHelper.links['我的桐人'].click();
        } else {
            this.myKirito.lock();
            this.myKirito.scriptStatus = SCRIPT_STATUS.Action;

            // 檢查暱稱欄位
            const tempName = await this.domHelper.waitForText('#root > div > div > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
            // 若超過10秒仍未顯示暱稱，重新整理
            if (!tempName) {
                this.myKirito.scriptStatus = SCRIPT_STATUS.ActionAfterReload;
                this.myKirito.saveScriptStatus();
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
                this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                this.myKirito.saveScriptStatus();
                this.myKirito.unlock();
                return;
            }

            const oldLog = this.domHelper.getActionLog();
            const tempAction = this.myKirito.schedule.isEnable ? this.myKirito.schedule.current.content : this.myKirito.action;
            let checkCaptchaCount = 0;

            while (checkCaptchaCount < 20) {
                checkCaptchaCount++;
                // 按下該按的按鈕
                if (ACTION_NAME[tempAction] in this.domHelper.buttons && !(this.domHelper.buttons[ACTION_NAME[tempAction]].disabled)) {
                    this.domHelper.buttons[ACTION_NAME[tempAction]].click();
                    console.log(ACTION_NAME[tempAction]);
                    break;
                } else {
                    // 檢查驗證
                    if (this.domHelper.hasIframe() && ACTION_NAME[tempAction] in this.domHelper.buttons && this.domHelper.buttons[ACTION_NAME[tempAction]].disabled) {
                        this.myKirito.isActionWaitCaptcha = true;
                        this.myKirito.saveIsActionWaitCaptcha();
                        this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                        this.myKirito.saveScriptStatus();
                        this.myKirito.unlock();
                        return;
                    }
                }
                await sleep(500);
            }

            // 若按鈕為disable，且重試10次仍沒有出現驗證框，重新整理
            if (checkCaptchaCount >= 20) {
                this.myKirito.scriptStatus = SCRIPT_STATUS.ActionAfterReload;
                this.myKirito.saveScriptStatus();
                this.myKirito.unlock();
                location.reload();
            }

            // 檢查行動結果
            let checkResultCount = 0;
            while (checkResultCount < 20) {
                checkResultCount++
                const newLog = this.domHelper.getActionLog();
                if (newLog.length > oldLog.length && newLog[0].includes('行動成功')) {
                    console.log(newLog[0]);
                    this.myKirito.nextActionSecond = this.myKirito.actionCd + random(this.myKirito.randomDelay);
                    this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                    if (this.myKirito.schedule.isEnable) {
                        this.myKirito.schedule.next();
                        this.myKirito.saveSchedule();
                    }
                    this.myKirito.saveScriptStatus();
                    this.myKirito.unlock();
                    return;
                }
                await sleep(500);
            }

            // 若未出現應有的行動結果，重新整理
            this.myKirito.scriptStatus = SCRIPT_STATUS.ActionAfterReload;
            this.myKirito.saveScriptStatus();
            this.myKirito.unlock();
            location.reload();
        }
    }

    private async duel() {
        if (!(location.href.includes(`/profile/${this.myKirito.preyId}`))) {
            location.replace(`/profile/${this.myKirito.preyId}`);
        } else {
            this.myKirito.lock();
            this.myKirito.scriptStatus = SCRIPT_STATUS.Duel;

            // 檢查暱稱欄位
            const tempName = await this.domHelper.waitForText(
                this.myKirito.profileViewType === 'detail' || !this.myKirito.profileViewType ?
                    'table > tbody > tr:nth-child(1) > td:nth-child(2)' :
                    'div > table:nth-child(2) > tbody > tr:nth-child(4) > td'
            );
            // 若超過10秒仍未顯示對手暱稱，重新整理
            if (!tempName) {
                this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                this.myKirito.saveScriptStatus();
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
                this.myKirito.nextDuelSecond = 0;
                if (this.myKirito.schedule.isEnable) this.myKirito.schedule.isPause = true;
                this.myKirito.saveSchedule();
                this.myKirito.isDuelPause = true;
                this.myKirito.saveIsDuelPause();
                this.dashboard.updateDuelPauseButtonStyle();
                this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                this.myKirito.saveScriptStatus();
                this.myKirito.unlock();
                return;
            } else {
                this.myKirito.isPreyDead = false;
            }
            const cd = this.domHelper.getDuelCd();
            // 檢查是否在冷卻
            if (cd > 0) {
                this.myKirito.nextDuelSecond = cd + random(this.myKirito.randomDelay);
                this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                this.myKirito.saveScriptStatus();
                this.myKirito.unlock();
                return;
            }
            // 有OK可以按就按OK
            if (this.domHelper.buttons['OK']) {
                this.domHelper.buttons['OK'].click();
            }

            const oldLog = this.domHelper.getDuelLog();
            const tempDuel = this.myKirito.schedule.isEnable ? this.myKirito.schedule.current.content : this.myKirito.duel;
            let checkCaptchaCount = 0;
            let duelType = '';

            while (checkCaptchaCount < 20) {
                checkCaptchaCount++;
                if (DUEL_NAME[tempDuel] in this.domHelper.buttons && !(this.domHelper.buttons[DUEL_NAME[tempDuel]].disabled)) {
                    this.domHelper.buttons[DUEL_NAME[tempDuel]].click();
                    duelType = DUEL_NAME[tempDuel];
                    break;
                } else if (DUEL_NAME[2] in this.domHelper.buttons && !(this.domHelper.buttons[DUEL_NAME[2]].disabled)) {
                    this.domHelper.buttons[DUEL_NAME[2]].click();
                    duelType = DUEL_NAME[2];
                    break;
                } else {
                    // 檢查驗證
                    if (this.domHelper.hasIframe() && DUEL_NAME[1] in this.domHelper.buttons && this.domHelper.buttons[DUEL_NAME[1]].disabled) {
                        this.myKirito.isDuelWaitCaptcha = true;
                        this.myKirito.saveIsDuelWaitCaptcha();
                        this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                        this.myKirito.saveScriptStatus();
                        this.myKirito.unlock();
                        return;
                    }
                }
                await sleep(500);
            }

            // 若按鈕為disable，且重試20次仍沒有出現驗證框，重新整理
            if (checkCaptchaCount >= 20) {
                this.myKirito.scriptStatus = SCRIPT_STATUS.DuelAfterReload;
                this.myKirito.saveScriptStatus();
                this.myKirito.unlock();
                location.reload();
            }

            // 檢查對戰結果
            let checkResultCount = 0;
            while (checkResultCount < 20) {
                checkResultCount++
                const newLog = this.domHelper.getDuelLog();
                if (newLog.length > oldLog.length && newLog[0].includes(duelType)) {
                    console.log(newLog[0]);
                    this.myKirito.nextDuelSecond = this.myKirito.duelCd + random(this.myKirito.randomDelay) + (this.myKirito.duel == 4 ? this.myKirito.extraMercilesslyCd : 0);
                    this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                    if (this.myKirito.schedule.isEnable) {
                        this.myKirito.schedule.next();
                        this.myKirito.saveSchedule();
                    }
                    this.myKirito.saveScriptStatus();
                    this.myKirito.unlock();
                    return;
                }
                await sleep(500);
            }

            // 若未出現應有的對戰結果，重新整理
            this.myKirito.unlock();
            this.myKirito.scriptStatus = SCRIPT_STATUS.DuelAfterReload;
            this.myKirito.saveScriptStatus();
            location.reload();
        }
    }

    async endless() {

        await sleep(1000);
        this.endless();

        this.domHelper.loadButtons();

        const tempDead = document.querySelector('#root > div > div')
        if (!!tempDead && tempDead.textContent === '你的角色死亡了，請進行轉生') {
            this.myKirito.isDead = true;
        } else {
            this.myKirito.isDead = false;
        }

        this.myKirito.nextActionSecond = this.myKirito.nextActionSecond > 0 ? this.myKirito.nextActionSecond - 1 : 0;
        this.myKirito.nextDuelSecond = this.myKirito.nextDuelSecond > 0 ? this.myKirito.nextDuelSecond - 1 : 0;
        this.myKirito.saveTempSecond();
        this.myKirito.saveNextActionSecond();
        this.myKirito.saveNextDuelSecond();
        this.dashboard.updateDashboard();

        if (this.myKirito.isActionWaitCaptcha) {
            if (location.pathname === '/' && (ACTION_NAME[this.myKirito.action] in this.domHelper.buttons && !(this.domHelper.buttons[ACTION_NAME[this.myKirito.action]].disabled) || !this.domHelper.hasIframe())) {
                this.myKirito.isActionWaitCaptcha = false;
                this.myKirito.saveIsActionWaitCaptcha();
            }
        }

        if (this.myKirito.isDuelWaitCaptcha) {
            if (location.href.includes(`/profile/${this.myKirito.preyId}`) && (DUEL_NAME[1] in this.domHelper.buttons && !(this.domHelper.buttons[DUEL_NAME[1]].disabled) || !this.domHelper.hasIframe())) {
                this.myKirito.isDuelWaitCaptcha = false;
                this.myKirito.saveIsDuelWaitCaptcha();
            }
        }

        if ('領取獎勵' in this.domHelper.buttons && !(this.domHelper.buttons['領取獎勵'].disabled) && this.myKirito.isAutoReceiveAward) {
            this.domHelper.buttons['領取獎勵'].click();
            console.log('領取樓層獎勵');
            return;
        }

        if (!this.myKirito.isBusy) {

            if (
                this.myKirito.nextDuelSecond <= 0 &&
                !this.myKirito.isDuelPause &&
                !this.myKirito.isDuelWaitCaptcha &&
                !!this.myKirito.preyId &&
                !this.myKirito.schedule.isEnable || this.myKirito.schedule.isEnable && !this.myKirito.schedule.isDuelScheduleEnable
            ) {
                this.duel();
            } else if (
                this.myKirito.nextActionSecond <= 0 &&
                !this.myKirito.isActionPause &&
                !this.myKirito.isActionWaitCaptcha &&
                !this.myKirito.schedule.isEnable
            ) {
                this.action();
            }

            if (this.myKirito.schedule.isEnable && !this.myKirito.schedule.isPause) {
                if (this.myKirito.schedule.processQueue.length > 0) {
                    if (!this.myKirito.schedule.current) {
                        this.myKirito.schedule.next();
                    }
                    switch (this.myKirito.schedule.current.type) {
                        case ProcessType.Action:
                            if (
                                this.myKirito.nextActionSecond <= 0 &&
                                !this.myKirito.isActionWaitCaptcha
                            ) {
                                this.action();
                            }
                            break;
                        case ProcessType.Duel:
                            if (
                                this.myKirito.nextDuelSecond <= 0 &&
                                !this.myKirito.isDuelWaitCaptcha &&
                                !!this.myKirito.preyId
                            ) {
                                this.duel();
                            }
                            break;
                    }
                } else {
                    this.myKirito.schedule.reset();
                }
            }
        } else {
            switch (this.myKirito.scriptStatus) {
                case SCRIPT_STATUS.ActionAfterReload:
                    this.myKirito.scriptStatus = SCRIPT_STATUS.Action;
                    this.action();
                    break;
                case SCRIPT_STATUS.DuelAfterReload:
                    this.myKirito.scriptStatus = SCRIPT_STATUS.Duel;
                    this.duel();
                    break;
                case SCRIPT_STATUS.Normal:
                    this.myKirito.unlock();
                    break;
            }
        }
    }
}