import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { MailerModule } from '@nest-modules/mailer';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { TestsModule } from './tests/tests.module';
import { SubsModule } from './subs/subs.module';
import { ResultsModule } from './results/results.module';
import { CommentsModule } from './comments/comments.module';
import { RatesModule } from './rates/rates.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_DATABASE_URL'),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          secure: true,
          logger: true,
          debugger: true,
          sercureConnection: false,
          auth: {
            user: 'dinhphamcanh@gmail.com',
            pass: 'gsfa mxmh ezpw idwn',
          },
          tls: {
            rejectUnAuthorized: true,
          },
        },
        defaults: {
          from: `Course`,
        },
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    TestsModule,
    SubsModule,
    ResultsModule,
    CommentsModule,
    RatesModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: '/api/auth/register',
          method: RequestMethod.POST,
        },
        {
          path: '/api/auth/login',
          method: RequestMethod.POST,
        },
        {
          path: '/api/subjects',
          method: RequestMethod.GET,
        },
        {
          path: '/api/courses/(.*)',
          method: RequestMethod.GET,
        },
        {
          path: '/api/courses',
          method: RequestMethod.GET,
        },
        {
          path: '/api/schedules/find',
          method: RequestMethod.POST,
        },
        {
          path: '/api/schedules',
          method: RequestMethod.GET,
        },
      )
      .forRoutes('*');
  }
}
