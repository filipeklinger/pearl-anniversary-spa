import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guests } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { guests: guestConfirmations, message, inviteId } = await request.json();
    
    // Suporte ao formato antigo (retrocompatibilidade)
    if (Array.isArray(guestConfirmations) && typeof guestConfirmations[0] === 'number') {
      const guestIds = guestConfirmations;
      
      if (!guestIds || !Array.isArray(guestIds)) {
        return NextResponse.json(
          { error: 'IDs dos convidados são obrigatórios' },
          { status: 400 }
        );
      }

      // Buscar todos os convidados do convite para processar a confirmação/cancelamento
      let allGuestsFromInvite: any[] = [];
      
      if (guestIds.length > 0) {
        // Buscar o inviteId de um dos convidados
        const firstGuest = await db
          .select({ inviteId: guests.inviteId })
          .from(guests)
          .where(eq(guests.id, guestIds[0]))
          .limit(1);

        if (firstGuest.length > 0) {
          const inviteId = firstGuest[0].inviteId;
          
          // Buscar todos os convidados deste convite
          allGuestsFromInvite = await db
            .select()
            .from(guests)
            .where(eq(guests.inviteId, inviteId));
        }
      } else {
        return NextResponse.json(
          { error: 'Pelo menos um convidado deve ser processado' },
          { status: 400 }
        );
      }

      // Processar cada convidado do convite (formato antigo)
      for (const guest of allGuestsFromInvite) {
        if (guestIds.includes(guest.id)) {
          // Convidado foi selecionado (marcado) - CONFIRMAR
          await db
            .update(guests)
            .set({ 
              confirmed: true,
              status: 'Confirmado',
              message: message || null,
              updatedAt: new Date()
            })
            .where(eq(guests.id, guest.id));
        } else {
          // Convidado NÃO foi selecionado - CANCELAR
          await db
            .update(guests)
            .set({ 
              confirmed: false,
              status: 'Cancelado',
              message: null,
              updatedAt: new Date()
            })
            .where(eq(guests.id, guest.id));
        }
      }

      const confirmedCount = guestIds.length;
      const totalGuests = allGuestsFromInvite.length;
      const cancelledCount = totalGuests - confirmedCount;

      return NextResponse.json(
        { 
          message: 'Confirmação atualizada com sucesso',
          summary: {
            confirmed: confirmedCount,
            cancelled: cancelledCount,
            total: totalGuests
          }
        },
        { status: 200 }
      );
    }

    // Novo formato: array de objetos com { id, confirmed }
    if (!guestConfirmations || !Array.isArray(guestConfirmations)) {
      return NextResponse.json(
        { error: 'Dados dos convidados são obrigatórios' },
        { status: 400 }
      );
    }

    // Se não foi fornecido inviteId, buscar pelo primeiro convidado
    let targetInviteId = inviteId;
    if (!targetInviteId && guestConfirmations.length > 0) {
      const firstGuest = await db
        .select({ inviteId: guests.inviteId })
        .from(guests)
        .where(eq(guests.id, guestConfirmations[0].id))
        .limit(1);

      if (firstGuest.length > 0) {
        targetInviteId = firstGuest[0].inviteId;
      }
    }

    if (!targetInviteId) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 400 }
      );
    }

    // Buscar todos os convidados do convite
    const allGuestsFromInvite = await db
      .select()
      .from(guests)
      .where(eq(guests.inviteId, targetInviteId));

    let confirmedCount = 0;
    let cancelledCount = 0;

    // Processar cada convidado
    for (const guestData of guestConfirmations) {
      const { id, confirmed } = guestData;
      
      if (confirmed) {
        confirmedCount++;
        await db
          .update(guests)
          .set({ 
            confirmed: true,
            status: 'Confirmado',
            message: message || null,
            updatedAt: new Date()
          })
          .where(eq(guests.id, id));
      } else {
        cancelledCount++;
        await db
          .update(guests)
          .set({ 
            confirmed: false,
            status: 'Cancelado',
            message: message || null, // Permitir mensagem para cancelamentos também
            updatedAt: new Date()
          })
          .where(eq(guests.id, id));
      }
    }

    const totalGuests = allGuestsFromInvite.length;

    return NextResponse.json(
      { 
        message: 'Confirmação atualizada com sucesso',
        summary: {
          confirmed: confirmedCount,
          cancelled: cancelledCount,
          total: totalGuests
        }
      },
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
