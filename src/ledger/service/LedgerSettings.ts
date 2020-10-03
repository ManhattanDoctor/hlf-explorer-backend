import { ILogger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { ITransportFabricConnectionSettings } from '@hlf-core/transport/client';
import { MapCollection } from '@ts-core/common/map';
import { FileUtil } from '@ts-core/backend/file';
import { AbstractSettingsStorage } from '@ts-core/common/settings';

export class LedgerSettings extends MapCollection<ILedgerConnectionSettings> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected items: MapCollection<ILedgerConnectionSettings>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private logger: ILogger) {
        super('name');
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async load(path: string): Promise<void> {
        this.logger.log(`Loading ledgers settings ${path}...`);
        let items = await FileUtil.jsonRead<{ ledgers: Array<ILedgerConnectionSettings> }>(path);
        if (_.isEmpty(items)) {
            return;
        }

        for (let item of items.ledgers) {
            item.fabricIdentityPrivateKey = AbstractSettingsStorage.parsePEM(item.fabricIdentityPrivateKey);
            item.fabricIdentityCertificate = AbstractSettingsStorage.parsePEM(item.fabricIdentityCertificate);
            this.add(item);
        }
    }

    public getById(id: number): ILedgerConnectionSettings {
        return _.find(this.collection, { id });
    }
}

export interface ILedgerConnectionSettings extends ITransportFabricConnectionSettings {
    id: number;
    name: string;
    passwordToReset?: string;
}
