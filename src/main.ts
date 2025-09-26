/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvValidation } from 'src/utils/env.validation';
import { ValidationPipe } from '@nestjs/common';
import { AppEnum } from 'src/utils/config/app.config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  EnvValidation.validate();
  console.log('Server Starting up....');
  const port = AppEnum.PORT;
  console.log(`=>     http://localhost:${port}`);
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors(AppEnum.CORS_OPTIONS);
  app.use(helmet(AppEnum.HELMET_OPTIONS));
  app.use(cookieParser());

  await app.listen(port);
  if (EnvValidation.isDevelopment()) {
    console.log('Server running in development mode');
  } else {
    console.log('Server running in production mode');
  }
}
bootstrap();
