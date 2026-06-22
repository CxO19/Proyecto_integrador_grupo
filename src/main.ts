import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Mi API en NestJS')
    .setDescription('Documentación detallada de los endpoints de la API')
    .setVersion('1.0')
    .addTag('usuarios')
    .build();

  // Crear el documento con la configuración anterior
  const document = SwaggerModule.createDocument(app, config);

  // Ruta donde se servirá la documentación (ej: http://localhost:3000/api)
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
