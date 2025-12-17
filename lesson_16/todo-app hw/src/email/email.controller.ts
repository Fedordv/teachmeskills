import { Controller, Post, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('email')
export class EmailController {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue,
  ) {}

  @Post('welcome')
  async sendWelcome(@Body('email') email: string) {
    await this.emailQueue.add('send-welcome', {
      email,
    });

    return {
      status: 'queued',
      email,
    };
  }
}
