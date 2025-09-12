import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq, count } from 'drizzle-orm';

export async function GET() {
  try {
    // Buscar todos os convites com contagem de convidados
    const invitesWithGuestCount = await db
      .select({
        id: invites.id,
        nameOnInvite: invites.nameOnInvite,
        phone: invites.phone,
        token: invites.token,
        guestCount: count(guests.id),
      })
      .from(invites)
      .leftJoin(guests, eq(invites.id, guests.inviteId))
      .groupBy(invites.id, invites.nameOnInvite, invites.phone, invites.token)
      .orderBy(invites.nameOnInvite);

    return NextResponse.json({
      invites: invitesWithGuestCount,
    });

  } catch (error) {
    console.error('Erro ao buscar convites:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}