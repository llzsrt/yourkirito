export class MyKirito {
    isDead = false;
    preyId = '';
    preyName = '';
    duel = 1;
    action = 5;
    randomDelay = 25;
    nextActionSecond = 0;
    nextHuntSecond = 0;
    huntCount = 0;
    isHunterMode = false;
    isBusy = false;
    isDoingSomething = false;
    isPause = false;
    extraCd = 0;


    constructor() {
        const tempSecond = this.getTempSecond();
        this.loadNextActionSecond(tempSecond);
        this.loadNextHuntSecond(tempSecond);
        this.loadDefaultAction();
        this.loadDefaultDuel();
        this.loadIsPause();
        this.loadIsBusy();
        this.loadIsBusy();
        this.loadIsHuntMode();
        this.loadHuntCount();
        this.loadPreyId();
        this.loadPreyName();
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

    saveIsHuntMode() {
        localStorage.setItem('scriptIsHunterMode', this.isHunterMode)
    }

    loadIsHuntMode() {
        this.isHunterMode = localStorage.getItem('scriptIsHunterMode') === 'true';
    }

    saveHuntCount() {
        localStorage.setItem('scriptHuntCount', this.huntCount);
    }

    loadHuntCount() {
        const scriptHuntCount = localStorage.getItem('scriptHuntCount');
        this.huntCount = parseInt(scriptHuntCount ? scriptHuntCount : 0);
    }

    lock() {
        this.isBusy = true;
        localStorage.setItem('scriptIsBusy', 'true');
    }

    unlock() {
        this.isBusy = false;
        localStorage.setItem('scriptIsBusy', 'false');
    }

    loadIsBusy() {
        this.isBusy = localStorage.getItem('scriptIsBusy') === 'true';
    }

    saveIsPause() {
        localStorage.setItem('scriptIsPause', this.isPause);
    }

    loadIsPause() {
        this.isPause = localStorage.getItem('scriptIsPause') === 'true';
    }

    saveNextHuntSecond() {
        localStorage.setItem('scriptNextHuntSecond', this.nextHuntSecond);
    }

    loadNextHuntSecond(tempSecond) {
        const scriptNextHuntSecond = localStorage.getItem('scriptNextHuntSecond');
        this.nextHuntSecond = parseInt(scriptNextHuntSecond ? scriptNextHuntSecond : 0) + parseInt(tempSecond ? tempSecond : 0) - parseInt(+(new Date()) / 1000);
    }

    saveNextActionSecond() {
        localStorage.setItem('scriptNextActionSecond', this.nextActionSecond);
    }

    loadNextActionSecond(tempSecond) {
        const scriptNextActionSecond = localStorage.getItem('scriptNextActionSecond');
        this.nextActionSecond = parseInt(scriptNextActionSecond ? scriptNextActionSecond : 0) + parseInt(tempSecond ? tempSecond : 0) - parseInt(+(new Date()) / 1000);
    }

    saveTempSecond() {
        localStorage.setItem('scriptTempSecond', parseInt(+(new Date()) / 1000));
    }

    getTempSecond() {
        return localStorage.getItem('scriptTempSecond');
    }

    saveDefaultAction() {
        localStorage.setItem('scriptDuel', this.duel);
    }

    loadDefaultDuel() {
        const tempDuel = parseInt(localStorage.getItem('scriptDuel'));
        this.duel = !!tempDuel ? tempDuel : 1;
    }

    saveDefaultAction() {
        localStorage.setItem('scriptAction', this.action);
    }

    loadDefaultAction() {
        const action = parseInt(localStorage.getItem('scriptAction'));
        this.action = !!action ? action : 5;
    }

    syncTimer() {
        const scriptTempSecond = localStorage.getItem('scriptTempSecond');
        const scriptNextActionSecond = localStorage.getItem('scriptNextActionSecond');
        const scriptNextHuntSecond = localStorage.getItem('scriptNextHuntSecond');
        this.nextActionSecond = parseInt(scriptNextActionSecond ? scriptNextActionSecond : 0) + parseInt(scriptTempSecond ? scriptTempSecond : 0) - parseInt(+(new Date()) / 1000);
        this.nextHuntSecond = parseInt(scriptNextHuntSecond ? scriptNextHuntSecond : 0) + parseInt(scriptTempSecond ? scriptTempSecond : 0) - parseInt(+(new Date()) / 1000);
    }
}