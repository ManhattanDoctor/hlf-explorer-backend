import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway()
export class MonitorService extends LoggerWrapper implements OnGatewayInit<Namespace>, OnGatewayConnection, OnGatewayDisconnect {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);

        // this.transport.getDispatcher<BlockParsedEvent>(BlockParsedEvent.NAME).subscribe(item => this.blockParsed(item.data));
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public blockParsed(): void {
        /*
        let item = this.getInfo(event.ledgerId);
        if (_.isNil(item)) {
            return;
        }

        let block = TransformUtil.toClass(LedgerBlock, event.block);
        item.blockLast = block;
        item.blocksLast.add(block);
        this.namespace.emit(LedgerSocketEvent.LEDGER_UPDATED, { id: item.id, blockLast: event.block });
        */
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    public afterInit(item: Namespace): any {
        this.log(`Socket initialized on namespace ${item.name}`);
    }

    public async handleConnection(client: Socket): Promise<any> {}

    public handleDisconnect(client: Socket): any {}
}
