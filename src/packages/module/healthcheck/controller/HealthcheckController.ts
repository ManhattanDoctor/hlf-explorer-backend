import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';

@ApiTags('Health')
@Controller('health')
export class HealthcheckController extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get('live')
    @ApiOperation({ summary: `Liveness probe`, description: `Succeeds if the service can reach PostgreSQL (performs ledger.find()).` })
    public async live(): Promise<any> {
        return this.database.ledger.find();
    }

    @Get('ready')
    @ApiOperation({ summary: `Readiness probe`, description: `Succeeds if the service can reach PostgreSQL (performs ledger.find()).` })
    public async ready(): Promise<any> {
        return this.database.ledger.find();
    }
}
