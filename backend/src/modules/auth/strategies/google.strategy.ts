import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { UserProfile } from '../../user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: `${configService.get<string>('API_BASE_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, name, emails, displayName } = profile;

    if (!emails || emails.length === 0 || !emails[0].value) {
      throw new UnauthorizedException(
        'Google profile did not return an email.',
      );
    }

    if (!name) {
      throw new UnauthorizedException('Google profile did not return a name.');
    }

    const userProfile: UserProfile = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      name: displayName || `${name.givenName} ${name.familyName}`,
    };

    return this.authService.validateUser(userProfile);
  }
}
