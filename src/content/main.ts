import { App } from './app';
import { MyKirito } from './service/my-kirito';
import { DomHelper } from './service/dom-helper';
import { registerUrlChangeEvent } from './event/url-change';
import { registerXhrDoneEvent } from './event/xhr-done';
import { SCRIPT_STATUS } from './constant';


registerUrlChangeEvent();
registerXhrDoneEvent();

const myKirito = new MyKirito();
const domHelper = new DomHelper();

const app = new App(myKirito, domHelper);
app.endless();

if ('onMessage' in chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.event) {
            case 'sync':
                if (myKirito.profile) {
                    sendResponse({ myKirito });
                } else {
                    app.syncProfileFromProfilePage()
                        .catch(err => {
                            console.error(err);
                        })
                        .finally(() => {
                            sendResponse({ myKirito });
                        });
                }
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
                myKirito.scriptStatus = SCRIPT_STATUS.Normal;
                myKirito.unlock();
                break;
            case 'set-schedule-process-list':
                myKirito.schedule.processList = message.content;
                myKirito.schedule.processQueue = message.content;
                myKirito.saveSchedule();
                break;
            case 'set-only-duel-with-red':
                myKirito.onlyDuelWithRed = message.content;
                myKirito.saveOnlyDuelWithRed();
                break;
            case 'set-schedule-do-not-stop':
                myKirito.doNotStopSchedule = message.content;
                myKirito.saveDoNotStopSchedule();
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