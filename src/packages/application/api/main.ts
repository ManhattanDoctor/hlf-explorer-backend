import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DefaultLogger } from '@ts-core/backend-nestjs';
import { AllErrorFilter, ExtendedErrorFilter, HttpExceptionFilter, ValidationExceptionFilter } from '@ts-core/backend-nestjs';
import { DateUtil } from '@ts-core/common';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './src/AppModule';
import { AppSettings } from './src/AppSettings';
import { swagger } from './swagger';

async function bootstrap(): Promise<void> {
    let settings = new AppSettings();
    let logger = (settings.logger = new DefaultLogger(settings.loggerLevel));

    let application = await NestFactory.create(AppModule.forRoot(settings), { logger });
    application.useLogger(logger);

    application.use(helmet());
    application.use(compression());
    application.enableCors({ origin: true });
    application.useGlobalPipes(new ValidationPipe({ transform: true }));
    application.useGlobalFilters(new AllErrorFilter(new ValidationExceptionFilter(), new ExtendedErrorFilter(), new HttpExceptionFilter()));

    const server = application.getHttpServer();
    server.setTimeout(10 * DateUtil.MILLISECONDS_MINUTE);

    await swagger(logger, application);

    await application.listen(settings.webPort);
    logger.log(`Listening "${settings.webPort}" port`);
}

bootstrap();
