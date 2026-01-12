import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { StatusModule } from './status/status.module';
import { LocationGateway } from './location.gateway';

@Module({
  imports: [ConfigModule, StatusModule],
  providers: [LocationGateway],
})
export class APIModule { }
