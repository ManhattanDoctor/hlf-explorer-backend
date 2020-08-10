import { LoggerWrapper, Logger } from '@ts-core/common/logger';
import { StateCheckCommand } from '../transport/command/StateCheckCommand';
import { KarmaLedgerCommand } from '@karma/common/transport/command';
import { IUIDable } from '@karma/common';
import { IProjectUserAddDto, IProjectUserRemoveDto, IProjectRemoveDto, IProjectEditDto } from '@karma/common/transport/command/project';
import { ICompanyUserAddDto, ICompanyUserRemoveDto, ICompanyRemoveDto, ICompanyEditDto } from '@karma/common/transport/command/company';
import { IUserAddDto, IUserCryptoKeyChangeDto, IUserRemoveDto, IUserEditDto } from '@karma/common/transport/command/user';
import { ICoinObject, ICoinTransferDto, ICoinBurnDto, ICoinEmitDto, CoinObjectType } from '@karma/common/transport/command/coin';
import { KarmaLedgerEvent } from '@karma/common/transport/event';
import { LedgerActionEntity } from '../../database/entity/LedgerActionEntity';
import { LedgerBlockTransaction } from '@hlf-explorer/common/ledger';
import { FabricTransactionValidationCode } from '@ts-core/blockchain-fabric/api';
import { ExtendedError } from '@ts-core/common/error';
import { LedgerActionType, ILedgerAction } from '@karma/common/explorer/action';
import * as _ from 'lodash';

