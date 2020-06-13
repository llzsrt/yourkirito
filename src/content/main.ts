import { MyKirito } from './my-kirito';
import { DomHelper } from './dom-helper';
import { sleep, random } from './utils';
import { ACTION_NAME, DUEL_NAME } from './constant';

function main() {
    const myKirito = new MyKirito();
    const domHelper = new DomHelper(myKirito);
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch(message.event) {
            case 'sync':
                sendResponse({myKirito});
                break;
            case 'set-random-delay':
                myKirito.randomDelay = message.content;
                myKirito.saveRandomDelay();
                break;
            case 'set-action-cd':
                myKirito.nextActionSecond = message.content;
                myKirito.saveNextActionSecond();
                break;
            case 'set-hunt-cd':
                myKirito.nextHuntSecond = message.content;
                myKirito.saveNextHuntSecond();
                break;
        }
        sendResponse({ content: myKirito });
    });
    endless(myKirito, domHelper);
}

function action(myKirito, domHelper) {
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

        if (ACTION_NAME[myKirito.action] in domHelper.buttons && !(domHelper.buttons[ACTION_NAME[myKirito.action]].disabled)) {
            await sleep(500);
            domHelper.buttons[ACTION_NAME[myKirito.action]].click();
            console.log(ACTION_NAME[myKirito.action]);
        }
        myKirito.nextActionSecond = myKirito.actionCd + random(myKirito.randomDelay);
        myKirito.unlock();
    }, 500);
}

function hunt(myKirito: MyKirito, domHelper: DomHelper) {
    setTimeout(async () => {
        const tempStatus = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(2)');
        if (!!tempStatus && tempStatus.textContent.trim() === '此玩家目前是死亡狀態') {
            myKirito.isPreyDead = true;
            myKirito.nextHuntSecond = 0;
            myKirito.isHuntPause = true;
            myKirito.unlock();
            myKirito.saveIsHuntPause();
            domHelper.setHunterButtonStyle();
            return;
        } else {
            myKirito.isPreyDead = false;
        }

        if (myKirito.huntCount > 180) {
            myKirito.nextHuntSecond = myKirito.huntCd + random(myKirito.randomDelay) + (myKirito.duel == 4 ? myKirito.extraMercilesslyCd : 0);
            myKirito.unlock();
            return;
        }

        const tempName1 = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
        const tempName2 = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > div > table:nth-child(2) > tbody > tr:nth-child(4) > td');
        if ((!tempName1 || tempName1.textContent === '') && (!tempName2 || tempName2.textContent === '')) {
            await sleep(100);
            myKirito.huntCount++;
            hunt(myKirito, domHelper);
            return;
        }
        domHelper.loadButtons();

        if (DUEL_NAME[myKirito.duel] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[myKirito.duel]].disabled)) {
            domHelper.buttons[DUEL_NAME[myKirito.duel]].click();
        }
        else if (DUEL_NAME[2] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[2]].disabled)) {
            domHelper.buttons[DUEL_NAME[2]].click();
        } else {
            myKirito.nextHuntSecond = myKirito.huntCd + random(myKirito.randomDelay) + (myKirito.duel == 4 ? myKirito.extraMercilesslyCd : 0);
            myKirito.unlock();
            return;
        }

        await sleep(2000);

        const tempResult = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(3) > div > div');
        
        if (!!tempResult && (tempResult.textContent.includes(DUEL_NAME[4]) || tempResult.textContent.includes(DUEL_NAME[3]) || tempResult.textContent.includes(DUEL_NAME[2]) || tempResult.textContent.includes(DUEL_NAME[1]))) {
            console.log(tempResult.textContent);
            myKirito.nextHuntSecond = myKirito.huntCd + random(myKirito.randomDelay) + (myKirito.duel == 4 ? myKirito.extraMercilesslyCd : 0);
            myKirito.unlock();
        } else {
            myKirito.huntCount += 20;
            myKirito.saveHuntCount();
            myKirito.unlock();
            location.reload();
        }
        myKirito.huntCount = 0;
        myKirito.saveHuntCount();
    }, 500);
}

function endless(myKirito, domHelper) {
    setTimeout(async () => {
        if (document.querySelector('div > iframe')) {
            if (!myKirito.isHuntPause || !(location.href.includes(`/profile/${myKirito.preyId}`))) {
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

            if (myKirito.nextHuntSecond <= 0 && !myKirito.isHuntPause && !!myKirito.preyId && myKirito.preyId !== 'null' && myKirito.preyId !== '') {
                if (!(location.href.includes(`/profile/${myKirito.preyId}`))) {
                    location.replace(`/profile/${myKirito.preyId}`);
                } else {
                    myKirito.lock();
                    hunt(myKirito, domHelper);
                }
            }
            else if (myKirito.nextActionSecond <= 0 && !myKirito.isActionPause) {
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
            
            if (!myKirito.isActionPause) {
                if (myKirito.nextActionSecond > 0) {
                    domHelper.messageBlock.textContent = `${myKirito.nextActionSecond} 秒後${ACTION_NAME[myKirito.action]}`;
                } else {
                    domHelper.messageBlock.textContent = `正在${ACTION_NAME[myKirito.action]}`;
                }
            } else {
                domHelper.messageBlock.textContent = '普通行動已暫停';
            }


            if (!!myKirito.preyId && myKirito.preyId !== 'null' && myKirito.preyId !== '' && myKirito.isPreyDead) {
                domHelper.messageBlock.textContent += `, 他死了`;
            }else if (!myKirito.isHuntPause && !!myKirito.preyId && myKirito.preyId !== 'null' && myKirito.preyId !== '') {
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
                if (!myKirito.isActionPause) {
                    myKirito.lock();
                    action(myKirito, domHelper);
                }
                myKirito.syncTimer();
                endless(myKirito, domHelper);
            } else if (DUEL_NAME[1] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[1]].disabled)) {
                if (!myKirito.isHuntPause) {
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

main();