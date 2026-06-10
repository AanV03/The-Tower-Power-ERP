import { NextRequest, NextResponse } from 'next/server';
import { createSaleSchema } from '@/modules/pos/schemas/pos.schema';
import { PosService } from '@/modules/pos/services/pos.service';
import { prisma } from '@/lib/db/prisma'; 

export async function POST(req: NextRequest) {
  try {
    const ctx = {
      tenantId: req.headers.get('x-tenant-id') || 'tenant-falso-123',
      branchId: 'sucursal-falsa-123',
      user: { id: 'cajero-falso-123' }
    };

    if (!ctx.tenantId) {
      return NextResponse.json({ error: 'Tenant context missing' }, { status: 401 });
    }

    const body = await req.json();
    const validatedPayload = createSaleSchema.parse(body);

    const sale = await PosService.executeSale(
      ctx.tenantId,
      ctx.branchId,
      ctx.user.id,
      validatedPayload
    );


    return NextResponse.json({ data: sale }, { status: 201 });


  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 });
    }

    if (error.message && error.message.startsWith('INSUFFICIENT_STOCK_')) {
      return NextResponse.json({ error: 'Stock insuficiente para procesar la venta.' }, { status: 409 });
    }

    console.error('[POS_SALE_ERROR]', error);
    return NextResponse.json({ error: 'Error interno en la transacción.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || 'tenant-falso-123';
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Contexto de gimnasio no encontrado' }, { status: 401 });
    }

    
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    
    const sales = await prisma.sale.findMany({
      where: { tenantId },
      skip,
      take: limit,
      orderBy: { paidAt: 'desc' },
      include: {
        items: true 
      }
    });

    const total = await prisma.sale.count({ where: { tenantId } });

    
    return NextResponse.json({
      data: sales,
      meta: { total, page, limit }
    }, { status: 200 });

  } catch (error) {
    console.error('[POS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Error al obtener el historial de ventas' }, { status: 500 });
  }
}


