import { SCRIPT_STATUS } from './constant';
import { getNowSecond } from './utils';

export class MyKirito {
    preyId = '';
    preyName = '';
    duel = 1;
    action = 5;
    randomDelay = 25;
    nextActionSecond = 0;
    nextHuntSecond = 0;
    huntReloadCount = 0;
    isBusy = false;
    isDead = false;
    isPreyDead = false;
    isActionPause = true;
    isHuntPause = true;
    isActionWaitCaptcha = false;
    isHuntWaitCaptcha = false;
    isAutoReceiveAward = false;
    actionCd = 80;
    huntCd = 200;
    extraMercilesslyCd = 0;
    token = null;
    profileViewType = '';
    scriptStatus = SCRIPT_STATUS.Normal;

    profile = null;

    localStoragePrefix = 'your';


    constructor() {
        const tempSecond = this.getTempSecond();
        this.loadNextActionSecond(tempSecond);
        this.loadNextHuntSecond(tempSecond);
        this.loadDefaultAction();
        this.loadDefaultDuel();
        this.loadIsActionPause();
        this.loadIsBusy();
        this.loadIsBusy();
        this.loadIsHuntPause();
        this.loadHuntReloadCount();
        this.loadPreyId();
        this.loadPreyName();
        this.loadRandomDelay();
        this.loadActionCd();
        this.loadHuntCd();
        this.loadToken();
        this.loadProfileViewType();
        this.loadScriptStatus();
        this.loadIsActionWaitCaptcha();
        this.loadIsHuntWaitCaptcha();
        this.loadProfile();
        this.loadIsAutoReceiveAward();
    }

    saveIsAutoReceiveAward() {
        localStorage.setItem(`${this.localStoragePrefix}IsAutoReceiveAward`, this.isAutoReceiveAward.toString());
    }

    loadIsAutoReceiveAward() {
        this.isAutoReceiveAward = localStorage.getItem(`${this.localStoragePrefix}IsAutoReceiveAward`) === 'true';
    }

    saveProfile() {
        localStorage.setItem(`${this.localStoragePrefix}Profile`, JSON.stringify(this.profile));
    }

    loadProfile() {
        const scriptProfile = localStorage.getItem(`${this.localStoragePrefix}Profile`);
        if (!!scriptProfile) {
            this.profile = JSON.parse(scriptProfile);
        }
        localStorage.removeItem(`${this.localStoragePrefix}Profile`);
    }

    saveIsActionWaitCaptcha() {
        localStorage.setItem(`${this.localStoragePrefix}IsActionWaitCaptcha`, this.isActionWaitCaptcha.toString());
    }

    loadIsActionWaitCaptcha() {
        this.isActionWaitCaptcha = localStorage.getItem(`${this.localStoragePrefix}IsActionWaitCaptcha`) === 'true';
    }

    saveIsHuntWaitCaptcha() {
        localStorage.setItem(`${this.localStoragePrefix}IsHuntWaitCaptcha`, this.isHuntWaitCaptcha.toString());
    }

    loadIsHuntWaitCaptcha() {
        this.isHuntWaitCaptcha = localStorage.getItem(`${this.localStoragePrefix}IsHuntWaitCaptcha`) === 'true';
    }

    saveScriptStatus() {
        localStorage.setItem(`${this.localStoragePrefix}Status`, this.scriptStatus.toString());
    }

    loadScriptStatus() {
        const scriptStatus = localStorage.getItem(`${this.localStoragePrefix}Status`);
        if (!!scriptStatus) {
            this.scriptStatus = parseInt(scriptStatus);
        }
    }

    loadProfileViewType() {
        this.profileViewType = localStorage.getItem('profileViewType');
    }

    saveTempToken() {
        localStorage.setItem('tempToken', this.token);
    }

    loadToken() {
        const token = localStorage.getItem('token');
        const tempToken = localStorage.getItem('tempToken');
        if (!!token) {
            this.token = token;
        } else if (!!tempToken) {
            this.token = tempToken;
            localStorage.removeItem('tempToken');
        }
    }

    saveHuntCd() {
        localStorage.setItem(`${this.localStoragePrefix}HuntCd`, this.huntCd.toString());
    }

    loadHuntCd() {
        const scriptHuntCd = localStorage.getItem(`${this.localStoragePrefix}HuntCd`);
        if (!!scriptHuntCd) {
            this.huntCd = parseInt(scriptHuntCd);
        }
    }

    saveActionCd() {
        localStorage.setItem(`${this.localStoragePrefix}ActionCd`, this.actionCd.toString());
    }

    loadActionCd() {
        const scriptActionCd = localStorage.getItem(`${this.localStoragePrefix}ActionCd`);
        if (!!scriptActionCd) {
            this.actionCd = parseInt(scriptActionCd);
        }
    }

    saveRandomDelay() {
        localStorage.setItem(`${this.localStoragePrefix}RandomDelay`, this.randomDelay.toString());
    }

    loadRandomDelay() {
        const scriptRandomDelay = localStorage.getItem(`${this.localStoragePrefix}RandomDelay`);
        if (!!scriptRandomDelay) {
            this.randomDelay = parseInt(scriptRandomDelay);
        }
    }

