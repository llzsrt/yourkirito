import { Process, Schedule } from '../schedule';
import { FIND_STATUS } from './../constant';
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
    findStatus = FIND_STATUS.Normal;

    isAutoReincarnation = false;
    reincarnationCharacter = '';

    schedule = new Schedule();
    doNotStopSchedule = false;
    onlyDuelWithRed = false;

    profile = null;
    setFoundUserAsPrey = false;

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
        this.loadSchedule();
        this.loadDoNotStopSchedule();
        this.loadOnlyDuelWithRed();
    }

    saveOnlyDuelWithRed() {
        localStorage.setItem(`${this.localStoragePrefix}OnlyDuelWithRed`, this.onlyDuelWithRed.toString());
    }

    loadOnlyDuelWithRed() {
        this.onlyDuelWithRed = localStorage.getItem(`${this.localStoragePrefix}OnlyDuelWithRed`) === 'true';
    }

    saveDoNotStopSchedule() {
        localStorage.setItem(`${this.localStoragePrefix}DoNotStopSchedule`, this.doNotStopSchedule.toString());
    }

    loadDoNotStopSchedule() {
        this.doNotStopSchedule = localStorage.getItem(`${this.localStoragePrefix}DoNotStopSchedule`) === 'true';
    }

    saveSchedule() {
        localStorage.setItem(`${this.localStoragePrefix}Schedule`, JSON.stringify(this.schedule));
    }
    
    loadSchedule() {
        const tempSchedule: Partial<Schedule> = JSON.parse(localStorage.getItem(`${this.localStoragePrefix}Schedule`));
        this.schedule = new Schedule(tempSchedule);
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
        const tempDuelCd = localStorage.getItem(`${this.localStoragePrefix}DuelCd`);
        if (!!tempDuelCd) {
            this.duelCd = parseInt(tempDuelCd);
        }
    }

    saveActionCd() {
        localStorage.setItem(`${this.localStoragePrefix}ActionCd`, this.actionCd.toString());
    }

    loadActionCd() {
        const tempActionCd = localStorage.getItem(`${this.localStoragePrefix}ActionCd`);
        if (!!tempActionCd) {
            this.actionCd = parseInt(tempActionCd);
        }
    }

    saveRandomDelay() {
        localStorage.setItem(`${this.localStoragePrefix}RandomDelay`, this.randomDelay.toString());
    }

    loadRandomDelay() {
        const tempRandomDelay = localStorage.getItem(`${this.localStoragePrefix}RandomDelay`);
        if (!!tempRandomDelay) {
            this.randomDelay = parseInt(tempRandomDelay);
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
        const tempIsDuelPause = localStorage.getItem(`${this.localStoragePrefix}IsDuelPause`);
        if (!!tempIsDuelPause) {
            this.isDuelPause = tempIsDuelPause === 'true';
        }
    }

    saveDuelReloadCount() {
        localStorage.setItem(`${this.localStoragePrefix}duelReloadCount`, this.duelReloadCount.toString());
    }

    loadDuelReloadCount() {
        const tempduelReloadCount = localStorage.getItem(`${this.localStoragePrefix}duelReloadCount`);
        if (!!tempduelReloadCount) {
            this.duelReloadCount = parseInt(tempduelReloadCount);
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
        const tempIsActionPause = localStorage.getItem(`${this.localStoragePrefix}IsActionPause`);
        if (!!tempIsActionPause) {
            this.isActionPause = tempIsActionPause === 'true';
        }
    }

    saveNextDuelSecond() {
        localStorage.setItem(`${this.localStoragePrefix}NextDuelSecond`, this.nextDuelSecond.toString());
    }

    loadNextDuelSecond(tempSecond) {
        const tempNextDuelSecond = localStorage.getItem(`${this.localStoragePrefix}NextDuelSecond`);
        this.nextDuelSecond = parseInt(tempNextDuelSecond ? tempNextDuelSecond : '0') + parseInt(tempSecond ? tempSecond : 0) - getNowSecond();
    }

    saveNextActionSecond() {
        localStorage.setItem(`${this.localStoragePrefix}NextActionSecond`, this.nextActionSecond.toString());
    }

    loadNextActionSecond(tempSecond) {
        const tempNextActionSecond = localStorage.getItem(`${this.localStoragePrefix}NextActionSecond`);
        this.nextActionSecond = parseInt(tempNextActionSecond ? tempNextActionSecond : '0') + parseInt(tempSecond ? tempSecond : 0) - getNowSecond();
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
        const tempDuel = localStorage.getItem(`${this.localStoragePrefix}Duel`);
        if (!!tempDuel) {
            this.duel = parseInt(tempDuel);
        }
    }

    saveDefaultAction() {
        localStorage.setItem(`${this.localStoragePrefix}Action`, this.action.toString());
    }

    loadDefaultAction() {
        const tempAction = localStorage.getItem(`${this.localStoragePrefix}Action`);
        if (!!tempAction) {
            this.action = parseInt(tempAction);
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