import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invites, guests } from '@/lib/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic';

interface CreateInviteRequest {
  nameOnInvite: string;
  ddi?: string;
  phone?: string;
  group?: string;
  observation?: string;
  code?: string;
  guests: Array<{
    fullName: string;
    gender?: string;
    ageGroup?: string;
    costPayment?: string;
    status?: string;
    tableNumber?: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body: CreateInviteRequest = await request.json()
    
    // Validações básicas
    if (!body.nameOnInvite?.trim()) {
      return NextResponse.json({ 
        message: 'Nome do convite é obrigatório' 
      }, { status: 400 })
    }

    if (!body.guests || body.guests.length === 0) {
      return NextResponse.json({ 
        message: 'Pelo menos um convidado deve ser adicionado' 
      }, { status: 400 })
    }

    // Validar convidados
    for (const guest of body.guests) {
      if (!guest.fullName?.trim()) {
        return NextResponse.json({ 
          message: 'Nome completo é obrigatório para todos os convidados' 
        }, { status: 400 })
      }
    }

    // Verificar se já existe um convite com o mesmo código (se fornecido)
    if (body.code?.trim()) {
      const existingInvite = await db
        .select()
        .from(invites)
        .where(eq(invites.code, body.code.trim()))
        .limit(1)

      if (existingInvite.length > 0) {
        return NextResponse.json({ 
          message: 'Já existe um convite com este código' 
        }, { status: 400 })
      }
    }

    // Criar o convite
    const [newInvite] = await db
      .insert(invites)
      .values({
        nameOnInvite: body.nameOnInvite.trim(),
        ddi: body.ddi?.trim() || null,
        phone: body.phone?.trim() || null,
        group: body.group?.trim() || null,
        observation: body.observation?.trim() || null,
        code: body.code?.trim() || null,
      })
      .returning()

    // Criar os convidados
    const guestInserts = body.guests.map(guest => ({
      inviteId: newInvite.id,
      fullName: guest.fullName.trim(),
      gender: guest.gender?.trim() || null,
      ageGroup: guest.ageGroup?.trim() || null,
      costPayment: guest.costPayment?.trim() || null,
      status: guest.status?.trim() || null,
      tableNumber: guest.tableNumber || null,
      confirmed: false,
    }))

    await db.insert(guests).values(guestInserts)

    // Buscar o convite completo com os convidados para retornar
    const completeInvite = await db
      .select({
        id: invites.id,
        nameOnInvite: invites.nameOnInvite,
        ddi: invites.ddi,
        phone: invites.phone,
        group: invites.group,
        observation: invites.observation,
        code: invites.code,
        guest: {
          id: guests.id,
          fullName: guests.fullName,
          gender: guests.gender,
          ageGroup: guests.ageGroup,
          costPayment: guests.costPayment,
          status: guests.status,
          tableNumber: guests.tableNumber,
          confirmed: guests.confirmed,
        }
      })
      .from(invites)
      .leftJoin(guests, eq(invites.id, guests.inviteId))
      .where(eq(invites.id, newInvite.id))

    // Agrupar os dados
    const inviteWithGuests = {
      ...completeInvite[0],
      guests: completeInvite.map(row => row.guest).filter(guest => guest && guest.id),
      confirmedCount: completeInvite.filter(row => row.guest?.confirmed).length,
      totalGuests: completeInvite.filter(row => row.guest?.id).length,
    }

    return NextResponse.json({
      message: 'Convite criado com sucesso',
      invite: inviteWithGuests
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar convite:', error)
    return NextResponse.json({
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}