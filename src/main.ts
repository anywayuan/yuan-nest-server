import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // 引入管道
import { AppModule } from './app.module';
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor';
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1'); // 设置全局路由前缀
  app.useGlobalFilters(new HttpExceptionFilter()); // 设置全局异常过滤器
  app.useGlobalInterceptors(new TransformInterceptor()); // 设置全局拦截器

  // swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('API Interface')
    .setDescription('The API description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(new ValidationPipe()); // 设置全局管道

  await app.listen(3000);
}
bootstrap();