import { LoggerWrapper, Logger } from '@ts-core/common/logger';
import { Transport } from '@ts-core/common/transport';
import { Ledger } from '@hlf-explorer/common/ledger';
import { LedgerStateCheckCommand } from '../../../core/transport/command/LedgerStateCheckCommand';
import { TraceUtil } from '@ts-core/common/trace';

export class LedgerStateChecker extends LoggerWrapper {
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

    constructor(logger: Logger, private transport: Transport, private ledger: Ledger) {
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
        this.timerStart(this.ledger.blockFrequency);
        this.check();
    }

    public async check(): Promise<void> {
        this.transport.send(new LedgerStateCheckCommand(TraceUtil.addIfNeed({ ledgerId: this.ledger.id })), { timeout: this.timeout });
    }

    public stop(): void {
        this.timerStop();
    }

    public destroy(): void {
        super.destroy();
        this.stop();
    }
}
