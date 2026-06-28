import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplicar filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS habilitado (opcional, descomenta si lo necesitas)
  // app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Aplicación escuchando en puerto ${port}`);
}

bootstrap();