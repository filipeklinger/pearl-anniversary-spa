import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar todos os convites com seus convidados
    const invitesWithGuests = await db
      .select({
        id: invites.id,
        nameOnInvite: invites.nameOnInvite,
        ddi: invites.ddi,
        phone: invites.phone,
        group: invites.group,
        observation: invites.observation,
        code: invites.code,
      })
      .from(invites);

    // Para cada convite, buscar os convidados
    const invitesData = await Promise.all(
      invitesWithGuests.map(async (invite) => {
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

    // Calcular estatísticas
    const totalInvites = invitesData.length;
    const totalGuests = invitesData.reduce((sum, invite) => sum + invite.totalGuests, 0);
    const confirmedGuests = invitesData.reduce((sum, invite) => sum + invite.confirmedCount, 0);
    const confirmationRate = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0;

    const stats = {
      totalInvites,
      totalGuests,
      confirmedGuests,
      confirmationRate,
    };

    return NextResponse.json({
      invites: invitesData,
      stats,
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
