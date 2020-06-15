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
    isActionPause = false;
    isHuntPause = true;
    isActionWaitCaptcha = false;
    isHuntWaitCaptcha = false;
    isAutoReceiveAward = false;
    actionCd = 100;
    huntCd = 200;
    extraMercilesslyCd = 0;
    token = '';
    profileViewType = '';
    scriptStatus = SCRIPT_STATUS.Normal;

    profileAvatar = '';
    profileName = '';


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
        this.loadProfileName();
        this.loadProfileAvatar();
        this.loadIsAutoReceiveAward();
    }

    saveIsAutoReceiveAward() {
        localStorage.setItem('scriptIsAutoReceiveAward', this.isAutoReceiveAward.toString());
    }

    loadIsAutoReceiveAward() {
        this.isAutoReceiveAward = localStorage.getItem('scriptIsAutoReceiveAward') === 'true';
    }

    saveProfileName() {
        localStorage.setItem('scriptProfileName', this.profileName);
    }

    loadProfileName() {
        this.profileName = localStorage.getItem('scriptProfileName');
    }

    saveProfileAvatar() {
        localStorage.setItem('scriptProfileAvatar', this.profileAvatar);
    }

    loadProfileAvatar() {
        this.profileAvatar = localStorage.getItem('scriptProfileAvatar');
    }

    saveIsActionWaitCaptcha() {
        localStorage.setItem('scriptIsActionWaitCaptcha', this.isActionWaitCaptcha.toString());
    }

    loadIsActionWaitCaptcha() {
        this.isActionWaitCaptcha = localStorage.getItem('scriptIsActionWaitCaptcha') === 'true';
    }

    saveIsHuntWaitCaptcha() {
        localStorage.setItem('scriptIsHuntWaitCaptcha', this.isHuntWaitCaptcha.toString());
    }

    loadIsHuntWaitCaptcha() {
        this.isHuntWaitCaptcha = localStorage.getItem('scriptIsHuntWaitCaptcha') === 'true';
    }

    saveScriptStatus() {
        localStorage.setItem('scriptStatus', this.scriptStatus.toString());
    }

    loadScriptStatus() {
        const scriptStatus = localStorage.getItem('scriptStatus');
        this.scriptStatus = parseInt(scriptStatus ? scriptStatus : '0');
    }

    loadProfileViewType() {
        this.profileViewType = localStorage.getItem('profileViewType');
    }

    loadToken() {
        this.token = localStorage.getItem('token');
    }

    saveHuntCd() {
        localStorage.setItem('scriptHuntCd', this.huntCd.toString());
    }

    loadHuntCd() {
        const scriptHuntCd = localStorage.getItem('scriptHuntCd');
        this.huntCd = parseInt(scriptHuntCd ? scriptHuntCd : '200');
    }

    saveActionCd() {
        localStorage.setItem('scriptActionCd', this.actionCd.toString());
    }

    loadActionCd() {
        const scriptActionCd = localStorage.getItem('scriptActionCd');
        this.actionCd = parseInt(scriptActionCd ? scriptActionCd : '100');
    }

    saveRandomDelay() {
        localStorage.setItem('scriptRandomDelay', this.randomDelay.toString());
    }

    loadRandomDelay() {
        const scriptRandomDelay = localStorage.getItem('scriptRandomDelay');
        this.randomDelay = parseInt(scriptRandomDelay ? scriptRandomDelay : '25');
    }

    savePreyId() {
        localStorage.setItem('scriptPreyId', this.preyId);
    }

    loadPreyId() {
        this.preyId = localStorage.getItem('scriptPreyId');
    }

    savePreyName() {
        localStorage.setItem('scriptPreyName', this.preyName);
    }

    loadPreyName() {
        this.preyName = localStorage.getItem('scriptPreyName');
    }

    saveIsHuntPause() {
        localStorage.setItem('scriptIsHuntPause', this.isHuntPause.toString());
    }

    loadIsHuntPause() {
        this.isHuntPause = localStorage.getItem('scriptIsHuntPause') === 'true';
    }

    saveHuntReloadCount() {
        localStorage.setItem('scripthuntReloadCount', this.huntReloadCount.toString());
    }

    loadHuntReloadCount() {
        const scripthuntReloadCount = localStorage.getItem('scripthuntReloadCount');
        this.huntReloadCount = parseInt(scripthuntReloadCount ? scripthuntReloadCount : '0');
    }

    lock() {
        this.isBusy = true;
        localStorage.setItem('scriptIsBusy', 'true');
    }

    unlock() {
        this.isBusy = false;
        localStorage.setItem('scriptIsBusy', 'false');
        this.scriptStatus = SCRIPT_STATUS.Normal;
        this.saveScriptStatus();
    }

    loadIsBusy() {
        this.isBusy = localStorage.getItem('scriptIsBusy') === 'true';
    }

    saveIsActionPause() {
        localStorage.setItem('scriptIsActionPause', this.isActionPause.toString());
    }

    loadIsActionPause() {
        this.isActionPause = localStorage.getItem('scriptIsActionPause') === 'true';
    }

    saveNextHuntSecond() {
        localStorage.setItem('scriptNextHuntSecond', this.nextHuntSecond.toString());
    }

    loadNextHuntSecond(tempSecond) {
        const scriptNextHuntSecond = localStorage.getItem('scriptNextHuntSecond');
        this.nextHuntSecond = parseInt(scriptNextHuntSecond ? scriptNextHuntSecond : '0') + parseInt(tempSecond ? tempSecond : 0) - getNowSecond();
    }

    saveNextActionSecond() {
        localStorage.setItem('scriptNextActionSecond', this.nextActionSecond.toString());
    }

    loadNextActionSecond(tempSecond) {
        const scriptNextActionSecond = localStorage.getItem('scriptNextActionSecond');
        this.nextActionSecond = parseInt(scriptNextActionSecond ? scriptNextActionSecond : '0') + parseInt(tempSecond ? tempSecond : 0) - getNowSecond();
    }

    saveTempSecond() {
        localStorage.setItem('scriptTempSecond', getNowSecond().toString());
    }

    getTempSecond() {
        return localStorage.getItem('scriptTempSecond');
    }

    saveDefaultDuel() {
        localStorage.setItem('scriptDuel', this.duel.toString());
    }

    loadDefaultDuel() {
        const tempDuel = parseInt(localStorage.getItem('scriptDuel'));
        this.duel = !!tempDuel ? tempDuel : 1;
    }

    saveDefaultAction() {
        localStorage.setItem('scriptAction', this.action.toString());
    }

    loadDefaultAction() {
        const action = parseInt(localStorage.getItem('scriptAction'));
        this.action = !!action ? action : 5;
    }

    syncTimer() {
        const scriptTempSecond = localStorage.getItem('scriptTempSecond');
        const scriptNextActionSecond = localStorage.getItem('scriptNextActionSecond');
        const scriptNextHuntSecond = localStorage.getItem('scriptNextHuntSecond');
        this.nextActionSecond = parseInt(scriptNextActionSecond ? scriptNextActionSecond : '0') + parseInt(scriptTempSecond ? scriptTempSecond : '0') - getNowSecond();
        this.nextHuntSecond = parseInt(scriptNextHuntSecond ? scriptNextHuntSecond : '0') + parseInt(scriptTempSecond ? scriptTempSecond : '0') - getNowSecond();
    }
}