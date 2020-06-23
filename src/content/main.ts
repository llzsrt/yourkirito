import { Worker } from './worker';
import { MyKirito } from './my-kirito';
import { DomHelper } from './dom-helper';

const myKirito = new MyKirito();
const domHelper = new DomHelper(myKirito);
const worker = new Worker(myKirito, domHelper);
worker.endless();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.event) {
        case 'sync':
            myKirito.syncProfile()
                .catch(err => {
                    console.error(err);
                })
                .finally(() => {
                    sendResponse({ myKirito });
                });
            return true;
        case 'reset':
            localStorage.clear();
            const newMyKirito = new MyKirito();
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
        case 'set-basic-duel-cd':
            myKirito.duelCd = message.content;
            myKirito.saveDuelCd();
            break;
        case 'set-action-cd':
            myKirito.nextActionSecond = message.content;
            myKirito.saveNextActionSecond();
            break;
        case 'set-duel-cd':
            myKirito.nextDuelSecond = message.content;
            myKirito.saveNextDuelSecond();
            break;
    }
});