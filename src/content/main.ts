import { MyKirito } from './my-kirito';
import { DomHelper } from './dom-helper';
import { sleep, random } from './utils';
import { ACTION_NAME, DUEL_NAME, SCRIPT_STATUS } from './constant';

function main() {
    let myKirito = new MyKirito();
    const domHelper = new DomHelper(myKirito);
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.event) {
            case 'sync':
                syncProfile(myKirito).then(data => {
                    sendResponse({ myKirito: data });
                });
                return true;
            case 'reset':
                const newMyKirito = new MyKirito();
                localStorage.clear();
                myKirito.saveTempToken();
                myKirito.saveProfile();
                newMyKirito.token = myKirito.token;
                newMyKirito.profile = myKirito.profile;
                sendResponse({ myKirito: newMyKirito });
                location.reload();
                break;
            case 'set-random-delay':
                myKirito.randomDelay = message.content;
                myKirito.saveRandomDelay();
                break;
            case 'set-auto-receive-award':
                myKirito.isAutoReceiveAward = message.content;
                myKirito.saveIsAutoReceiveAward();
                break;
            case 'set-basic-action-cd':
                myKirito.actionCd = message.content;
                myKirito.saveActionCd();
                break;
            case 'set-basic-hunt-cd':
                myKirito.huntCd = message.content;
                myKirito.saveHuntCd();
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

async function actionWork(myKirito: MyKirito, domHelper: DomHelper) {
    domHelper.loadButtons();

    // 檢查暱稱欄位
    const tempName = await domHelper.waitForElement('#root > div > div > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
    // 若超過10秒仍未顯示暱稱，重新整理
    if (!tempName) {
        myKirito.unlock();
        location.reload();
    }

    // 有OK可以按就按OK
    if (domHelper.buttons['OK']) {
        domHelper.buttons['OK'].click();
        await sleep(500);
    }

    // 檢查驗證
    if (document.querySelector('div > iframe') && ACTION_NAME[myKirito.action] in domHelper.buttons && domHelper.buttons[ACTION_NAME[myKirito.action]].disabled) {
        myKirito.isActionWaitCaptcha = true;
        myKirito.saveIsActionWaitCaptcha();
        myKirito.unlock();
        return;
    }

    // 按下該按的按鈕
    if (ACTION_NAME[myKirito.action] in domHelper.buttons && !(domHelper.buttons[ACTION_NAME[myKirito.action]].disabled)) {
        domHelper.buttons[ACTION_NAME[myKirito.action]].click();
        console.log(ACTION_NAME[myKirito.action]);
    } else {
        // 沒按鈕能按則放棄本次行動
        myKirito.nextActionSecond = myKirito.actionCd + random(myKirito.randomDelay);
        myKirito.unlock();
        return;
    }


    myKirito.nextActionSecond = myKirito.actionCd + random(myKirito.randomDelay);
    myKirito.unlock();
}

async function huntWork(myKirito: MyKirito, domHelper: DomHelper) {
        // 檢查暱稱欄位
        const tempName = await domHelper.waitForElement(
            myKirito.profileViewType === 'detail' || !myKirito.profileViewType ?
                'table > tbody > tr:nth-child(1) > td:nth-child(2)' :
                'div > table:nth-child(2) > tbody > tr:nth-child(4) > td'
        );
        // 若超過10秒仍未顯示對手暱稱，重新整理
        if (!tempName) {
            myKirito.unlock();
            location.reload();
            return;
        }

        // 檢查對手死了沒
        const tempStatus = await domHelper.waitForElement('#root > div > div:nth-child(1) > div:nth-child(2)');
        if (!!tempStatus && tempStatus === '此玩家目前是死亡狀態') {
            myKirito.isPreyDead = true;
            myKirito.nextHuntSecond = 0;
            myKirito.isHuntPause = true;
            myKirito.saveIsHuntPause();
            domHelper.setHunterButtonStyle();
            myKirito.unlock();
            return;
        } else {
            myKirito.isPreyDead = false;
        }

        await sleep(500);

        // 檢查驗證
        domHelper.loadButtons();
        if (document.querySelector('div > iframe') && DUEL_NAME[1] in domHelper.buttons && domHelper.buttons[DUEL_NAME[1]].disabled) {
            myKirito.isHuntWaitCaptcha = true;
            myKirito.saveIsHuntWaitCaptcha();
            myKirito.unlock();
            return;
        }

        let duelType = '';

        if (DUEL_NAME[myKirito.duel] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[myKirito.duel]].disabled)) {
            domHelper.buttons[DUEL_NAME[myKirito.duel]].click();
            duelType = DUEL_NAME[myKirito.duel];
        } else if (DUEL_NAME[2] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[2]].disabled)) {
            domHelper.buttons[DUEL_NAME[2]].click();
            duelType = DUEL_NAME[2];
        } else {
            // 沒按鈕能按則放棄本次對戰
            myKirito.nextHuntSecond = myKirito.huntCd + random(myKirito.randomDelay) + (myKirito.duel == 4 ? myKirito.extraMercilesslyCd : 0);
            myKirito.unlock();
            return;
        }

        // 檢查對戰結果
        const tempResult = await domHelper.waitForElement('#root > div > div:nth-child(1) > div:nth-child(3) > div > div', duelType);
        if (!!tempResult && (tempResult.includes(DUEL_NAME[4]) || tempResult.includes(DUEL_NAME[3]) || tempResult.includes(DUEL_NAME[2]) || tempResult.includes(DUEL_NAME[1]))) {
            console.log(tempResult);
            myKirito.nextHuntSecond = myKirito.huntCd + random(myKirito.randomDelay) + (myKirito.duel == 4 ? myKirito.extraMercilesslyCd : 0);
            myKirito.unlock();
        } else {
            // 若未超過10秒仍未出現應有的對戰結果，重新整理
            myKirito.unlock();
            location.reload();
        }
}