export class ActionParser extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    private static USER_COMMANDS: Array<string> = [
        KarmaLedgerCommand.USER_ADD,
        KarmaLedgerCommand.USER_EDIT,
        KarmaLedgerCommand.USER_REMOVE,
        KarmaLedgerCommand.USER_CRYPTO_KEY_CHANGE
    ];

    private static COMPANY_COMMANDS: Array<string> = [
        KarmaLedgerCommand.COMPANY_ADD,
        KarmaLedgerCommand.COMPANY_EDIT,
        KarmaLedgerCommand.COMPANY_REMOVE,
        KarmaLedgerCommand.COMPANY_USER_ADD,
        KarmaLedgerCommand.COMPANY_USER_EDIT,
        KarmaLedgerCommand.COMPANY_USER_REMOVE
    ];

    private static PROJECT_COMMANDS: Array<string> = [
        KarmaLedgerCommand.PROJECT_ADD,
        KarmaLedgerCommand.PROJECT_EDIT,
        KarmaLedgerCommand.PROJECT_REMOVE,
        KarmaLedgerCommand.PROJECT_USER_ADD,
        KarmaLedgerCommand.PROJECT_USER_EDIT,
        KarmaLedgerCommand.PROJECT_USER_REMOVE
    ];

    private static COIN_COMMANDS: Array<string> = [KarmaLedgerCommand.COIN_EMIT, KarmaLedgerCommand.COIN_BURN, KarmaLedgerCommand.COIN_TRANSFER];

    private static COMMANDS: Array<string> = [
        ...ActionParser.USER_COMMANDS,
        ...ActionParser.COMPANY_COMMANDS,
        ...ActionParser.PROJECT_COMMANDS,
        ...ActionParser.COIN_COMMANDS
    ];

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async parseUser(transaction: LedgerBlockTransaction): Promise<Array<LedgerActionEntity>> {
        let item = new LedgerActionEntity(transaction, null, transaction.requestUserId);

        let items = [item];
        if (transaction.requestName === KarmaLedgerCommand.USER_ADD) {
            let response = transaction.response.response as IUIDable;
            item.type = LedgerActionType.USER_ADDED;
            if (transaction.validationCode === FabricTransactionValidationCode.VALID && !_.isNil(response)) {
                items.push(new LedgerActionEntity(transaction, LedgerActionType.USER_ADDED, response.uid));
            }
        } else if (transaction.requestName === KarmaLedgerCommand.USER_EDIT) {
            let request = transaction.request.request as IUserEditDto;
            item.type = LedgerActionType.USER_EDITED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.USER_EDITED, request.uid));
        } else if (transaction.requestName === KarmaLedgerCommand.USER_REMOVE) {
            let request = transaction.request.request as IUserRemoveDto;
            item.type = LedgerActionType.USER_REMOVED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.USER_REMOVED, request.uid));
        } else if (transaction.requestName === KarmaLedgerCommand.USER_CRYPTO_KEY_CHANGE) {
            let request = transaction.request.request as IUserCryptoKeyChangeDto;
            item.type = LedgerActionType.USER_CRYPTO_KEY_CHANGED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.USER_CRYPTO_KEY_CHANGED, request.uid));
        }
        return items;
    }

    private async parseCompany(transaction: LedgerBlockTransaction): Promise<Array<LedgerActionEntity>> {
        let item = new LedgerActionEntity(transaction, null, transaction.requestUserId);

        let items = [item];
        if (transaction.requestName === KarmaLedgerCommand.COMPANY_ADD) {
            let response = transaction.response.response as IUIDable;
            item.type = LedgerActionType.COMPANY_ADDED;

            if (transaction.validationCode === FabricTransactionValidationCode.VALID && !_.isNil(response)) {
                items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_ADDED, response.uid));
            }
        } else if (transaction.requestName === KarmaLedgerCommand.COMPANY_EDIT) {
            let request = transaction.request.request as ICompanyEditDto;
            item.type = LedgerActionType.COMPANY_EDITED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_EDITED, request.uid));
        } else if (transaction.requestName === KarmaLedgerCommand.COMPANY_REMOVE) {
            let request = transaction.request.request as ICompanyRemoveDto;
            item.type = LedgerActionType.COMPANY_REMOVED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_REMOVED, request.uid));
        } else if (transaction.requestName === KarmaLedgerCommand.COMPANY_USER_ADD) {
            let request = transaction.request.request as ICompanyUserAddDto;
            item.type = LedgerActionType.COMPANY_USER_ADDED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_USER_ADDED, request.companyUid));
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_USER_ADDED, request.userUid));
        } else if (transaction.requestName === KarmaLedgerCommand.COMPANY_USER_EDIT) {
            let request = transaction.request.request as ICompanyUserAddDto;
            item.type = LedgerActionType.COMPANY_USER_EDITED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_USER_EDITED, request.companyUid));
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_USER_EDITED, request.userUid));
        } else if (transaction.requestName === KarmaLedgerCommand.COMPANY_USER_REMOVE) {
            let request = transaction.request.request as ICompanyUserRemoveDto;
            item.type = LedgerActionType.COMPANY_USER_REMOVED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_USER_REMOVED, request.companyUid));
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COMPANY_USER_REMOVED, request.userUid));
        }
        return items;
    }

    private async parseProject(transaction: LedgerBlockTransaction): Promise<Array<LedgerActionEntity>> {
        let item = new LedgerActionEntity(transaction, null, transaction.requestUserId);

        let items = [item];
        if (transaction.requestName === KarmaLedgerCommand.PROJECT_ADD) {
            let response = transaction.response.response as IUIDable;
            item.type = LedgerActionType.PROJECT_ADDED;

            if (transaction.validationCode === FabricTransactionValidationCode.VALID && !_.isNil(response)) {
                items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_ADDED, response.uid));
            }
        } else if (transaction.requestName === KarmaLedgerCommand.PROJECT_EDIT) {
            let request = transaction.request.request as IProjectEditDto;
            item.type = LedgerActionType.PROJECT_EDITED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_EDITED, request.uid));
        } else if (transaction.requestName === KarmaLedgerCommand.PROJECT_REMOVE) {
            let request = transaction.request.request as IProjectRemoveDto;
            item.type = LedgerActionType.PROJECT_REMOVED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_REMOVED, request.uid));
        } else if (transaction.requestName === KarmaLedgerCommand.PROJECT_USER_ADD) {
            let request = transaction.request.request as IProjectUserAddDto;
            item.type = LedgerActionType.PROJECT_USER_ADDED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_USER_ADDED, request.projectUid));
            items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_USER_ADDED, request.userUid));
        } else if (transaction.requestName === KarmaLedgerCommand.PROJECT_USER_EDIT) {
            let request = transaction.request.request as IProjectUserAddDto;
            item.type = LedgerActionType.PROJECT_USER_EDITED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_USER_EDITED, request.projectUid));
            items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_USER_EDITED, request.userUid));
        } else if (transaction.requestName === KarmaLedgerCommand.PROJECT_USER_REMOVE) {
            let request = transaction.request.request as IProjectUserRemoveDto;
            item.type = LedgerActionType.PROJECT_USER_REMOVED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_USER_REMOVED, request.projectUid));
            items.push(new LedgerActionEntity(transaction, LedgerActionType.PROJECT_USER_REMOVED, request.userUid));
        }
        return items;
    }

    private async parseCoin(transaction: LedgerBlockTransaction): Promise<Array<LedgerActionEntity>> {
        let item = new LedgerActionEntity(transaction, null, transaction.requestUserId);

        let items = [item];
        if (transaction.requestName === KarmaLedgerCommand.COIN_EMIT) {
            let request = transaction.request.request as ICoinEmitDto;
            item.type = LedgerActionType.COIN_EMITTED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COIN_DONATED, request.from));
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COIN_EMITTED, request.to.uid));
        } else if (transaction.requestName === KarmaLedgerCommand.COIN_BURN) {
            let request = transaction.request.request as ICoinBurnDto;
            item.type = LedgerActionType.COIN_BURNED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COIN_BURNED, request.from.uid));
        } else if (transaction.requestName === KarmaLedgerCommand.COIN_TRANSFER) {
            let request = transaction.request.request as ICoinTransferDto;
            item.type = LedgerActionType.COIN_TRANSFERED;
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COIN_SENT, request.from.uid));
            items.push(new LedgerActionEntity(transaction, LedgerActionType.COIN_RECEIVED, request.to.uid));
        }

        return items;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async parse(transaction: LedgerBlockTransaction): Promise<Array<LedgerActionEntity>> {
        if (!ActionParser.COMMANDS.includes(transaction.requestName)) {
            return [];
        }

        let items = [];
        if (ActionParser.USER_COMMANDS.includes(transaction.requestName)) {
            items = await this.parseUser(transaction);
        } else if (ActionParser.COMPANY_COMMANDS.includes(transaction.requestName)) {
            items = await this.parseCompany(transaction);
        } else if (ActionParser.PROJECT_COMMANDS.includes(transaction.requestName)) {
            items = await this.parseProject(transaction);
        } else if (ActionParser.COIN_COMMANDS.includes(transaction.requestName)) {
            items = await this.parseCoin(transaction);
        } else {
            throw new ExtendedError(`Unable to parse "${transaction.requestName}" command: unknown type`);
        }
        items = _.compact(items);
        items.forEach(item => (item.uid = LedgerActionEntity.createUid(transaction.request.id, item)));
        return items;
    }
}
