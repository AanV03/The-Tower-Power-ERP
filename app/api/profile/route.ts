import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { ok, fail, ApiError } from "@/lib/api/response";
import { requireApiContext } from "@/lib/api/context";

const UpdateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(30).optional().nullable(),
  image: z.string().url().or(z.string().length(0)).optional().nullable(),
});

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const context = await requireApiContext();
    const body = await request.json();
    const data = UpdateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      include: { employee: true },
    });

    if (!user) {
      throw new ApiError("User not found", 404, "USER_NOT_FOUND");
    }

    // Automatically compute full display name from first and last name
    const computedFullName = `${data.firstName} ${data.lastName}`.trim();

    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Update user model
      const userUpdateData: any = {
        name: computedFullName,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };
      if (data.image !== undefined) userUpdateData.image = data.image;

      const updated = await tx.user.update({
        where: { id: context.userId },
        data: userUpdateData,
      });

      // 2. Synchronize with Employee model if linked
      if (user.employeeId) {
        await tx.employee.update({
          where: { id: user.employeeId },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
        });
      }

      return updated;
    });

    return ok({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
    });
  } catch (error) {
    return fail(error);
  }
}