    savePreyId() {
        localStorage.setItem(`${this.localStoragePrefix}PreyId`, this.preyId);
    }

    loadPreyId() {
        this.preyId = localStorage.getItem(`${this.localStoragePrefix}PreyId`);
    }

    savePreyName() {
        localStorage.setItem(`${this.localStoragePrefix}PreyName`, this.preyName);
    }

    loadPreyName() {
        this.preyName = localStorage.getItem(`${this.localStoragePrefix}PreyName`);
    }

    saveIsHuntPause() {
        localStorage.setItem(`${this.localStoragePrefix}IsHuntPause`, this.isHuntPause.toString());
    }

    loadIsHuntPause() {
        const scriptIsHuntPause = localStorage.getItem(`${this.localStoragePrefix}IsHuntPause`);
        if (!!scriptIsHuntPause) {
            this.isHuntPause = scriptIsHuntPause === 'true';
        }
    }

    saveHuntReloadCount() {
        localStorage.setItem(`${this.localStoragePrefix}huntReloadCount`, this.huntReloadCount.toString());
    }

    loadHuntReloadCount() {
        const scripthuntReloadCount = localStorage.getItem(`${this.localStoragePrefix}huntReloadCount`);
        if (!!scripthuntReloadCount) {
            this.huntReloadCount = parseInt(scripthuntReloadCount);
        }
    }

    lock() {
        this.isBusy = true;
        localStorage.setItem(`${this.localStoragePrefix}IsBusy`, 'true');
    }

    unlock() {
        this.isBusy = false;
        localStorage.setItem(`${this.localStoragePrefix}IsBusy`, 'false');
        this.scriptStatus = SCRIPT_STATUS.Normal;
        this.saveScriptStatus();
    }

    loadIsBusy() {
        this.isBusy = localStorage.getItem(`${this.localStoragePrefix}IsBusy`) === 'true';
    }

    saveIsActionPause() {
        localStorage.setItem(`${this.localStoragePrefix}IsActionPause`, this.isActionPause.toString());
    }

    loadIsActionPause() {
        const scriptIsActionPause = localStorage.getItem(`${this.localStoragePrefix}IsActionPause`);
        if (!!scriptIsActionPause) {
            this.isActionPause = scriptIsActionPause === 'true';
        }
    }

    saveNextHuntSecond() {
        localStorage.setItem(`${this.localStoragePrefix}NextHuntSecond`, this.nextHuntSecond.toString());
    }

    loadNextHuntSecond(tempSecond) {
        const scriptNextHuntSecond = localStorage.getItem(`${this.localStoragePrefix}NextHuntSecond`);
        this.nextHuntSecond = parseInt(scriptNextHuntSecond ? scriptNextHuntSecond : '0') + parseInt(tempSecond ? tempSecond : 0) - getNowSecond();
    }

    saveNextActionSecond() {
        localStorage.setItem(`${this.localStoragePrefix}NextActionSecond`, this.nextActionSecond.toString());
    }

    loadNextActionSecond(tempSecond) {
        const scriptNextActionSecond = localStorage.getItem(`${this.localStoragePrefix}NextActionSecond`);
        this.nextActionSecond = parseInt(scriptNextActionSecond ? scriptNextActionSecond : '0') + parseInt(tempSecond ? tempSecond : 0) - getNowSecond();
    }

    saveTempSecond() {
        localStorage.setItem(`${this.localStoragePrefix}TempSecond`, getNowSecond().toString());
    }

    getTempSecond() {
        return localStorage.getItem(`${this.localStoragePrefix}TempSecond`);
    }

    saveDefaultDuel() {
        localStorage.setItem(`${this.localStoragePrefix}Duel`, this.duel.toString());
    }

    loadDefaultDuel() {
        const scriptDuel = localStorage.getItem(`${this.localStoragePrefix}Duel`);
        if (!!scriptDuel) {
            this.duel = parseInt(scriptDuel);
        }
    }

    saveDefaultAction() {
        localStorage.setItem(`${this.localStoragePrefix}Action`, this.action.toString());
    }

    loadDefaultAction() {
        const scriptAction = localStorage.getItem(`${this.localStoragePrefix}Action`);
        if (!!scriptAction) {
            this.action = parseInt(scriptAction);
        }
    }

    syncTimer() {
        const scriptTempSecond = localStorage.getItem(`${this.localStoragePrefix}TempSecond`);
        const scriptNextActionSecond = localStorage.getItem(`${this.localStoragePrefix}NextActionSecond`);
        const scriptNextHuntSecond = localStorage.getItem(`${this.localStoragePrefix}NextHuntSecond`);
        this.nextActionSecond = parseInt(scriptNextActionSecond ? scriptNextActionSecond : '0') + parseInt(scriptTempSecond ? scriptTempSecond : '0') - getNowSecond();
        this.nextHuntSecond = parseInt(scriptNextHuntSecond ? scriptNextHuntSecond : '0') + parseInt(scriptTempSecond ? scriptTempSecond : '0') - getNowSecond();
    }
}