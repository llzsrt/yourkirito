export class Schedule {
    isEnable: boolean = false;
    isDuelScheduleEnable: boolean = false;
    isPause: boolean = true;
    count: number = 0;

    current: Process = null;
    processList: Process[] = [];
    processQueue: Process[] = [];

    afterStack: Process[] = [];

    constructor(data?: Partial<Schedule>) {
        if (data) Object.assign(this, data);
    }

    next() {
        if (this.afterStack.length === 0) {
            if (this.processQueue.length === 0) {
                this.resetQueue();
                this.count += 1;
            }
            const current = this.processQueue.shift();
            if ('after' in current) {
                this.afterStack.push(current.after);
                delete current.after;
            }
            this.current = current;
        } else {
            if ('after' in this.current) this.afterStack.push(this.current.after);
            this.current = this.afterStack.pop();
        }

        
    }

    resetQueue() {
        this.processQueue = this.processList.slice();
        this.current = null;
    }

    reset() {
        this.count = 0;
        this.resetQueue();
    }
}

export class ProcessCheckContent {
    if: string;
    do: Process;
}

export enum CheckTarget {
    Exp = 'exp',
    Lv = 'lv',
    Alive = 'alive',
    Count = 'count'
}

export class Process {
    type: ProcessType;
    content?: ProcessActionContent | ProcessDuelContent | ProcessCheckContent | string;
    after?: Process;
}

export enum ProcessType {
    Action = 'action',
    Duel = 'duel',
    Check = 'check',
    Reincarnation = 'reincarnation',
    ResetSchedule = 'reset-schedule',
    Delay = 'delay',
    Reload = 'reload'
}

export enum ProcessActionContent {
    Rabbit = 2,
    Train = 3,
    Picnic = 4,
    Girl = 5,
    DoGoodThings = 6,
    Sit = 7,
    Fishing = 8,
    Practice1 = 9,
    Practice2 = 10,
    Practice4 = 11,
    Practice8 = 12,
}

export enum ProcessDuelContent {
    Friendly = 1,
    Seriously = 2,
    Decisively = 3,
    Mercilessly = 4
}