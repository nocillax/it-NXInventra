import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
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
  googleLoginCallback(@Req() req, @Res() res: Response) {
    const token = this.authService.login(req.user);
    this.setJwtCookie(res, token);
    res.redirect(this.configService.get<string>('FRONTEND_URL')!);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  githubLoginCallback(@Req() req, @Res() res: Response) {
    const token = this.authService.login(req.user);
    this.setJwtCookie(res, token);
    res.redirect(this.configService.get<string>('FRONTEND_URL')!);
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

  // Optional: GET logout for browser testing
  @Public()
  @Get('logout')
  logoutGet(@Res() res: Response) {
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
