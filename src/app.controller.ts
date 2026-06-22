import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger'; 

@ApiTags('usuarios')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener saludo inicial de prueba' }) 
  getHello(): string {
    return this.appService.getHello();
  }
}
