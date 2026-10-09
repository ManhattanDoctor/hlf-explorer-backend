import { Module, Global } from '@nestjs/common';
import { TransportSocket } from '@ts-core/socket-server';
import { TransportSocketRoomHandler } from './handler';
import { TransportSocketServer, TransportSocketImpl } from './service';

let providers = [
    {
        provide: TransportSocket,
        useExisting: TransportSocketImpl,
    },
    TransportSocketImpl,
    TransportSocketServer,
    TransportSocketRoomHandler
];

@Global()
@Module({
    exports: [TransportSocket],
    providers
})
export class SocketModule { }