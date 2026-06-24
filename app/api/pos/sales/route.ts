import { NextRequest, NextResponse } from 'next/server';

import { requireApiContext } from '@/lib/api/context';
import { fail } from '@/lib/api/response';
import { prisma } from '@/lib/db/prisma';
import { createSaleSchema } from '@/modules/pos/schemas/pos.schema';
import { PosService } from '@/modules/pos/services/pos.service';

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireApiContext({ moduleId: 'pos' });

    if (!ctx.branchId) {
      return NextResponse.json(
        { error: 'Sucursal requerida para procesar venta' },
        { status: 400 },
      );
    }

    const body = await req.json();
    const validatedPayload = createSaleSchema.parse(body);
    const sale = await PosService.executeSale(
      ctx.tenantId,
      ctx.branchId,
      ctx.userId,
      validatedPayload,
    );

    return NextResponse.json({ data: sale }, { status: 201 });
  } catch (error: any) {
    if (error.message && error.message.startsWith('INSUFFICIENT_STOCK_')) {
      return NextResponse.json(
        { error: 'Stock insuficiente para procesar la venta.' },
        { status: 409 },
      );
    }

    console.error('[POS_SALE_ERROR]', error);
    return fail(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireApiContext({ moduleId: 'pos' });
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const where = {
      tenantId: ctx.tenantId,
      ...(ctx.branchId ? { branchId: ctx.branchId } : {}),
    };

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paidAt: 'desc' },
        include: { items: true },
      }),
      prisma.sale.count({ where }),
    ]);

    return NextResponse.json(
      {
        data: sales,
        meta: { total, page, limit },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[POS_GET_ERROR]', error);
    return fail(error);
  }
}
