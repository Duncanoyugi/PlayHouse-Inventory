import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BCRYPT_ROUNDS } from '../common/constants';
import { buildPage, normalizePagination } from '../common/utils/pagination';

const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, actorId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          role: dto.role,
          status: dto.status ?? UserStatus.ACTIVE,
        },
        select: USER_SELECT,
      });
      await this.audit(tx, actorId, 'USER_CREATE', user.id, { email: user.email, role: user.role });
      return user;
    });
  }

  async findAll(pageInput?: number, limitInput?: number) {
    const { page, limit, skip } = normalizePagination(pageInput, limitInput);
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      this.prisma.user.count(),
    ]);
    return buildPage(items, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const losesAdminAccess =
      (dto.role !== undefined && dto.role !== Role.ADMIN) ||
      (dto.status !== undefined && dto.status === UserStatus.DISABLED);

    if (user.role === Role.ADMIN && losesAdminAccess) {
      if (id === actorId) {
        throw new ForbiddenException('You cannot demote or disable your own account');
      }
      await this.assertNotLastAdmin(id);
    }

    if (dto.email && dto.email !== user.email) {
      const taken = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (taken) throw new ConflictException('Email already in use');
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id }, data, select: USER_SELECT });
      await this.audit(
        tx,
        actorId,
        'USER_UPDATE',
        id,
        {
          fields: Object.keys(data).map((k) => (k === 'passwordHash' ? 'password' : k)),
          role: updated.role,
          status: updated.status,
        },
        { role: user.role, status: user.status },
      );
      return updated;
    });
  }

  /** Users are never hard-deleted (their history must stay attributable): they are disabled. */
  remove(id: string, actorId: string) {
    return this.setStatus(id, UserStatus.DISABLED, actorId, 'USER_DISABLE');
  }

  disable(id: string, actorId: string) {
    return this.setStatus(id, UserStatus.DISABLED, actorId, 'USER_DISABLE');
  }

  enable(id: string, actorId: string) {
    return this.setStatus(id, UserStatus.ACTIVE, actorId, 'USER_ENABLE');
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  // ------------------------------------------------------------------

  private async setStatus(id: string, status: UserStatus, actorId: string, action: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (status === UserStatus.DISABLED) {
      if (id === actorId) throw new ForbiddenException('You cannot disable your own account');
      if (user.role === Role.ADMIN) await this.assertNotLastAdmin(id);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id }, data: { status }, select: USER_SELECT });
      await this.audit(tx, actorId, action, id, { email: user.email, status });
      return updated;
    });
  }

  private async assertNotLastAdmin(excludingId: string) {
    const others = await this.prisma.user.count({
      where: { role: Role.ADMIN, status: UserStatus.ACTIVE, id: { not: excludingId } },
    });
    if (others === 0) {
      throw new BadRequestException('At least one active manager account must remain');
    }
  }

  private audit(
    tx: Prisma.TransactionClient,
    actorId: string,
    action: string,
    entityId: string,
    newValue: Prisma.InputJsonValue,
    oldValue?: Prisma.InputJsonValue,
  ) {
    return tx.auditLog.create({
      data: { userId: actorId, action, entity: 'User', entityId, newValue, oldValue },
    });
  }
}
