import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class EmailProcessor {

  @Process('send-welcome')
  async handleWelcome(job: Job) {
    console.log('[EMAIL] Job received:', job.data);

    // искусственная задержка 2 сек
    await new Promise((res) => setTimeout(res, 2000));

    console.log(
      `[EMAIL] Sending welcome email to ${job.data.email}`,
    );

    return { success: true };
  }
}
