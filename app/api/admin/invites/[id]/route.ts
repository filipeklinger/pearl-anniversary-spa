import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface UpdateInviteBody {
  nameOnInvite: string
  ddi?: string
  phone?: string
  group?: string
  observation?: string
  code?: string
  guests: {
    id?: number
    fullName: string
    gender?: string
    ageGroup?: string
    costPayment?: string
    status?: string
    tableNumber?: number
    confirmed?: boolean
  }[]
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const inviteId = parseInt(params.id);
    
    if (isNaN(inviteId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se o convite existe
    const invite = await db
      .select()
      .from(invites)
      .where(eq(invites.id, inviteId))
      .limit(1);

    if (invite.length === 0) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Deletar todos os convidados associados
    await db.delete(guests).where(eq(guests.inviteId, inviteId));

    // Deletar o convite
    await db.delete(invites).where(eq(invites.id, inviteId));

    return NextResponse.json(
      { message: 'Convite deletado com sucesso' },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );

  } catch (error) {
    console.error('Erro ao deletar convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const inviteId = parseInt(params.id)
    if (isNaN(inviteId)) {
      return NextResponse.json({ message: 'ID do convite inválido' }, { status: 400 })
    }

    const body: UpdateInviteBody = await request.json()
    
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

    // Verificar se o convite existe
    const existingInvite = await db
      .select()
      .from(invites)
      .where(eq(invites.id, inviteId))
      .limit(1)

    if (existingInvite.length === 0) {
      return NextResponse.json({ 
        message: 'Convite não encontrado' 
      }, { status: 404 })
    }

    // Verificar se já existe um convite com o mesmo código (se fornecido e diferente do atual)
    if (body.code?.trim() && body.code.trim() !== existingInvite[0].code) {
      const duplicateInvite = await db
        .select()
        .from(invites)
        .where(eq(invites.code, body.code.trim()))
        .limit(1)

      if (duplicateInvite.length > 0) {
        return NextResponse.json({ 
          message: 'Já existe um convite com este código' 
        }, { status: 400 })
      }
    }

    // Atualizar o convite
    await db
      .update(invites)
      .set({
        nameOnInvite: body.nameOnInvite.trim(),
        ddi: body.ddi?.trim() || null,
        phone: body.phone?.trim() || null,
        group: body.group?.trim() || null,
        observation: body.observation?.trim() || null,
        code: body.code?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(invites.id, inviteId))

    // Buscar convidados existentes
    const existingGuests = await db
      .select()
      .from(guests)
      .where(eq(guests.inviteId, inviteId))

    // Separar convidados para atualizar, criar e remover
    const guestsToUpdate = body.guests.filter(g => g.id)
    const guestsToCreate = body.guests.filter(g => !g.id)
    const existingGuestIds = guestsToUpdate.map(g => g.id).filter(Boolean)
    const guestsToDelete = existingGuests.filter(g => !existingGuestIds.includes(g.id))

    // Deletar convidados removidos
    for (const guest of guestsToDelete) {
      await db.delete(guests).where(eq(guests.id, guest.id))
    }

    // Atualizar convidados existentes
    for (const guest of guestsToUpdate) {
      if (guest.id) {
        await db
          .update(guests)
          .set({
            fullName: guest.fullName.trim(),
            gender: guest.gender?.trim() || null,
            ageGroup: guest.ageGroup?.trim() || null,
            costPayment: guest.costPayment?.trim() || null,
            status: guest.status?.trim() || null,
            tableNumber: guest.tableNumber || null,
            confirmed: guest.confirmed || false,
            updatedAt: new Date(),
          })
          .where(eq(guests.id, guest.id))
      }
    }

    // Criar novos convidados
    if (guestsToCreate.length > 0) {
      const newGuestInserts = guestsToCreate.map(guest => ({
        inviteId: inviteId,
        fullName: guest.fullName.trim(),
        gender: guest.gender?.trim() || null,
        ageGroup: guest.ageGroup?.trim() || null,
        costPayment: guest.costPayment?.trim() || null,
        status: guest.status?.trim() || null,
        tableNumber: guest.tableNumber || null,
        confirmed: guest.confirmed || false,
      }))

      await db.insert(guests).values(newGuestInserts)
    }

    // Buscar o convite atualizado com os convidados para retornar
    const updatedInvite = await db
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
      .where(eq(invites.id, inviteId))

    // Agrupar os dados
    const inviteWithGuests = {
      ...updatedInvite[0],
      guests: updatedInvite.map(row => row.guest).filter(guest => guest && guest.id),
      confirmedCount: updatedInvite.filter(row => row.guest?.confirmed).length,
      totalGuests: updatedInvite.filter(row => row.guest?.id).length,
    }

    return NextResponse.json({
      message: 'Convite atualizado com sucesso',
      invite: inviteWithGuests
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar convite:', error)
    return NextResponse.json({
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
