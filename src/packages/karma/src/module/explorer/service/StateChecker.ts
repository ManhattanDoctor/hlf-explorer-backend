import { LoggerWrapper, Logger } from '@ts-core/common/logger';
import { Transport, ITransport } from '@ts-core/common/transport';
import { StateCheckCommand } from '../transport/command/StateCheckCommand';

export class StateChecker extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private timer: any;
    private timeout: number;
    private isRunning: boolean;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: ITransport, private delay: number) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Handlers
    //
    // --------------------------------------------------------------------------

    private checkTimerHandler = (): void => {
        this.check();
    };

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    private timerStart(timeout: number): void {
        if (this.isRunning) {
            return;
        }

        clearTimeout(this.timer);
        this.timer = setInterval(this.checkTimerHandler, timeout);

        this.timeout = timeout;
        this.isRunning = true;
        this.log(`Timer started ${timeout}ms`);
    }

    private timerStop(): void {
        if (!this.isRunning) {
            return;
        }

        clearInterval(this.timer);
        this.timer = null;

        this.isRunning = false;
        this.log(`Timer stopped`);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async start(): Promise<void> {
        this.timerStart(this.delay);
        this.check();
    }

    public async check(): Promise<void> {
        this.transport.send(new StateCheckCommand(), { timeout: this.timeout });
    }

    public stop(): void {
        this.timerStop();
    }

    public destroy(): void {
        super.destroy();
        this.stop();
    }
}
