import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ALL_ROLES } from '../common/constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Brute-force protection: 8 attempts per minute per IP.
  @Public()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many attempts' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @Roles(...ALL_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user profile' })
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('logout')
  @Roles(...ALL_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  logout() {
    return this.authService.logout();
  }

  @Post('refresh')
  @Roles(...ALL_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue a fresh access token for the current session' })
  refresh(@CurrentUser('id') userId: string) {
    return this.authService.refreshToken(userId);
  }

  @Post('change-password')
  @Roles(...ALL_ROLES)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change own password' })
  changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }
}
