import { IModeSettings } from '@ts-core/backend';
import { ILogger, LoggerWrapper, IDestroyable } from '@ts-core/common';
import * as _ from 'lodash';

export abstract class AbstractService<T extends IModeSettings> extends LoggerWrapper implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _name: string;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(name: string, protected settings: T, logger?: ILogger) {
        super(logger);
        this._name = name;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        let method = this.settings.isTest ? this.warn : this.log;
        method.call(this, `"${this.name}" service started in ${this.settings.mode} mode`);
    }

    public destroy(): void {
        process.exit();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get name(): string {
        return this._name;
    }
}
