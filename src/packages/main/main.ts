import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DefaultLogger } from '@ts-core/backend-nestjs/logger';
import { ExtendedErrorFilter } from '@ts-core/backend-nestjs/middleware';
import { HttpExceptionFilter } from '@ts-core/backend-nestjs/middleware';
import { FileUtil } from '@ts-core/backend/file';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as path from 'path';
import * as _ from 'lodash';
import { AppModule } from './src/AppModule';
import { AppSettings } from './src/AppSettings';

async function generateDocs(application: INestApplication): Promise<void> {
    let options = new DocumentBuilder()
        .setTitle('HLF Explorere API')
        .setDescription('The hlf explorer API description')
        .setVersion('1.0')
        .addTag('hlf-explorer')
        .build();
    let document = SwaggerModule.createDocument(application, options);
    SwaggerModule.setup('api', application, document);

    await FileUtil.jsonSave(path.resolve(process.cwd(), 'swagger.json'), document);
}

async function bootstrap(): Promise<void> {
    let settings = new AppSettings();
    let logger = (settings.logger = new DefaultLogger(settings.loggerLevel));

    let application = await NestFactory.create(AppModule.forRoot(settings), { logger });

    application.use(helmet());
    application.use(compression());
    application.useGlobalPipes(new ValidationPipe({ transform: true }));
    application.useGlobalFilters(new ExtendedErrorFilter());
    application.useGlobalFilters(new HttpExceptionFilter());
    application.enableCors();

    // await generateDocs(application);

    await application.listen(settings.webPort);
    logger.log(`Listening "${settings.webPort}" port`);
}

bootstrap();
