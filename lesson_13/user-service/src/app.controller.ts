import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import * as request from 'supertest';

interface CreateUserPayload {
  requestId: string;
  name: string;
}
const processedRequests = new Map<string, any>(); 

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

 @MessagePattern('get-user') 
 handleGetUser(@Payload() data: {id: number}) {
  return { id: data.id, name: "John Doe"}
 }

 @EventPattern('user-created')
 handleUserCreated(@Payload() data: any) {
  const { requestId, name} = data;

  console.log('[user-service] create-user recived', data)

  if(processedRequests.has(requestId)) {
    console.log(
      '[user-service] duplicate req, ret cached res',
      requestId,
    );
    return processedRequests.get(requestId)
  }

  if (Math.random() < 0.5) {
    console.log(
      '[user-service], failure, throwin RPC', requestId
    )
    throw new RpcException('user creation ')
  }

  const createdUser = {
    id: Date.now(),
    name,
    createdAt: new Date().toString(),
  };

  processedRequests.set(requestId, createdUser);
  console.log('[user-service] user created success', requestId)

  //this.client.emit('user-created', ...)

  return createdUser;
 }
}
