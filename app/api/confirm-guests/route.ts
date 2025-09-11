import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guests } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { guestIds } = await request.json();
    
    if (!guestIds || !Array.isArray(guestIds)) {
      return NextResponse.json(
        { error: 'IDs dos convidados são obrigatórios' },
        { status: 400 }
      );
    }

    // Primeiro, resetar todas as confirmações para os convidados do mesmo convite
    // Para isso, precisamos buscar o inviteId de um dos convidados
    if (guestIds.length > 0) {
      const firstGuest = await db
        .select({ inviteId: guests.inviteId })
        .from(guests)
        .where(eq(guests.id, guestIds[0]))
        .limit(1);

      if (firstGuest.length > 0) {
        const inviteId = firstGuest[0].inviteId;
        
        // Resetar todas as confirmações para este convite
        await db
          .update(guests)
          .set({ 
            confirmed: false,
            updatedAt: new Date()
          })
          .where(eq(guests.inviteId, inviteId));
      }
    }

    // Confirmar apenas os convidados selecionados
    if (guestIds.length > 0) {
      await db
        .update(guests)
        .set({ 
          confirmed: true,
          updatedAt: new Date()
        })
        .where(inArray(guests.id, guestIds));
    }

    return NextResponse.json(
      { message: 'Confirmação atualizada com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
