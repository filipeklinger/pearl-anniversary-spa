import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq, count, sql, and, isNotNull, ne } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const groupFilter = searchParams.get('group');
    const offset = (page - 1) * limit;

    // Construir queries
    const baseConditions = [];
    if (groupFilter) {
      baseConditions.push(eq(invites.group, groupFilter));
    }

    // Buscar convites com paginação
    const invitesQuery = db
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

    if (baseConditions.length > 0) {
      invitesQuery.where(and(...baseConditions));
    }

    const invitesWithGuests = await invitesQuery
      .orderBy(invites.nameOnInvite)
      .limit(limit)
      .offset(offset);

    // Buscar total de registros para paginação
    const totalQuery = db
      .select({ count: count(invites.id) })
      .from(invites);
    
    if (baseConditions.length > 0) {
      totalQuery.where(and(...baseConditions));
    }
    
    const [{ count: totalCount }] = await totalQuery;

    // Buscar grupos únicos para o filtro
    const uniqueGroups = await db
      .selectDistinct({ group: invites.group })
      .from(invites)
      .where(and(isNotNull(invites.group), ne(invites.group, '')))
      .orderBy(invites.group);

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

    // Calcular estatísticas (baseadas no total, não na página atual)
    const allInvites = await db.select().from(invites);
    const allGuests = await db.select().from(guests);
    
    const totalInvites = allInvites.length;
    const totalGuests = allGuests.length;
    const confirmedGuests = allGuests.filter(guest => guest.confirmed).length;
    const confirmationRate = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0;

    const stats = {
      totalInvites,
      totalGuests,
      confirmedGuests,
      confirmationRate,
    };

    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1,
    };

    return NextResponse.json({
      invites: invitesData,
      stats,
      pagination,
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
