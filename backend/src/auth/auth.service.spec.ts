import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const passwordHash = bcrypt.hashSync('Correct1pass', 4);
  const baseUser = {
    id: 'u1',
    email: 'keeper@playhouse.co.ke',
    passwordHash,
    fullName: 'Keeper',
    role: 'STOREKEEPER',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let prisma: any;
  let jwt: { sign: ReturnType<typeof vi.fn> };
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn(), update: vi.fn() },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
      $transaction: vi.fn().mockResolvedValue([]),
    };
    jwt = { sign: vi.fn().mockReturnValue('signed-token') };
    service = new AuthService(prisma, jwt as any);
  });

  it('logs in with valid credentials and never returns the hash', async () => {
    prisma.user.findUnique.mockResolvedValue(baseUser);
    const result = await service.login({ email: 'KEEPER@playhouse.co.ke ', password: 'Correct1pass' });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'keeper@playhouse.co.ke' } });
    expect(result.accessToken).toBe('signed-token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(jwt.sign).toHaveBeenCalledWith({ sub: 'u1', email: baseUser.email, role: 'STOREKEEPER' });
  });

  it('rejects a wrong password and an unknown e-mail with the same message', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(baseUser);
    const wrongPassword = await service.login({ email: baseUser.email, password: 'nope' }).catch((e) => e);

    prisma.user.findUnique.mockResolvedValueOnce(null);
    const unknownUser = await service.login({ email: 'x@y.com', password: 'nope' }).catch((e) => e);

    expect(wrongPassword).toBeInstanceOf(UnauthorizedException);
    expect(unknownUser).toBeInstanceOf(UnauthorizedException);
    expect(wrongPassword.message).toBe(unknownUser.message);
  });

  it('does not reveal a disabled account to someone with the wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...baseUser, status: 'DISABLED' });
    const error = await service.login({ email: baseUser.email, password: 'wrong' }).catch((e) => e);
    expect(error.message).toBe('Invalid email or password');
  });

  it('blocks a disabled account that supplies the right password', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...baseUser, status: 'DISABLED' });
    await expect(service.login({ email: baseUser.email, password: 'Correct1pass' })).rejects.toThrow(/disabled/i);
  });

  it('refuses to refresh the session of a disabled user', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...baseUser, status: 'DISABLED' });
    await expect(service.refreshToken('u1')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  describe('changePassword', () => {
    it('requires the correct current password', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      await expect(
        service.changePassword('u1', { currentPassword: 'bad', newPassword: 'Another1pass' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects reusing the same password', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      await expect(
        service.changePassword('u1', { currentPassword: 'Correct1pass', newPassword: 'Correct1pass' }),
      ).rejects.toThrow(/different/);
    });

    it('stores a new hash and writes an audit entry', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      const result = await service.changePassword('u1', {
        currentPassword: 'Correct1pass',
        newPassword: 'Brandnew2pass',
      });
      expect(result.message).toMatch(/changed/i);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
