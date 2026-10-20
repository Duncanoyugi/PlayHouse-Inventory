import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, LoginDto } from './dto/login.dto';
import { BCRYPT_ROUNDS } from '../common/constants';

// Compared against when the e-mail is unknown so response time does not reveal
// whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const PROFILE_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    const passwordOk = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }
    // Only reveal the disabled state to someone who proved they know the password.
    if (user.status === 'DISABLED') {
      throw new UnauthorizedException('Your account has been disabled. Contact the manager');
    }

    const accessToken = this.sign(user);
    const { passwordHash: _omit, ...safeUser } = user;

    await this.prisma.auditLog
      .create({ data: { userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id } })
      .catch(() => undefined);

    return { accessToken, user: safeUser };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: PROFILE_SELECT });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  logout() {
    // Stateless JWT: the client discards the token. Endpoint kept for symmetry.
    return { message: 'Logout successful' };
  }

  /** Sliding session: an authenticated user trades a still-valid token for a fresh one. */
  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status === 'DISABLED') throw new UnauthorizedException('Session is no longer valid');
    return { accessToken: this.sign(user) };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from the current one');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.auditLog.create({
        data: { userId, action: 'PASSWORD_CHANGE', entity: 'User', entityId: userId },
      }),
    ]);

    return { message: 'Password changed successfully' };
  }

  private sign(user: { id: string; email: string; role: string }) {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }
}
