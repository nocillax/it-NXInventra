import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  constructor(private configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check if this is a "new login" request
    if (request.url.includes('/auth/github/new')) {
      // Add parameter to force login
      (this as any).options = {
        ...(this as any).options,
        prompt: 'login', // This forces GitHub to show login screen
      };
    }

    return super.canActivate(context) as boolean;
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
