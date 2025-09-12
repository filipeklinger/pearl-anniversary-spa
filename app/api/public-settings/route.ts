import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Buscar a configuração de data limite
    const confirmationDeadlineSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, 'confirmationDeadline'))
      .limit(1);

    const confirmationDeadline = confirmationDeadlineSetting.length > 0 
      ? confirmationDeadlineSetting[0].value 
      : null;

    return NextResponse.json({
      confirmationDeadline: confirmationDeadline || null,
    });

  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}