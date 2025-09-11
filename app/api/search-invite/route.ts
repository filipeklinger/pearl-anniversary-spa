import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq, or, ilike } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json();
    
    if (!searchTerm || typeof searchTerm !== 'string') {
      return NextResponse.json(
        { error: 'Termo de busca é obrigatório' },
        { status: 400 }
      );
    }

    const term = searchTerm.trim();
    
    // Buscar convite por nome ou telefone
    const foundInvites = await db
      .select()
      .from(invites)
      .where(
        or(
          ilike(invites.nameOnInvite, `%${term}%`),
          ilike(invites.phone, `%${term}%`)
        )
      )
      .limit(5); // Limitar a 5 resultados para não sobrecarregar

    if (foundInvites.length === 0) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Para cada convite encontrado, buscar os convidados
    const invitesWithGuests = await Promise.all(
      foundInvites.map(async (invite) => {
        const guestsList = await db
          .select()
          .from(guests)
          .where(eq(guests.inviteId, invite.id));

        return {
          id: invite.id,
          nameOnInvite: invite.nameOnInvite,
          phone: invite.phone,
          guests: guestsList.map(guest => ({
            id: guest.id,
            fullName: guest.fullName,
            confirmed: guest.confirmed,
          })),
        };
      })
    );

    return NextResponse.json({
      invites: invitesWithGuests,
    });

  } catch (error) {
    console.error('Erro ao buscar convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
