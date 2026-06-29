import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.use(helmet());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://10.0.2.2:3000',
      'https://devflowai.vercel.app',
      'https://dev-flow-ai-five.vercel.app',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `🚀 Backend running on http://localhost:${process.env.PORT ?? 3001}`,
  );
}
bootstrap().catch((err) => console.error(err));
