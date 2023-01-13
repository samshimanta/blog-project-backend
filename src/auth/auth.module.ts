import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt'
import { AuthService } from './auth.service';

@Module({
    imports:[
        JwtModule.registerAsync({
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '60s' },
              }),
        })
    ],
    providers: [AuthService],
    exports:[AuthService]
})
export class AuthModule {}
