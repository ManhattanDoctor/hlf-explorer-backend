import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ILogger } from '@ts-core/common';
import { Ledger, LedgerBlock, LedgerBlockTransaction, LedgerBlockEvent } from '@hlf-explorer/common';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Methods
//
// --------------------------------------------------------------------------

export async function swagger(_logger: ILogger, application: INestApplication): Promise<void> {
    let config = new DocumentBuilder()
        .setTitle('HLF Explorer Backend API')
        .setDescription(`
## Hyperledger Fabric Explorer

REST and WebSocket API for monitoring and interacting with one or more Hyperledger Fabric networks.
Blocks are read from the ledger via QSCC, parsed into transactions and events and stored in PostgreSQL;
new blocks are broadcast over WebSocket (Socket.IO) in real time.

### Resources
- **Ledger**: registered Fabric networks and their parsing state (\`blockHeight\`, \`blockHeightParsed\`)
- **Block / Transaction / Event**: parsed ledger data with pagination and filtering
- **Search**: redirect to the exact block, transaction or event by number, hash or uid
- **Command**: forward an arbitrary transport command to a network's chaincode
- **Health**: liveness and readiness probes (PostgreSQL connectivity)
- **Prometheus**: application metrics at \`/metrics\`

### Conventions
- All ledger endpoints are prefixed with \`api/ledger/\`.
- List endpoints accept \`conditions\`, \`sort\`, \`pageSize\` and \`pageIndex\` (see \`Paginable\`).

> ⚠️ This service has **no built-in authentication or authorization** — it is meant to run on an
> internal network or behind an authenticating reverse-proxy. Do not expose it, and especially the
> \`request\` endpoint, directly to the public.
        `)
        .setVersion('2.0.0')
        .addServer('http://localhost:3000', 'Local')
        .addTag('Ledger', 'Registered Fabric networks and their state')
        .addTag('Block', 'Ledger blocks')
        .addTag('Transaction', 'Block transactions')
        .addTag('Event', 'Chaincode events')
        .addTag('Search', 'Lookup a block, transaction or event by number, hash or uid')
        .addTag('Command', 'Forward a command to the chaincode')
        .addTag('Health', 'Liveness and readiness probes')
        .addTag('Prometheus', 'Application metrics')
        .build();
    let document = SwaggerModule.createDocument(application, config, {
        extraModels: [Ledger, LedgerBlock, LedgerBlockTransaction, LedgerBlockEvent]
    });

    for (let methods of Object.values(document.paths)) {
        for (let operation of Object.values(methods as object)) {
            if (_.isNil(operation) || _.isNil(operation.tags)) {
                continue;
            }
            if (_.isEmpty(operation.summary) && operation.tags.includes('Prometheus')) {
                operation.summary = 'Get application metrics';
                operation.description = 'Prometheus-compatible metrics endpoint for monitoring.';
            }
        }
    }

    fixBrokenRefs(document);
    deduplicateOperationIds(document);

    SwaggerModule.setup('swagger', application, document);
}

// --------------------------------------------------------------------------
//
//  Private Methods
//
// --------------------------------------------------------------------------

function deduplicateOperationIds(document: any): void {
    let operationIds = new Set<string>();
    for (let methods of Object.values(document.paths)) {
        for (let [method, operation] of Object.entries(methods as object)) {
            if (operation.operationId && operationIds.has(operation.operationId)) {
                operation.operationId = `${operation.operationId}_${method}`;
            }
            if (operation.operationId) {
                operationIds.add(operation.operationId);
            }
        }
    }
}

function fixBrokenRefs(obj: any): void {
    if (!obj || typeof obj !== 'object') {
        return;
    }
    if (Array.isArray(obj)) {
        for (let item of obj) {
            fixBrokenRefs(item);
        }
        return;
    }
    for (let [key, value] of Object.entries(obj)) {
        if (key === '$ref' && typeof value === 'string' && value.endsWith('/')) {
            delete obj.$ref;
            obj.type = 'string';
        } else {
            fixBrokenRefs(value);
        }
    }
}
