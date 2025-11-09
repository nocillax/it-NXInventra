import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private configService: ConfigService) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const response = context.switchToHttp().getResponse();
      const frontendUrl = this.configService.get('FRONTEND_URL');
      const errorMessage = encodeURIComponent(
        err?.message || 'Authentication failed',
      );

      response.redirect(`${frontendUrl}/login?error=${errorMessage}`);
      return null;
    }
    return user;
  }
}
