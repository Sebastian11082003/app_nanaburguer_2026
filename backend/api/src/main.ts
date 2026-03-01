import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Basic security baseline
  app.use(helmet());

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(` API running on http://localhost:${port}`);
}
bootstrap();
