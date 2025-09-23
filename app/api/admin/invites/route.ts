import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq, isNotNull, ne, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar todos os convites (sem filtros no backend)
    const allInvites = await db
      .select({
        id: invites.id,
        nameOnInvite: invites.nameOnInvite,
        ddi: invites.ddi,
        phone: invites.phone,
        group: invites.group,
        observation: invites.observation,
        code: invites.code,
      })
      .from(invites)
      .orderBy(invites.nameOnInvite);

    // Buscar grupos únicos para o filtro
    const uniqueGroups = await db
      .selectDistinct({ group: invites.group })
      .from(invites)
      .where(and(isNotNull(invites.group), ne(invites.group, '')))
      .orderBy(invites.group);

    // Para cada convite, buscar os convidados
    const invitesData = await Promise.all(
      allInvites.map(async (invite) => {
        const guestsList = await db
          .select()
          .from(guests)
          .where(eq(guests.inviteId, invite.id));

        const confirmedCount = guestsList.filter(guest => guest.confirmed).length;

        return {
          ...invite,
          guests: guestsList,
          confirmedCount,
          totalGuests: guestsList.length,
        };
      })
    );

    // Buscar todos os convidados para estatísticas globais
    const allGuests = await db.select().from(guests);
    
    const totalInvites = allInvites.length;
    const totalGuests = allGuests.length;
    const confirmedGuests = allGuests.filter(guest => guest.confirmed).length;
    const cancelledGuests = allGuests.filter(guest => guest.status === 'Cancelado').length;
    const confirmationRate = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0;

    const stats = {
      totalInvites,
      totalGuests,
      confirmedGuests,
      cancelledGuests,
      confirmationRate,
    };

    return NextResponse.json({
      invites: invitesData,
      stats,
      availableGroups: uniqueGroups.map(g => g.group).filter(Boolean),
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Erro ao buscar convites:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
