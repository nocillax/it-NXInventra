import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
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
}
