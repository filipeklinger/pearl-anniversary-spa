import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { guests, invites } from '@/lib/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar todas as mensagens dos convidados e dos convites
    // Mensagens dos convidados (individuais)
    const guestMessages = await db
      .select({
        id: guests.id,
        inviteId: guests.inviteId,
        nameOnInvite: invites.nameOnInvite,
        phone: invites.phone,
        group: invites.group,
        message: guests.message,
        guestName: guests.fullName,
        status: guests.status,
        updatedAt: guests.updatedAt,
      })
      .from(guests)
      .innerJoin(invites, eq(guests.inviteId, invites.id))
      .where(and(
        isNotNull(guests.message),
        sql`TRIM(${guests.message}) != ''`
      ))
      .orderBy(sql`${guests.updatedAt} DESC`);

    // Buscar mensagens do convite (observation) - estas são mensagens gerais do convite
    const inviteMessages = await db
      .select({
        id: invites.id,
        inviteId: invites.id,
        nameOnInvite: invites.nameOnInvite,
        phone: invites.phone,
        group: invites.group,
        message: invites.observation,
        guestName: sql<string>`NULL`.as('guestName'),
        status: sql<string>`'Geral'`.as('status'),
        updatedAt: invites.updatedAt,
      })
      .from(invites)
      .where(and(
        isNotNull(invites.observation),
        sql`TRIM(${invites.observation}) != ''`
      ))
      .orderBy(sql`${invites.updatedAt} DESC`);

    // Buscar estatísticas de confirmação para cada convite
    const inviteStats = await db
      .select({
        inviteId: guests.inviteId,
        confirmedCount: sql<number>`SUM(CASE WHEN ${guests.confirmed} = true OR ${guests.status} = 'Confirmado' THEN 1 ELSE 0 END)`.as('confirmedCount'),
        totalGuests: sql<number>`COUNT(*)`.as('totalGuests'),
      })
      .from(guests)
      .groupBy(guests.inviteId);

    // Criar um mapa para lookup rápido das estatísticas
    const statsMap = new Map();
    inviteStats.forEach(stat => {
      statsMap.set(stat.inviteId, {
        confirmedCount: Number(stat.confirmedCount),
        totalGuests: Number(stat.totalGuests)
      });
    });

    // Combinar mensagens dos convidados e dos convites
    const allMessages = [
      ...guestMessages.map(msg => ({
        ...msg,
        confirmedCount: statsMap.get(msg.inviteId)?.confirmedCount || 0,
        totalGuests: statsMap.get(msg.inviteId)?.totalGuests || 0,
        messageType: 'guest' as const,
      })),
      ...inviteMessages.map(msg => ({
        ...msg,
        confirmedCount: statsMap.get(msg.inviteId)?.confirmedCount || 0,
        totalGuests: statsMap.get(msg.inviteId)?.totalGuests || 0,
        messageType: 'invite' as const,
      }))
    ];

    // Ordenar por data de atualização (mais recente primeiro)
    allMessages.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    // Calcular estatísticas
    const stats = {
      totalMessages: allMessages.length,
      confirmedMessages: allMessages.filter(msg => 
        msg.status === 'Confirmado' || msg.confirmedCount > 0
      ).length,
      cancelledMessages: allMessages.filter(msg => 
        msg.status === 'Cancelado' || (msg.confirmedCount === 0 && msg.totalGuests > 0)
      ).length,
    };

    return NextResponse.json({
      messages: allMessages,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { messageId, messageType } = await request.json();
    
    if (!messageId || !messageType) {
      return NextResponse.json(
        { error: 'ID da mensagem e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    if (messageType === 'guest') {
      // Deletar mensagem de convidado (limpar o campo message)
      await db
        .update(guests)
        .set({ 
          message: null,
          updatedAt: new Date()
        })
        .where(eq(guests.id, messageId));
    } else if (messageType === 'invite') {
      // Deletar mensagem de convite (limpar o campo observation)
      await db
        .update(invites)
        .set({ 
          observation: null,
          updatedAt: new Date()
        })
        .where(eq(invites.id, messageId));
    } else {
      return NextResponse.json(
        { error: 'Tipo de mensagem inválido' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Mensagem deletada com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
