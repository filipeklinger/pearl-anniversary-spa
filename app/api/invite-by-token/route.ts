import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Add this to make the route dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use searchParams directly from request instead of creating new URL
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar convite pelo token
    const foundInvites = await db
      .select()
      .from(invites)
      .where(eq(invites.token, token))
      .limit(1);

    if (foundInvites.length === 0) {
      return NextResponse.json(
        { error: 'Convite não encontrado ou token inválido' },
        { status: 404 }
      );
    }

    const invite = foundInvites[0];

    // Buscar os convidados deste convite
    const guestsList = await db
      .select()
      .from(guests)
      .where(eq(guests.inviteId, invite.id));

    const inviteWithGuests = {
      id: invite.id,
      nameOnInvite: invite.nameOnInvite,
      phone: invite.phone,
      guests: guestsList.map(guest => ({
        id: guest.id,
        fullName: guest.fullName,
        confirmed: guest.confirmed,
      })),
    };

    return NextResponse.json({
      invite: inviteWithGuests,
    });

  } catch (error) {
    console.error('Erro ao buscar convite por token:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}