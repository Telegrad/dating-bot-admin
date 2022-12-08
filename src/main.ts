import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import ServerConfig from './common/config/server';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function setupSwagger(app: INestApplication): Promise<void> {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule);

  app.enableCors();
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        console.log(errors);
        return errors;
      },
    }),
  );

  const { port } = app.get(ServerConfig);

  await setupSwagger(app);

  await app.listen(port, () => {
    Logger.log(`Listening on ${port} port`);
  });
}
bootstrap();
