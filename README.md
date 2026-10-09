# HLF Explorer Backend API

[![TypeScript](https://img.shields.io/badge/TypeScript-4.5.5-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1.0-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-11.4-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)

Профессиональное серверное решение для мониторинга, анализа и взаимодействия с Hyperledger Fabric (HLF) блокчейн-сетями. Предоставляет REST и WebSocket API для работы с блоками, транзакциями, событиями и управления состоянием блокчейна.

---

## 📑 Содержание

- [Возможности](#-возможности)
- [Технологии](#-технологии)
- [Архитектура](#-архитектура)
- [Установка](#-установка)
- [Конфигурация](#-конфигурация)
- [Использование](#-использование)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [Структура проекта](#-структура-проекта)
- [Разработка](#-разработка)
- [Развертывание](#-развертывание)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🚀 Возможности

### Основные функции
- **Мониторинг блокчейна в реальном времени** через WebSocket
- **REST API** для получения блоков, транзакций и событий
- **Полнотекстовый поиск** по всем сущностям блокчейна
- **Batch операции** для высокой производительности
- **Кэширование** часто запрашиваемых данных
- **Мониторинг метрик** через Prometheus
- **Автоматическая документация** с Swagger/OpenAPI
- **Поддержка нескольких ledger'ов** одновременно

### Технические возможности
- Модульная архитектура на основе NestJS
- Полная типизация TypeScript
- Асинхронная обработка команд и событий
- Database миграции с TypeORM
- Глобальная обработка ошибок и валидация
- Docker-ready с docker-compose
- Health check endpoints

---

## 🛠 Технологии

### Core Stack
| Технология | Версия | Назначение |
|------------|--------|------------|
| **TypeScript** | 4.5.5 | Язык разработки |
| **NestJS** | 11.1.0 | Backend framework |
| **TypeORM** | 11.0.0 | ORM для работы с БД |
| **PostgreSQL** | 11.4+ | База данных |
| **RxJS** | Latest | Reactive programming |

### Infrastructure
| Технология | Назначение |
|------------|------------|
| **Swagger/OpenAPI** | API документация |
| **Socket.io** | WebSocket коммуникация |
| **Helmet** | Security HTTP headers |
| **Compression** | Response compression |
| **Prometheus** | Метрики и мониторинг |
| **Docker** | Контейнеризация |

### Hyperledger Fabric
| Пакет | Версия |
|-------|--------|
| `@hlf-core/transport` | ~3.2.8 |
| `@hlf-explorer/common` | ~3.2.6 |
| `fabric-network` | Latest |

---

## 🏗 Архитектура

### Общая схема

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  (REST API Clients, WebSocket Clients, Frontend)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                      NestJS Application                         │
│  ┌──────────────────────┬─┴──────────────────┬─────────────────┐│
│  │   Controllers        │   Services         │   Transport     ││
│  │  (REST Endpoints)    │  (Business Logic)  │  (Commands/     ││
│  │                      │                    │   Events)       ││
│  └──────────┬───────────┴────────┬───────────┴─────────┬───────┘│
│             │                    │                     │        │
│  ┌──────────▼────────┐ ┌────────▼─────────┐ ┌────────▼──────┐ │
│  │  Database Module  │ │  Ledger Module   │ │ Socket Module │ │
│  │  (TypeORM Repos)  │ │  (HLF Integration│ │ (WebSocket)   │ │
│  └──────────┬────────┘ └────────┬─────────┘ └───────────────┘ │
└─────────────┼──────────────────┼─────────────────────────────┘
              │                  │
     ┌────────▼────────┐  ┌──────▼──────────────────┐
     │   PostgreSQL    │  │  Hyperledger Fabric     │
     │    Database     │  │  Blockchain Network     │
     └─────────────────┘  └─────────────────────────┘
```

### Модульная структура

#### 1. **Application Module** (`application/api`)
Точка входа приложения, настройки, миграции
- `main.ts` - Bootstrap приложения
- `AppModule.ts` - Главный модуль NestJS
- `AppSettings.ts` - Конфигурация из environment
- `migration/` - Database миграции

#### 2. **Database Module** (`module/database`)
Работа с PostgreSQL через TypeORM
- Entities: `LedgerEntity`, `LedgerBlockEntity`, `LedgerBlockTransactionEntity`, `LedgerBlockEventEntity`
- `DatabaseService` - Unified доступ к репозиториям
- Автоматические миграции при старте

#### 3. **Ledger Module** (`module/ledger`)
Основная бизнес-логика работы с блокчейном
- **Controllers**: REST API endpoints
- **Services**:
  - `LedgerService` - управление ledger'ами
  - `LedgerStateChecker` - проверка новых блоков
  - `LedgerBatchChecker` - batch операции
  - `LedgerApiMonitor` - WebSocket мониторинг
- **Transport Handlers**: обработка асинхронных команд
- **Factories**: создание HLF транспортов и настроек

#### 4. **Socket Module** (`module/socket`)
Real-time коммуникация через WebSocket
- Поддержка namespaces
- Event-driven architecture
- Автоматическая отправка обновлений

#### 5. **Healthcheck Module** (`module/healthcheck`)
Endpoints для проверки состояния
- `/healthcheck` - статус сервиса

#### 6. **Core Module** (`module/core`)
Базовые утилиты и абстракции
- `AbstractService` - базовый класс сервисов
- `TransformGroup` - утилиты трансформации

### Паттерны проектирования

| Паттерн | Применение |
|---------|------------|
| **Dependency Injection** | NestJS IoC контейнер для всех зависимостей |
| **Repository** | TypeORM репозитории для работы с БД |
| **Factory** | `LedgerTransportFactory`, `LedgerSettingsFactory` |
| **Command/Event** | Асинхронная обработка через Transport |
| **Observer** | WebSocket подписки на события блокчейна |
| **Strategy** | `LedgerBatchChecker` extends `LedgerStateChecker` |
| **Template Method** | `AbstractService` с lifecycle hooks |
| **Adapter** | `LedgerApiMonitor` адаптирует HLF события к WS |

### Потоки данных

#### Получение блока (REST API)
```
Client → GET /block?hashOrNumber=123&ledgerName=dao
         ↓
LedgerBlockGetController
         ↓
Cache.wrap() ──→ [Cache Hit] → Return cached data
         │                              ↑
    [Cache Miss]                         │
         ↓                               │
DatabaseService.ledgerBlock.query()     │
         ↓                               │
PostgreSQL Query                         │
         ↓                               │
LedgerBlockEntity.toObject() ────────────┘
         ↓
Client ← { value: LedgerBlock }
```

#### Парсинг нового блока (Async)
```
LedgerStateChecker (каждые 3 сек)
         ↓
Transport.send(LedgerStateCheckCommand)
         ↓
LedgerStateCheckHandler.execute()
         ↓
Check HLF for new blocks
         ↓
[New blocks found]
         ↓
Transport.send(LedgerBlockParseCommand)
         ↓
LedgerBlockParseHandler.execute()
         ↓
Fetch block from HLF network
         ↓
Parse events & transactions
         ↓
Save to PostgreSQL
         ↓
Transport.dispatch(LedgerBlockParsedEvent)
         ↓
LedgerApiMonitor.blockParsed()
         ↓
WebSocket.emit('LEDGER_BLOCK_PARSED')
         ↓
All connected clients receive update
```

---

## 📦 Установка

### Требования
- Node.js >= 14.x
- npm >= 6.x
- PostgreSQL >= 11.4
- Docker & Docker Compose (опционально)

### Шаг 1: Клонирование репозитория
```bash
git clone <repository-url>
cd hlf-explorer-new/backend
```

### Шаг 2: Установка зависимостей
```bash
npm install
```

### Шаг 3: Настройка окружения
Создайте файл с переменными окружения:

```bash
# Для development
cp .env.example .env

# Для Docker
cp docker/.env.example docker/.env
```

### Шаг 4: Настройка базы данных
```bash
# Создайте базу данных PostgreSQL
createdb hlf_explorer

# Миграции запустятся автоматически при старте
```

### Шаг 5: Настройка Ledgers
Создайте файл `ledgers.json` с конфигурацией ваших HLF сетей:

```json
{
  "ledgers": [
    {
      "uid": "dao",
      "batch": true,
      "connectionProfile": "./data/local/dao/connection.json",
      "identity": {
        "cert": "./data/local/dao/User1@org1.example.com-cert.pem",
        "key": "./data/local/dao/priv_sk"
      }
    }
  ]
}
```

---

## ⚙️ Конфигурация

### Переменные окружения

#### Основные настройки
```bash
# Web Server
WEB_PORT=3000
WEB_HOST=localhost

# Database
POSTGRES_DB_HOST=localhost
POSTGRES_DB_PORT=5432
POSTGRES_DB=hlf_explorer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Ledgers
LEDGERS_SETTINGS_PATH=./data/local/ledgers.json

# Logging
LOGGER_LEVEL=ALL
IS_SYSTEM_LOGS_ENABLED=false

# SSL (опционально)
SSL_CA=<certificate-content>
```

#### Database настройки (docker/.env)
```bash
POSTGRES_USER=hlf_explorer
POSTGRES_PASSWORD=hlf_explorer_password
POSTGRES_DB=hlf_explorer
```

### Конфигурация TypeORM

TypeORM настраивается автоматически через `AppModule.getOrmConfig()`:
- Синхронизация: отключена (используются миграции)
- Logging: отключено в production
- Entities: автоматический поиск `**/*Entity.{ts,js}`
- Migrations: автоматический запуск при старте

---

## 🎯 Использование

### Development режим

```bash
# Запуск с автоперезагрузкой
npm run start

# Через корневой package.json
npm start

# Или через вложенный API пакет
cd src/packages/application/api
npm run start:dev
```

Сервер запустится на `http://localhost:3000`

### Production режим

```bash
# 1. Собрать проект
npm run build

# 2. Запустить скомпилированный код
cd src/packages/application/api/build
node main.js
```

### Docker режим

```bash
# 1. Собрать образ
npm run api:docker:image:build

# 2. Запустить через docker-compose
docker-compose up -d

# 3. Просмотр логов
docker-compose logs -f hlf-explorer-api

# 4. Остановка
docker-compose down
```

Docker-compose запускает:
- `hlf-explorer-api` - Backend API (порт 3000)
- `hlf-explorer-db` - PostgreSQL (порт 35432)

### Database миграции

```bash
# Запустить миграции
cd src/packages/application/api
npm run migration:run

# Сбросить схему (ОСТОРОЖНО!)
npm run schema:drop

# Полный сброс и миграция
npm run reset
```

---

## 📡 API Endpoints

### Swagger документация
После запуска доступна по адресу: `http://localhost:3000/api`

### Ledgers

#### Получить список ledger'ов
```http
GET /ledgers
```

**Ответ:**
```json
[
  {
    "id": 1,
    "name": "dao",
    "blockHeight": 1523,
    "blockHeightParsed": 1523,
    "blockFrequency": 3000,
    "isBatch": true
  }
]
```

#### Получить ledger по имени
```http
GET /ledger?name=dao
```

### Blocks

#### Получить список блоков
```http
GET /blocks?ledgerName=dao&pageSize=10&pageIndex=0
```

**Query параметры:**
- `ledgerName` - имя ledger
- `pageSize` - размер страницы (default: 25)
- `pageIndex` - номер страницы (default: 0)
- `sort` - сортировка, например `{"number":"DESC"}`
- `conditions` - фильтры

**Ответ:**
```json
{
  "items": [
    {
      "id": 1523,
      "number": 1522,
      "hash": "abc123...",
      "date": "2024-01-20T10:30:00.000Z",
      "transactionsCount": 5,
      "eventsCount": 3
    }
  ],
  "pageSize": 10,
  "pageIndex": 0,
  "pages": 153,
  "total": 1523
}
```

#### Получить блок по номеру или хешу
```http
GET /block?ledgerName=dao&hashOrNumber=1522
```

**Ответ:**
```json
{
  "value": {
    "id": 1523,
    "number": 1522,
    "hash": "abc123...",
    "date": "2024-01-20T10:30:00.000Z",
    "transactions": [...],
    "events": [...],
    "data": { /* raw block data */ }
  }
}
```

#### Получить последний блок
```http
GET /block/last?ledgerName=dao
```

### Transactions

#### Получить список транзакций
```http
GET /transactions?ledgerName=dao&pageSize=20
```

**Query параметры:**
- `ledgerName` - имя ledger
- `pageSize`, `pageIndex` - пагинация
- `conditions` - фильтры, например `{"requestName":"UserCreate"}`

**Ответ:**
```json
{
  "items": [
    {
      "id": 5234,
      "uid": "tx_abc123",
      "blockNumber": 1522,
      "requestId": "cmd_123",
      "requestName": "UserCreate",
      "requestUserId": "user_456",
      "validationCode": 0,
      "date": "2024-01-20T10:30:00.000Z"
    }
  ],
  "total": 5234
}
```

#### Получить транзакцию по UID
```http
GET /transaction?ledgerName=dao&uid=tx_abc123
```

### Events

#### Получить список событий
```http
GET /events?ledgerName=dao&pageSize=50
```

**Ответ:**
```json
{
  "items": [
    {
      "id": 3421,
      "uid": "event_xyz789",
      "name": "UserCreated",
      "blockNumber": 1522,
      "transactionId": "tx_abc123",
      "data": {
        "userId": "user_456",
        "name": "John Doe"
      }
    }
  ],
  "total": 3421
}
```

#### Получить событие по UID
```http
GET /event?ledgerName=dao&uid=event_xyz789
```

### Search

#### Поиск по всем сущностям
```http
GET /search?ledgerName=dao&text=UserCreate&pageSize=10
```

**Query параметры:**
- `text` - поисковый запрос
- `ledgerName` - имя ledger
- Стандартные параметры пагинации

**Ответ:** объединенные результаты из блоков, транзакций и событий

### Commands

#### Отправить команду в блокчейн
```http
POST /request
Content-Type: application/json

{
  "ledgerName": "dao",
  "command": {
    "name": "UserCreate",
    "request": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Ответ:**
```json
{
  "id": "cmd_123",
  "response": {
    "userId": "user_456",
    "status": "created"
  }
}
```

### Reset

#### Сбросить ledger (удалить все блоки)
```http
POST /ledger/reset
Content-Type: application/json

{
  "ledgerName": "dao"
}
```

### Health Check

#### Проверить состояние сервиса
```http
GET /healthcheck
```

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Prometheus метрики
```http
GET /metrics
```

---

## 🔌 WebSocket Events

### Подключение

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected to HLF Explorer');
});
```

### Namespace подписки

Для получения событий конкретного ledger:

```javascript
const daoSocket = io('http://localhost:3000/dao');
```

### События

#### LEDGER_BLOCK_PARSED
Новый блок спарсен и сохранен

```javascript
socket.on('LEDGER_BLOCK_PARSED', (data) => {
  console.log('New block parsed:', data.block);
  // data.ledgerId - ID ledger
  // data.block - полная информация о блоке
});
```

#### LEDGER_STATE_CHANGED
Состояние ledger изменилось

```javascript
socket.on('LEDGER_STATE_CHANGED', (data) => {
  console.log('Ledger state changed:', data);
  // data.ledgerId
  // data.blockHeight
  // data.blockHeightParsed
});
```

#### LEDGER_RESETED
Ledger был сброшен

```javascript
socket.on('LEDGER_RESETED', (data) => {
  console.log('Ledger reseted:', data.ledgerId);
});
```

### Пример React компонента

```typescript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const BlockMonitor = () => {
  const [latestBlock, setLatestBlock] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3000/dao');

    socket.on('LEDGER_BLOCK_PARSED', (data) => {
      setLatestBlock(data.block);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h2>Latest Block</h2>
      {latestBlock && (
        <div>
          <p>Number: {latestBlock.number}</p>
          <p>Hash: {latestBlock.hash}</p>
          <p>Transactions: {latestBlock.transactionsCount}</p>
        </div>
      )}
    </div>
  );
};
```

---

## 📂 Структура проекта

```
backend/
├── docker/                          # Docker конфигурация
│   ├── api/
│   │   ├── Dockerfile              # Dockerfile для API
│   │   └── data/                   # Volume для данных
│   └── .env.example                # Пример переменных окружения
├── src/
│   └── packages/
│       ├── application/
│       │   └── api/                # Точка входа приложения
│       │       ├── main.ts         # Bootstrap
│       │       ├── src/
│       │       │   ├── AppModule.ts        # Главный модуль
│       │       │   ├── AppSettings.ts      # Настройки
│       │       │   └── migration/          # DB миграции
│       │       │       ├── 1611326308664-Ledger.ts
│       │       │       ├── 1611326308665-LedgerBlock.ts
│       │       │       ├── 1611326308666-LedgerBlockRaw.ts
│       │       │       ├── 1611326308667-LedgerBlockTransaction.ts
│       │       │       └── 1611326308668-LedgerBlockEvent.ts
│       │       ├── data/                   # Конфигурация HLF
│       │       │   └── local/
│       │       │       ├── ledgers.json    # Настройки ledgers
│       │       │       └── [ledger]/       # Credentials
│       │       ├── package.json
│       │       └── ormconfig.migration.ts
│       └── module/                 # Бизнес-модули
│           ├── core/               # Базовые утилиты
│           │   ├── AbstractService.ts
│           │   └── TransformGroup.ts
│           ├── database/           # Работа с БД
│           │   ├── database.module.ts
│           │   ├── service/
│           │   │   └── DatabaseService.ts
│           │   ├── ledger/
│           │   │   └── LedgerEntity.ts
│           │   └── block/
│           │       ├── LedgerBlockEntity.ts
│           │       ├── LedgerBlockRawEntity.ts
│           │       ├── LedgerBlockTransactionEntity.ts
│           │       └── LedgerBlockEventEntity.ts
│           ├── ledger/             # Бизнес-логика блокчейна
│           │   ├── ledger.module.ts
│           │   ├── controller/     # REST контроллеры
│           │   │   ├── LedgerListController.ts
│           │   │   ├── LedgerGetController.ts
│           │   │   ├── LedgerBlockListController.ts
│           │   │   ├── LedgerBlockGetController.ts
│           │   │   ├── LedgerBlockLastGetController.ts
│           │   │   ├── LedgerBlockTransactionListController.ts
│           │   │   ├── LedgerBlockTransactionGetController.ts
│           │   │   ├── LedgerBlockEventListController.ts
│           │   │   ├── LedgerBlockEventGetController.ts
│           │   │   ├── LedgerSearchController.ts
│           │   │   └── LedgerRequestController.ts
│           │   ├── service/        # Сервисы
│           │   │   ├── LedgerService.ts
│           │   │   ├── LedgerStateChecker.ts
│           │   │   ├── LedgerBatchChecker.ts
│           │   │   ├── LedgerApiMonitor.ts
│           │   │   ├── LedgerSettingsFactory.ts
│           │   │   └── LedgerTransportFactory.ts
│           │   └── transport/      # Async обработчики
│           │       ├── LedgerStateCheckCommand.ts
│           │       ├── LedgerBatchCommand.ts
│           │       ├── LedgerBlockParseCommand.ts
│           │       ├── LedgerBlockParsedEvent.ts
│           │       ├── LedgerResetedEvent.ts
│           │       └── handler/
│           │           ├── LedgerStateCheckHandler.ts
│           │           ├── LedgerBatchHandler.ts
│           │           └── LedgerBlockParseHandler.ts
│           ├── socket/             # WebSocket
│           │   ├── socket.module.ts
│           │   ├── service/
│           │   │   ├── TransportSocketServer.ts
│           │   │   └── TransportSocketImpl.ts
│           │   └── handler/
│           │       └── TransportSocketRoomHandler.ts
│           └── healthcheck/        # Health checks
│               ├── healthcheck.module.ts
│               └── controller/
│                   └── HealthcheckController.ts
├── docker-compose.yml              # Docker Compose конфиг
├── Makefile                        # Команды развертывания
├── package.json                    # Root зависимости
├── tsconfig.json                   # TypeScript конфиг
└── README.md                       # Этот файл
```

---

## 💻 Разработка

### Запуск в development режиме

```bash
# С автоматической перезагрузкой
npm run start

# Или через API пакет
cd src/packages/application/api
npm run start:dev
```

### Сборка проекта

```bash
npm run build

# Проверить скомпилированные файлы
ls src/packages/application/api/build/
```

### Работа с миграциями

#### Создание новой миграции
```bash
cd src/packages/application/api
npm run typeorm migration:create -- src/migration/MyNewMigration
```

#### Запуск миграций
```bash
npm run migration:run
```

#### Откат миграции
```bash
npm run typeorm migration:revert -- -d ormconfig.migration.ts
```

### Добавление нового модуля

1. Создайте папку в `src/packages/module/`
2. Создайте `{module}.module.ts`:
```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: []
})
export class MyModule {}
```

3. Импортируйте в `AppModule.ts`:
```typescript
@Module({
  imports: [
    // ...
    MyModule,
  ]
})
export class AppModule {}
```

### Добавление нового API endpoint

1. Создайте контроллер в `module/[module]/controller/`:
```typescript
import { Controller, Get } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';

@Controller('my-endpoint')
export class MyController extends DefaultController {
  @Get()
  async execute() {
    return { message: 'Hello' };
  }
}
```

2. Зарегистрируйте в модуле:
```typescript
@Module({
  controllers: [MyController]
})
```

### Code Style

Проект следует стандартам:
- **Комментарии-разделители** для структурирования классов
- **Наследование** от базовых классов (`DefaultController`, `LoggerWrapper`)
- **Dependency Injection** через конструктор
- **Типизация** всех параметров и возвращаемых значений
- **Async/await** для асинхронных операций

Пример структуры класса:
```typescript
export class MyService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private myProperty: string;

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
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async myMethod(): Promise<void> {
        // Implementation
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private helperMethod(): void {
        // Implementation
    }
}
```

### Тестирование

> **Note:** Проект в настоящее время не содержит тестов. Рекомендуется добавить:

```bash
# Unit тесты
npm install --save-dev @nestjs/testing jest @types/jest

# E2E тесты
npm install --save-dev supertest @types/supertest
```

Пример unit теста:
```typescript
import { Test } from '@nestjs/testing';
import { LedgerService } from './LedgerService';

describe('LedgerService', () => {
  let service: LedgerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LedgerService],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## 🚢 Развертывание

### Docker Deployment

#### 1. Подготовка
```bash
# Создайте .env файл
cp docker/.env.example docker/.env

# Настройте переменные окружения
vim docker/.env
```

#### 2. Сборка образа
```bash
npm run api:docker:image:build
```

#### 3. Запуск
```bash
docker-compose up -d
```

#### 4. Проверка
```bash
# Логи API
docker-compose logs -f hlf-explorer-api

# Логи БД
docker-compose logs -f hlf-explorer-db

# Статус контейнеров
docker-compose ps
```

#### 5. Остановка
```bash
docker-compose down

# С удалением volumes
docker-compose down -v
```

### Production Checklist

- [ ] Настроить переменные окружения
- [ ] Настроить SSL/TLS для PostgreSQL
- [ ] Ограничить CORS (изменить `origin: true` на белый список)
- [ ] Настроить rate limiting
- [ ] Добавить authentication/authorization
- [ ] Настроить reverse proxy (nginx)
- [ ] Настроить мониторинг (Prometheus + Grafana)
- [ ] Настроить backup базы данных
- [ ] Настроить логирование в файл/external service
- [ ] Проверить security headers (helmet)
- [ ] Настроить health checks
- [ ] Оптимизировать database queries (индексы)

### Kubernetes Deployment

Пример базового deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hlf-explorer-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hlf-explorer-api
  template:
    metadata:
      labels:
        app: hlf-explorer-api
    spec:
      containers:
      - name: api
        image: hlf-explorer-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: POSTGRES_DB_HOST
          value: postgres-service
        - name: WEB_PORT
          value: "3000"
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: hlf-explorer-api-service
spec:
  selector:
    app: hlf-explorer-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## 🔧 Troubleshooting

### Проблема: Не могу подключиться к базе данных

**Решение:**
```bash
# Проверьте, что PostgreSQL запущен
docker-compose ps hlf-explorer-db

# Проверьте переменные окружения
cat docker/.env | grep POSTGRES

# Проверьте логи БД
docker-compose logs hlf-explorer-db
```

### Проблема: Миграции не применяются

**Решение:**
```bash
# Запустите миграции вручную
cd src/packages/application/api
npm run migration:run

# Проверьте таблицу миграций
psql -U postgres -d hlf_explorer -c "SELECT * FROM migrations;"
```

### Проблема: WebSocket не подключается

**Решение:**
```bash
# Убедитесь, что используете правильный транспорт
const socket = io('http://localhost:3000', {
  transports: ['websocket']  // Важно!
});

# Проверьте CORS настройки в main.ts
application.enableCors({ origin: true });
```

### Проблема: HLF network недоступна

**Решение:**
```bash
# Проверьте connection.json
cat data/local/dao/connection.json

# Проверьте сертификаты
ls -la data/local/dao/

# Проверьте логи
docker-compose logs -f hlf-explorer-api | grep "Ledger"
```

### Проблема: Высокая нагрузка на БД

**Решение:**
```sql
-- Добавьте индексы для часто запрашиваемых полей
CREATE INDEX idx_ledger_block_number ON ledger_block(number);
CREATE INDEX idx_ledger_block_ledger_id ON ledger_block(ledger_id);
CREATE INDEX idx_transaction_request_name ON ledger_block_transaction(request_name);

-- Проверьте slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Проблема: Memory leak

**Решение:**
```bash
# Включите Node.js профилирование
node --max-old-space-size=4096 --inspect main.js

# Мониторинг памяти через Prometheus
curl http://localhost:3000/metrics | grep nodejs_heap
```

---

## 🤝 Contributing

Мы приветствуем вклад в проект!

### Процесс контрибуции

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Coding Standards

- Следуйте существующему code style
- Добавляйте комментарии для сложной логики
- Используйте TypeScript типы везде
- Пишите тесты для новой функциональности
- Обновляйте документацию

### Приоритетные улучшения

1. **Testing** - добавить unit и e2e тесты
2. **Security** - улучшить authentication и authorization
3. **Performance** - оптимизация запросов к БД
4. **Documentation** - добавить TypeDoc комментарии
5. **Monitoring** - расширить метрики Prometheus

---

## 📄 License

ISC License

Copyright (c) 2024 Renat Gubaev

---

## 👥 Авторы

**Renat Gubaev**
- Email: renat.gubaev@gmail.com
- GitHub: [@renatgubaev](https://github.com/renatgubaev)

---

## 🙏 Благодарности

- [NestJS](https://nestjs.com/) - за отличный фреймворк
- [Hyperledger Fabric](https://www.hyperledger.org/use/fabric) - за блокчейн платформу
- [TypeORM](https://typeorm.io/) - за удобную ORM

---

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [Troubleshooting](#-troubleshooting) секцию
2. Поищите в [Issues](https://github.com/your-repo/issues)
3. Создайте новый Issue с детальным описанием проблемы

---

**Версия:** 2.0.0
**Последнее обновление:** Январь 2024