async function action(myKirito: MyKirito, domHelper: DomHelper) {
    domHelper.loadLinks();
    if (!(domHelper.links['我的桐人'].className.includes('active'))) {
        domHelper.links['我的桐人'].click();
    } else {
        myKirito.lock();
        myKirito.scriptStatus = SCRIPT_STATUS.Action;
        myKirito.saveScriptStatus();
        await actionWork(myKirito, domHelper);
    }
}

async function hunt(myKirito: MyKirito, domHelper: DomHelper) {
    if (!(location.href.includes(`/profile/${myKirito.preyId}`))) {
        location.replace(`/profile/${myKirito.preyId}`);
    } else {
        myKirito.lock();
        myKirito.scriptStatus = SCRIPT_STATUS.Hunt;
        myKirito.saveScriptStatus();
        await huntWork(myKirito, domHelper);
    }
}

function endless(myKirito: MyKirito, domHelper: DomHelper) {
    setTimeout(async () => {

        domHelper.loadButtons();

        if ('領取獎勵' in domHelper.buttons && !(domHelper.buttons['領取獎勵'].disabled) && myKirito.isAutoReceiveAward) {
            await sleep(500);
            domHelper.buttons['領取獎勵'].click();
            console.log('領取樓層獎勵');
        }

        const tempDead = document.querySelector('#root > div > div')
        if (!!tempDead && tempDead.textContent === '你的角色死亡了，請進行轉生') {
            myKirito.isDead = true;
        } else {
            myKirito.isDead = false;
        }

        if (!myKirito.isBusy) {

            if (myKirito.nextHuntSecond <= 0 &&
                !myKirito.isHuntPause &&
                !!myKirito.preyId && myKirito.preyId !== 'null' && myKirito.preyId !== '' &&
                !myKirito.isHuntWaitCaptcha) {
                await hunt(myKirito, domHelper);
            } else if (myKirito.nextActionSecond <= 0 &&
                !myKirito.isActionPause &&
                !myKirito.isActionWaitCaptcha) {
                await action(myKirito, domHelper);
            }
        } else {
            switch (myKirito.scriptStatus) {
                case SCRIPT_STATUS.Action:
                    await action(myKirito, domHelper);
                    break;
                case SCRIPT_STATUS.Hunt:
                    await hunt(myKirito, domHelper);
                    break;
                default:
                    myKirito.unlock();
            }
        }

        endless(myKirito, domHelper);

        if (!myKirito.isDead) {
            myKirito.nextActionSecond = myKirito.nextActionSecond > 0 ? myKirito.nextActionSecond - 1 : 0;
            myKirito.nextHuntSecond = myKirito.nextHuntSecond > 0 ? myKirito.nextHuntSecond - 1 : 0;

            if (myKirito.isActionPause) {
                domHelper.messageBlock.innerHTML = '普通行動已暫停';
            } else if (myKirito.isActionWaitCaptcha) {
                domHelper.messageBlock.innerHTML = '<a href="/">等待驗證後行動</a>';

                if (location.pathname === '/' && (ACTION_NAME[myKirito.action] in domHelper.buttons && !(domHelper.buttons[ACTION_NAME[myKirito.action]].disabled) || !document.querySelector('div > iframe'))) {
                    myKirito.isActionWaitCaptcha = false;
                    myKirito.saveIsActionWaitCaptcha();
                }
            } else {
                if (myKirito.nextActionSecond > 0) {
                    domHelper.messageBlock.innerHTML = `${myKirito.nextActionSecond} 秒後${ACTION_NAME[myKirito.action]}`;
                } else {
                    domHelper.messageBlock.innerHTML = `正在${ACTION_NAME[myKirito.action]}`;
                }
            }

            if (myKirito.isHuntPause || !myKirito.preyId) {
                if (myKirito.isPreyDead) {
                    domHelper.messageBlock.innerHTML += `, <a href="profile/${myKirito.preyId}">他死了</a>`;
                } else {
                    domHelper.messageBlock.innerHTML += !myKirito.preyId ? ', 沒有攻擊目標' : ', 攻擊已暫停';
                }
            } else if (myKirito.isHuntWaitCaptcha) {
                domHelper.messageBlock.innerHTML += `, <a href="profile/${myKirito.preyId}">等待驗證後攻擊</a>`;

                if (location.href.includes(`/profile/${myKirito.preyId}`) && (DUEL_NAME[1] in domHelper.buttons && !(domHelper.buttons[DUEL_NAME[1]].disabled) || !document.querySelector('div > iframe'))) {
                    myKirito.isHuntWaitCaptcha = false;
                    myKirito.saveIsHuntWaitCaptcha();
                }
            } else {
                if (myKirito.nextHuntSecond > 0) {
                    domHelper.messageBlock.innerHTML += `, ${myKirito.nextHuntSecond} 秒後發起攻擊`;
                } else {
                    domHelper.messageBlock.innerHTML += `, 正在進行${DUEL_NAME[myKirito.duel]}`;
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

async function syncProfile(myKirito: MyKirito) {
    if (!!myKirito.token) {
        const profile = await getSelfProfile(myKirito.token);
        myKirito.profile = profile;
    }
    return myKirito;
}

async function getSelfProfile(token: string) {
    const reponse = await fetch("https://mykirito.com/api/my-kirito", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "token": token,
            "x-requested-with": "XMLHttpRequest"
        }
    });
    return await reponse.json();
}


main();