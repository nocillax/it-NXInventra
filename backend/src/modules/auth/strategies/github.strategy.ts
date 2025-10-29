import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../auth.service';
import { UserProfile } from '../../user/user.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
      callbackURL: `${configService.get<string>('API_BASE_URL')}/auth/github/callback`,
      scope: ['user:email'],
      // Add this to always force account selection
      passReqToCallback: false,
    });
  }

  // Override to always force fresh authentication
  authorizationParams(): any {
    return {
      prompt: 'select_account', // This forces GitHub to always show account selection
    };
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, username, emails, displayName } = profile;

    if (!emails || emails.length === 0 || !emails[0].value) {
      throw new UnauthorizedException(
        'GitHub profile email is not available or is private.',
      );
    }

    const userProfile: UserProfile = {
      provider: 'github',
      providerId: id,
      email: emails[0].value,
      name: displayName || username || 'GitHub User',
    };

    return this.authService.validateUser(userProfile);
  }
}
