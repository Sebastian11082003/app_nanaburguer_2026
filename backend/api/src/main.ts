import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string[]>('CORS_ORIGINS', [
    'http://localhost:3001',
  ]);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // helmet must be registered BEFORE useStaticAssets: Express's static
  // handler ends the request itself, so any middleware registered after
  // it never runs for /uploads/* responses.
  app.use(
    helmet({
      // Frontend (localhost:3001) and API (localhost:3000) are different
      // origins, so the default 'same-origin' policy would silently block
      // <img src="http://localhost:3000/uploads/..."> for restaurant logos.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Uploaded assets (restaurant logos, etc). Served as plain static files
  // under /uploads/*, matching the `logoUrl` values saved by RestaurantController.
  //
  // Deliberately `process.cwd()`, NOT `__dirname`: Nest's `--watch` dev
  // server bundles everything in-memory via webpack, where `__dirname`
  // does not resolve to the real project folder on disk. `process.cwd()`
  // is the directory the process was started from (`backend/api`), which
  // also matches the relative `./uploads/logos` path multer writes to.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT', 3000);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NanaBurger API')
    .setDescription('Documentación interactiva de la API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);

  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger running on http://localhost:${port}/api`);
}

bootstrap();
