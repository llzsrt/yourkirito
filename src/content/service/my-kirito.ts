import { SCRIPT_STATUS } from '../constant';
import { getNowSecond } from '../function/utils';
import { getProfile } from '../function/api';

export class MyKirito {
    preyId = '';
    preyName = '';
    duel = 1;
    action = 5;
    randomDelay = 25;
    nextActionSecond = 0;
    nextDuelSecond = 0;
    duelReloadCount = 0;
    isBusy = false;
    isDead = false;
    isPreyDead = false;
    isActionPause = true;
    isDuelPause = true;
    isActionWaitCaptcha = false;
    isDuelWaitCaptcha = false;
    isAutoReceiveAward = false;
    actionCd = 80;
    duelCd = 200;
    extraMercilesslyCd = 0;
    token = null;
    profileViewType = '';
    scriptStatus = SCRIPT_STATUS.Normal;

    profile = null;

    localStoragePrefix = 'your';

    constructor() {
        const tempSecond = this.getTempSecond();
        this.loadNextActionSecond(tempSecond);
        this.loadNextDuelSecond(tempSecond);
        this.loadDefaultAction();
        this.loadDefaultDuel();
        this.loadIsActionPause();
        this.loadIsBusy();
        this.loadIsBusy();
        this.loadIsDuelPause();
        this.loadDuelReloadCount();
        this.loadPreyId();
        this.loadPreyName();
        this.loadRandomDelay();
        this.loadActionCd();
        this.loadDuelCd();
        this.loadToken();
        this.loadProfileViewType();
        this.loadScriptStatus();
        this.loadIsActionWaitCaptcha();
        this.loadIsDuelWaitCaptcha();
        this.loadIsAutoReceiveAward();
    }

    saveIsAutoReceiveAward() {
        localStorage.setItem(`${this.localStoragePrefix}IsAutoReceiveAward`, this.isAutoReceiveAward.toString());
    }

    loadIsAutoReceiveAward() {
        this.isAutoReceiveAward = localStorage.getItem(`${this.localStoragePrefix}IsAutoReceiveAward`) === 'true';
    }

    saveIsActionWaitCaptcha() {
        localStorage.setItem(`${this.localStoragePrefix}IsActionWaitCaptcha`, this.isActionWaitCaptcha.toString());
    }

    loadIsActionWaitCaptcha() {
        this.isActionWaitCaptcha = localStorage.getItem(`${this.localStoragePrefix}IsActionWaitCaptcha`) === 'true';
    }

    saveIsDuelWaitCaptcha() {
        localStorage.setItem(`${this.localStoragePrefix}IsDuelWaitCaptcha`, this.isDuelWaitCaptcha.toString());
    }

    loadIsDuelWaitCaptcha() {
        this.isDuelWaitCaptcha = localStorage.getItem(`${this.localStoragePrefix}IsDuelWaitCaptcha`) === 'true';
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

    loadToken() {
        const token = localStorage.getItem('token');
        if (!!token) {
            this.token = token;
        }
    }

    saveDuelCd() {
        localStorage.setItem(`${this.localStoragePrefix}DuelCd`, this.duelCd.toString());
    }

    loadDuelCd() {
        const scriptDuelCd = localStorage.getItem(`${this.localStoragePrefix}DuelCd`);
        if (!!scriptDuelCd) {
            this.duelCd = parseInt(scriptDuelCd);
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

    saveIsDuelPause() {
        localStorage.setItem(`${this.localStoragePrefix}IsDuelPause`, this.isDuelPause.toString());
    }

    loadIsDuelPause() {
        const scriptIsDuelPause = localStorage.getItem(`${this.localStoragePrefix}IsDuelPause`);
        if (!!scriptIsDuelPause) {
            this.isDuelPause = scriptIsDuelPause === 'true';
        }
    }

    saveDuelReloadCount() {
        localStorage.setItem(`${this.localStoragePrefix}duelReloadCount`, this.duelReloadCount.toString());
    }

    loadDuelReloadCount() {
        const scriptduelReloadCount = localStorage.getItem(`${this.localStoragePrefix}duelReloadCount`);
        if (!!scriptduelReloadCount) {
            this.duelReloadCount = parseInt(scriptduelReloadCount);
        }
    }

    lock() {
        this.isBusy = true;
        localStorage.setItem(`${this.localStoragePrefix}IsBusy`, 'true');
    }

    unlock() {
        this.isBusy = false;
        localStorage.setItem(`${this.localStoragePrefix}IsBusy`, 'false');
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

    saveNextDuelSecond() {
        localStorage.setItem(`${this.localStoragePrefix}NextDuelSecond`, this.nextDuelSecond.toString());
    }

    loadNextDuelSecond(tempSecond) {
        const scriptNextDuelSecond = localStorage.getItem(`${this.localStoragePrefix}NextDuelSecond`);
        this.nextDuelSecond = parseInt(scriptNextDuelSecond ? scriptNextDuelSecond : '0') + parseInt(tempSecond ? tempSecond : 0) - getNowSecond();
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

    async syncProfile() {
        this.loadToken();
        if (!!this.token) {
            const profile = await getProfile(this.token);
            this.profile = profile;
            return true;
        }
        throw 'Missing token';
    }
}