import { ITransportFabricConnectionSettings } from '@hlf-core/transport';
import { FileUtil } from '@ts-core/backend';
import { FabricConnectionSettingsFactory } from '@hlf-core/api';
import { IKeyAsymmetric } from '@ts-core/common';
import * as _ from 'lodash';

export class LedgerSettingsFactory extends FabricConnectionSettingsFactory<ILedgerConnectionSettings> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async load(path: string): Promise<void> {
        this.log(`Loading ledgers settings from "${path}"...`);
        let items = await FileUtil.jsonRead<{ ledgers: Array<ILedgerConnectionSettings> }>(path);
        this.debug(`Ledgers settings loaded:\n${JSON.stringify(items, null, 4)}`);

        if (!_.isEmpty(items)) {
            this.debug('Parsing ledgers settings...');
            await this.parse(items.ledgers);
        }
        this.debug(`Settings parsed:\n${JSON.stringify(items, null, 4)}`);
    }

    public getById(id: number): ILedgerConnectionSettings {
        return _.find(this.items.collection, { id });
    }
}

export interface ILedgerConnectionSettings extends ITransportFabricConnectionSettings {
    id: number;
    batch?: ILedgerBatchSettings;
}

export interface ILedgerBatchSettings {
    key: IKeyAsymmetric;
    timeout: number;
}
