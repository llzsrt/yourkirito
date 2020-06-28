export class Schedule {
    isEnable: boolean = false;
    isDuelScheduleEnable: boolean = false;
    isPause: boolean = true;

    current: Process = null;
    processList: Process[] = [];
    processQueue: Process[] = [];

    constructor(data?: Partial<Schedule>) {
        if (data)
            Object.assign(this, data);
    }

    next() {
        if (this.processQueue.length <= 0) {
            this.reset();
        }
        this.current = this.processQueue.shift();
    }

    reset() {
        this.processQueue = this.processList.slice();
        this.current = null;
    }
}

export class Process {
    type: ProcessType;
    content: ProcessActionContent | ProcessDuelContent;
}

export enum ProcessType {
    Action = 'action',
    Duel = 'duel'
}

export enum ProcessActionContent {
    Rabbit = 2,
    Train = 3,
    Picnic = 4,
    Girl = 5,
    DoGoodThings = 6,
    Sit = 7,
    Fishing = 8
}

export enum ProcessDuelContent {
    Friendly = 1,
    Seriously = 2,
    Decisively = 3,
    Mercilessly = 4
}