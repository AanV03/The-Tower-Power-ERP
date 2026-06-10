import { prisma } from '@/lib/db/prisma';
import { RegisterDTO } from '../schemas/auth.schema';
import bcrypt from 'bcryptjs';

export class AuthService {
  static async registerNewTenant(payload: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (existingUser) {
      throw new Error('EMAIL_IN_USE');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    
    return await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: payload.gymName, status: 'ACTIVE' }
      });

      
      const branch = await tx.branch.create({
        data: { 
          tenantId: tenant.id, 
          name: 'Sucursal Matriz', 
          code: `MAT-${tenant.id.substring(0, 4).toUpperCase()}` 
        }
      });

      
      const role = await tx.role.create({
        data: { 
          tenantId: tenant.id, 
          name: 'OWNER', 
          scope: 'TENANT', 
          description: 'Dueño absoluto del gimnasio' 
        }
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          name: payload.name,
          email: payload.email,
          passwordHash: hashedPassword,
          status: 'ACTIVE'
        }
      });

      await tx.userRole.create({
        data: { userId: user.id, roleId: role.id }
      });

      return {
        tenantId: tenant.id,
        userId: user.id,
        email: user.email,
        gymName: tenant.name
      };
    });
  }
}