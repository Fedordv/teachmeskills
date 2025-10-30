import { Injectable } from '@nestjs/common';

@Injectable()
export class Config {}
export const APP_CONFIG = {
  debug: true, 
};
