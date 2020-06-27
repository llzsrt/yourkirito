import { sleep } from '../function/utils';

export class DomHelper {

    buttons: { [key: string]: HTMLButtonElement} = {}
    links: any = {}
    contentBlocks: Element[];
    contentTables: HTMLTableElement[];

    constructor() {
        this.loadLinks();
        this.loadButtons();
    }

    loadButtons() {
        document.querySelectorAll('button').forEach(button => {
            this.buttons[button.textContent] = button;
        });
    }

    loadLinks() {
        document.querySelectorAll('a').forEach(link => {
            this.links[link.textContent] = link;
        });
    }

    getElementArray<T>(node: any, query: string) {
        const elementArray: T[] = Array.apply(null, node.querySelectorAll(query));
        return elementArray;
    }

    loadContentBlocks() {
        this.contentBlocks = this.getElementArray(document, '#root > div > div > div');
    }
    
    getActionCd() {
        const tempBlocks: Element[] = Array.apply(null, this.contentBlocks.find(x => x.textContent.startsWith('行動')).querySelectorAll('div'));
        const actionCdBlock = tempBlocks.find(x => x.textContent.startsWith('冷卻倒數'));
        if (!!actionCdBlock) {
            return parseInt(actionCdBlock.textContent.substring(5).split(' ')[0]);
        } else {
            return 0;
        }
    }

    getDuelCd() {
        const tempBlocks: Element[] = Array.apply(null, this.contentBlocks.find(x => x.textContent.startsWith('挑戰')).querySelectorAll('div'));
        const duelCdBlock = tempBlocks.find(x => x.textContent.startsWith('冷卻倒數'));
        if (!!duelCdBlock) {
            return parseInt(duelCdBlock.textContent.substring(5).split(' ')[0]);
        } else {
            return 0;
        }
    }

    getActionLog() {
        const actionLogBlock = this.contentBlocks.find(x => x.textContent.startsWith('行動記錄'));
        const logBlocks: Element[] = Array.apply(null, actionLogBlock.children);
        return logBlocks.filter(x => x.nodeName === 'DIV').map(x => x.textContent);
    }

    getDuelLog() {
        const duelLogBlock = this.contentBlocks.find(x => x.textContent.startsWith('戰鬥報告'));
        const logBlocks: Element[] = Array.apply(null, duelLogBlock.children);
        return logBlocks.filter(x => x.nodeName === 'DIV').map(x => x.children[0].textContent);
    }

    hasIframe() {
        return !!document.querySelector('div > iframe');
    }

    async waitForText(selector: string, value: string = '', timeout: number = 10000): Promise<string> {
        if (timeout < 1) {
            return null;
        }
        const target = document.querySelector(selector);
        if (!!target && !!target.textContent && target.textContent.includes(value)) {
            return target.textContent;
        } else {
            await sleep(500);
            return await this.waitForText(selector, value, timeout - 500);
        }
    }
}