import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Insurance Backend running on http://localhost:${port}/api`);
  console.log(`📊 Status: http://localhost:${port}/api/status`);
  console.log(`💱 Rate: http://localhost:${port}/api/exchange-rate`);
  console.log(`🏥 Health: http://localhost:${port}/api/health/*`);
  console.log(`❤️ Life: http://localhost:${port}/api/life/*`);
}
bootstrap();
