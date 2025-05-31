import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `🚀 Server is running on http://localhost:${process.env.PORT ?? 3001}`,
  );
  console.log(`🚀 Insurance Backend running on http://localhost:${process.env.PORT}/api`);
  console.log(`📊 Status: http://localhost:${process.env.PORT}/api/status`);
  console.log(`💱 Rate: http://localhost:${process.env.PORT}/api/exchange-rate`);
  console.log(`🏥 Health: http://localhost:${process.env.PORT}/api/health/*`);
  console.log(`❤️ Life: http://localhost:${process.env.PORT}/api/life/*`);