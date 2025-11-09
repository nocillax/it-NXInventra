import {
  ConflictException,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google.guard';
import { GithubAuthGuard } from './guards/github.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setJwtCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req, @Res() res: Response) {
    try {
      const token = this.authService.login(req.user);
      this.setJwtCookie(res, token);
      res.redirect(this.configService.get<string>('FRONTEND_URL')!);
    } catch (error) {
      console.error('Google OAuth error:', error);

      // Handle the provider conflict error specifically
      if (error instanceof ConflictException) {
        const errorMessage = encodeURIComponent(error.message);
        res.redirect(
          `${this.configService.get<string>('FRONTEND_URL')}/login?error=${errorMessage}`,
        );
      } else {
        // Handle other errors
        const errorMessage = encodeURIComponent(
          'Authentication failed. Please try again.',
        );
        res.redirect(
          `${this.configService.get<string>('FRONTEND_URL')}/login?error=${errorMessage}`,
        );
      }
    }
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubLoginCallback(@Req() req, @Res() res: Response) {
    try {
      const token = this.authService.login(req.user);
      this.setJwtCookie(res, token);
      res.redirect(this.configService.get<string>('FRONTEND_URL')!);
    } catch (error) {
      console.error('GitHub OAuth error:', error);

      // Handle the provider conflict error specifically
      if (error instanceof ConflictException) {
        const errorMessage = encodeURIComponent(error.message);
        res.redirect(
          `${this.configService.get<string>('FRONTEND_URL')}/login?error=${errorMessage}`,
        );
      } else {
        // Handle other errors
        const errorMessage = encodeURIComponent(
          'Authentication failed. Please try again.',
        );
        res.redirect(
          `${this.configService.get<string>('FRONTEND_URL')}/login?error=${errorMessage}`,
        );
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  @Public()
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res
      .status(200)
      .json({ success: true, message: 'Logged out successfully' });
  }
}
