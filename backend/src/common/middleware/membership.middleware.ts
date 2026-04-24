import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MembershipMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const orgId = req.params.orgId;
    const userId = (req as any).user?.id;

    if (orgId && userId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId,
          },
        },
      });
      (req as any).membership = membership;
    }

    next();
  }
}
