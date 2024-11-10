import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Chat App')
        .setDescription('The chat app API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config, {
        // giữ lại jwt token trong swagger
    });
    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    app.enableCors();

    //0.0
    await app.listen(3000, '0.0.0.0');
}
bootstrap();
