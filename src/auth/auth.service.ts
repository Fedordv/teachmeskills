import { Inject, Injectable } from '@nestjs/common';
import type { AuthModuleOptions } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_OPTIONS') private readonly authOptions: AuthModuleOptions,
  ) {}

  issueToken(userId: string): string {
    const prefix = this.authOptions.tokenPrefix ?? 'Bearer';
    const payload = Buffer.from(
      `${userId}:${this.authOptions.secret}`,
    ).toString('base64');

    return `${prefix} ${payload}`;
  }

  verifyToken(token: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_prefix, encoded] = token.split(' ');
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

    const [userId, secret] = decoded.split(':');

    if (secret !== this.authOptions.secret) {
      throw new Error('invalid token');
    }

    return userId;
  }

  // async assertsTaskOwner(taskId: string, token: string) {
  //   const userId = this.verifyToken(token);
  //   const task = await this.taskService.findOne(taskId);

  //   if (task.ownerId !== userId) {
  //     throw new Error('access denied');
  //   }
  //   return userId;
  // }

  // parseUserIdFromAuthHeader(authHeader?: string): string | null {
  //   if (!authHeader) {
  //     return '';
  //   }
  //   const parts = authHeader.split(' ');
  //   if (parts.length === 2 && parts[0].includes('Bearer')) {
  //     return parts[1];
  //   }
  //   return null;
  // }
  // getUserIdOrThrow(taskId: string, authHeader?: string): string {
  //   const userId = this.parseUserIdFromAuthHeader(authHeader);
  //   if (!userId) {
  //     throw new UnauthorizedException('Invalid token');
  //   }
  //   return userId;
  // }

  // async assertsCanEditTask(taskId: string, authHeader?: string) {
  //   const userId = this.getUserIdOrThrow(taskId, authHeader);

  //   const task = await this.taskService.findOne(taskId);
  //   if (task.ownerId !== userId) {
  //     throw new UnauthorizedException('You are not allowed to edit this task');
  //   }

  //   return { userId, task };
  // }
}
