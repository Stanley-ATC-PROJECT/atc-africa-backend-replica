import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  JwtAuthGuard,
  JwtAuthGuardFactory,
} from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import { ResponseDto } from 'src/common/dto/response.dto';
import { User, UserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/utils/config/env.enum';
import {
  GLOBAL_COOKIE_OPTIONS,
  SERVER_COOKIE_NAME,
} from 'src/utils/config/constants.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuardFactory(false))
  async register(
    @Body() registerDto: RegisterDto,
    @Req() request: Request,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    // If the user is authenticated and is admin or community manager, approve immediately
    let autoApprove = false;
    if (
      user &&
      (user.role === UserRole.admin || user.role === UserRole.community_manager)
    ) {
      autoApprove = true;
    }
    // is an admin
    if (registerDto.role === UserRole.admin) {
      const adminToken = request.headers['admin-token'];
      if (adminToken !== this.configService.get(ENV.ADMIN_TOKEN)) {
        throw new UnauthorizedException(
          'Invalid admin token',
          'An admin token is required to signup as an admin or community manager ',
        );
      }
    }
    const userResult = await this.authService.register(registerDto, {
      autoApprove,
      admin: user as User,
    });

    // Send initial credentials email with raw password to the user's notification email
    await this.authService.sendInitialCredentials(
      userResult,
      (registerDto as any).password,
    );
    return ResponseDto.createSuccessResponse(
      autoApprove
        ? 'User registered and approved successfully.'
        : 'User registered successfully. Please wait for admin approval.',
      userResult,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    response.cookie(
      SERVER_COOKIE_NAME,
      result.access_token,
      GLOBAL_COOKIE_OPTIONS,
    );
    return ResponseDto.createSuccessResponse('Login successful', {
      user: result.user,
      access_token: result.access_token,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(SERVER_COOKIE_NAME);
    return ResponseDto.createSuccessResponse('Logged out successfully');
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refreshToken(user.id);
    response.cookie(
      SERVER_COOKIE_NAME,
      result.access_token,
      GLOBAL_COOKIE_OPTIONS,
    );
    return ResponseDto.createSuccessResponse(
      'Token refreshed successfully',
      result,
    );
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    const result = await this.authService.requestPasswordReset(
      requestPasswordResetDto,
    );
    return ResponseDto.createSuccessResponse(result.message);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return ResponseDto.createSuccessResponse(result.message);
  }
}
