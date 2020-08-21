import { Controller, Get } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { DatabaseService } from '../database/DatabaseService';

@Controller('health')
export class HealthcheckController extends LoggerWrapper {
    constructor(logger: Logger, private db: DatabaseService) {
        super(logger);
    }

    @Get('live')
    async live(): Promise<any> {
        this.log('Live check...');
        return this.db.ledger.find();
    }

    @Get('ready')
    async ready(): Promise<any> {
        this.log('Ready check...');
        return this.db.ledger.find();
    }
}
