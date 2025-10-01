import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq, isNotNull, ne, and, sql } from 'drizzle-orm';

// Add this to make the route dynamic
export const dynamic = 'force-dynamic';

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

        // Usar a mesma lógica da API de mensagens para contar confirmações
        const confirmedCount = guestsList.filter(guest => {
          // Se confirmed é true, sempre contar como confirmado (retrocompatibilidade)
          if (guest.confirmed === true) return true;
          // Se confirmed é false/null mas status é 'Confirmado', contar como confirmado
          if (!guest.confirmed && guest.status === 'Confirmado') return true;
          return false;
        }).length;

        return {
          ...invite,
          guests: guestsList,
          confirmedCount,
          totalGuests: guestsList.length,
        };
      })
    );

    // Buscar estatísticas globais usando SQL otimizado
    const globalStats = await db
      .select({
        totalGuests: sql<number>`COUNT(*)`.as('totalGuests'),
        confirmedGuests: sql<number>`SUM(CASE WHEN ${guests.confirmed} = true OR ${guests.status} = 'Confirmado' THEN 1 ELSE 0 END)`.as('confirmedGuests'),
        cancelledGuests: sql<number>`SUM(CASE WHEN ${guests.status} = 'Cancelado' THEN 1 ELSE 0 END)`.as('cancelledGuests'),
      })
      .from(guests);
    
    const totalInvites = allInvites.length;
    const totalGuests = Number(globalStats[0]?.totalGuests) || 0;
    const confirmedGuests = Number(globalStats[0]?.confirmedGuests) || 0;
    const cancelledGuests = Number(globalStats[0]?.cancelledGuests) || 0;
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
