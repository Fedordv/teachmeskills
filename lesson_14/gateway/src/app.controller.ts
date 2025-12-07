import { Body, Controller, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, pipe, retry, throwError } from 'rxjs';
import { randomUUID } from 'crypto'

@Controller()
export class AppController {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}
 
  @Get(':id')
  getUser(@Param('id') id: number) {
    return lastValueFrom(this.client.send('get-user', {id}))
  }

  @Post()
  @HttpCode(201)
  createUser(@Body() body: {name?: string}) {
    // this.client.emit('user-created', {id: Date.now()})
    // return {status: 'ok'};
    const requestId = randomUUID()

    const result = this
      .client.send('create-user', {
        requestId, name: body.name
      })
      .pipe(
        retry(3),
        catchError((err) => {
          console.log('[gateway] create-user failed after retries', {
            error: err?.message ?? err,
            requestId,
        })
          return throwError(
            () => new Error('user service unvailable')
          )
        })
        
      )
      return lastValueFrom(result);
  };

}