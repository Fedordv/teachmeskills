import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import {JwtService} from "@nestjs/jwt"

@Injectable()
export class TasksJwtTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    const authHeader = request.headers['authorization'];
    const [bearer, token] = authHeader.split(' ');

        if (!authHeader) {
        throw new UnauthorizedException('Token not found');
        }
        
        if (bearer !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid token')
        }

        try {
          const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });

        request['user'] = payload;

        return true;

        } catch (err) {
          throw new UnauthorizedException('Invalid or expired token');
        }
    }
}