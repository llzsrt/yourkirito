import { App } from './app';
import { MyKirito } from './service/my-kirito';
import { DomHelper } from './service/dom-helper';
import { registerUrlChangeEvent } from './event/url-change';

registerUrlChangeEvent();

const myKirito = new MyKirito();
const domHelper = new DomHelper();

const app = new App(myKirito, domHelper);
app.endless();

if ('onMessage' in chrome.runtime) {
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
            case 'schedule-reset':
                myKirito.schedule.resetQueue();
                myKirito.schedule.count = 0;
                myKirito.saveSchedule();
                break;
            case 'set-schedule-process-list':
                myKirito.schedule.processList = message.content;
                myKirito.saveSchedule();
                break;
            case 'set-schedule-duel-enable':
                myKirito.schedule.isDuelScheduleEnable = message.content;
                myKirito.saveSchedule();
                app.dashboard.updateButtonsShowHide();
                break;
            case 'set-schedule-enable':
                myKirito.schedule.isEnable = message.content;
                myKirito.saveSchedule();
                app.dashboard.updateButtonsShowHide();
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
}