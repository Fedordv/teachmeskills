import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('user-created') 
  handleUserCreated(data: any) {
    console.log(`Sending welcome email to ${data.email}`)
  }

}
