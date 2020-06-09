import { MyKirito } from './mykirito.js';
import { DomHelper } from './domhelper.js';
import { sleep, random } from './utils.js';
import { ACTION_NAME, DUEL_NAME } from './constant.js';

export function main() {
    const myKirito = new MyKirito();
    const domHelper = new DomHelper(myKirito);
    endless(myKirito, domHelper);
}

function action(mykirito, domHelper) {
    setTimeout(async () => {
        domHelper.loadButtons();
        if (domHelper.buttons['OK']) {
            domHelper.buttons['OK'].click();
        }

        if ('領取獎勵' in domHelper.buttons && !(domHelper.buttons['領取獎勵'].disabled)) {
            await sleep(500);
            domHelper.buttons['領取獎勵'].click();
            console.log('領取樓層獎勵');
        }

        if (ACTION_NAME[mykirito.action] in domHelper.buttons && !(domHelper.buttons[ACTION_NAME[mykirito.action]].disabled)) {
            await sleep(500);
            domHelper.buttons[ACTION_NAME[mykirito.action]].click();
            console.log(ACTION_NAME[mykirito.action]);
        }
        mykirito.nextActionSecond = mykirito.actionCd + random(mykirito.randomDelay);
        mykirito.unlock();
    }, 500);
}

function hunt(mykirito, domHelper) {
    setTimeout(async () => {
        if (mykirito.huntCount > 180) {
            mykirito.nextHuntSecond = mykirito.huntCd + random(mykirito.randomDelay) + (mykirito.duel == 4 ? mykirito.extraHuntCd : 0);
            mykirito.unlock();
            return;
        }
        const tempName1 = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
        const tempName2 = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > div > table:nth-child(2) > tbody > tr:nth-child(4) > td');
        if ((!tempName1 || tempName1.textContent === '') && (!tempName2 || tempName2.textContent === '')) {
            await sleep(100);
            mykirito.huntCount++;
            hunt(mykirito, domHelper);
            return;
        }
        domHelper.loadButtons();

        if (DUEL_NAME[mykirito.duel] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[mykirito.duel]].disabled)) {
            domHelper.buttons[DUEL_NAME[mykirito.duel]].click();
        }
        else if (DUEL_NAME[2] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[2]].disabled)) {
            domHelper.buttons[DUEL_NAME[2]].click();
        } else {
            mykirito.nextHuntSecond = mykirito.huntCd + random(mykirito.randomDelay) + (mykirito.duel == 4 ? mykirito.extraHuntCd : 0);
            mykirito.unlock();
            return;
        }

        await sleep(1000);

        const tempResult = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(3) > div > div');
        if (!!tempResult && (tempResult.textContent.includes(DUEL_NAME[4]) || tempResult.textContent.includes(DUEL_NAME[3]) || tempResult.textContent.includes(DUEL_NAME[2]) || tempResult.textContent.includes(DUEL_NAME[1]))) {
            console.log(tempResult.textContent);
            mykirito.nextHuntSecond = mykirito.huntCd + random(mykirito.randomDelay) + (mykirito.duel == 4 ? mykirito.extraHuntCd : 0);
            mykirito.unlock();
        } else {
            mykirito.huntCount += 20;
            mykirito.saveHuntCount();
            mykirito.unlock();
            location.reload();
        }
        mykirito.huntCount = 0;
        mykirito.saveHuntCount();
    }, 500);
}

function endless(myKirito, domHelper) {
    setTimeout(async () => {
        if (document.querySelector('div > iframe')) {
            if (myKirito.isHunterMode || !(location.href.includes(`/profile/${myKirito.preyId}`))) {
                myKirito.nextActionSecond = 0;
                waitCaptcha(myKirito, domHelper);
                return;
            }
        }

        endless(myKirito, domHelper);

        if ('領取獎勵' in domHelper.buttons && !(domHelper.buttons['領取獎勵'].disabled)) {
            await sleep(500);
            domHelper.buttons['領取獎勵'].click();
            console.log('領取樓層獎勵');
        }

        const tempDead = document.querySelector('#root > div > div')
        if (!!tempDead && tempDead.textContent === '你的角色死亡了，請進行轉生') {
            myKirito.dead = true;
        } else {
            myKirito.dead = false;
        }

        if (!myKirito.isBusy) {

            if (myKirito.nextHuntSecond <= 0 && myKirito.isHunterMode && !!myKirito.preyId && myKirito.preyId !== 'null' && myKirito.preyId !== '') {
                if (!(location.href.includes(`/profile/${myKirito.preyId}`))) {
                    location.replace(`/profile/${myKirito.preyId}`);
                } else {
                    myKirito.lock();
                    hunt(myKirito, domHelper);
                }
            }
            else if (myKirito.nextActionSecond <= 0 && !myKirito.isPause) {
                if (!(domHelper.links['我的桐人'].className.includes('active'))) {
                    domHelper.links['我的桐人'].click();
                }
                myKirito.lock();
                action(myKirito, domHelper);
            }
        }

        if (!myKirito.dead) {
            myKirito.nextActionSecond = myKirito.nextActionSecond > 0 ? myKirito.nextActionSecond - 1 : 0;
            myKirito.nextHuntSecond = myKirito.nextHuntSecond > 0 ? myKirito.nextHuntSecond - 1 : 0;

            if (!myKirito.isPause) {
                if (myKirito.nextActionSecond > 0) {
                    domHelper.messageBlock.textContent = `${myKirito.nextActionSecond} 秒後${ACTION_NAME[myKirito.action]}`;
                } else {
                    domHelper.messageBlock.textContent = `正在${ACTION_NAME[myKirito.action]}`;
                }
            } else {
                domHelper.messageBlock.textContent = '普通行動已暫停';
            }


            if (myKirito.isHunterMode && !!myKirito.preyId && myKirito.preyId !== 'null' && myKirito.preyId !== '') {
                if (myKirito.nextHuntSecond > 0) {
                    domHelper.messageBlock.textContent += `, ${myKirito.nextHuntSecond} 秒後發起攻擊`;
                } else {
                    domHelper.messageBlock.textContent += `, 正在進行${DUEL_NAME[myKirito.duel]}`;
                }
            }
            myKirito.saveTempSecond();
            myKirito.saveNextActionSecond();
            myKirito.saveNextHuntSecond();
        } else {
            domHelper.messageBlock.textContent = '死掉了';
        }
    }, 1000);
}

function waitCaptcha(myKirito, domHelper) {
    setTimeout(() => {

        if (document.querySelector('div > iframe')) {
            domHelper.messageBlock.textContent = '等待驗證';

            domHelper.loadButtons();
            if ('領取獎勵' in domHelper.buttons && !(domHelper.buttons['領取獎勵'].disabled)) {
                domHelper.buttons['領取獎勵'].click();
                console.log('領取樓層獎勵');
            }

            if (ACTION_NAME[myKirito.action] in domHelper.buttons && !(domHelper.buttons[ACTION_NAME[myKirito.action]].disabled)) {
                if (!myKirito.isPause) {
                    myKirito.lock();
                    action(myKirito, domHelper);
                }
                myKirito.syncTimer();
                endless(myKirito, domHelper);
            } else if (DUEL_NAME[1] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[1]].disabled)) {
                if (myKirito.isHunterMode) {
                    myKirito.lock();
                    hunt(myKirito, domHelper);
                }
                myKirito.syncTimer();
                endless(myKirito, domHelper);
            } else {
                waitCaptcha(myKirito, domHelper);
            }
        } else {
            endless(myKirito, domHelper);
        }
    }, 1000);
}