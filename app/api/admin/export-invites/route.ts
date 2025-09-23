import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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
      .select()
      .from(invites);

    const exportData = [];

    for (const invite of invitesWithGuests) {
      const guestsList = await db
        .select()
        .from(guests)
        .where(eq(guests.inviteId, invite.id))
        .orderBy(guests.fullName);

      // Se não há convidados, adicionar linha apenas com o convite
      if (guestsList.length === 0) {
        exportData.push({
          'Nome do Convite': invite.nameOnInvite,
          'DDI': invite.ddi || '',
          'Telefone': invite.phone || '',
          'Grupo': invite.group || '',
          'Observação': invite.observation || '',
          'Nome do Convidado': '',
          'Gênero': '',
          'Faixa Etária': '',
          'Custo/Pagamento': '',
          'Situação': '',
          'Mesa': '',
          'Confirmado': '',
          'Mensagem': '',
          'Data de Criação': invite.createdAt?.toISOString().split('T')[0] || '',
          'Última Atualização': invite.updatedAt?.toISOString().split('T')[0] || '',
        });
      } else {
        // Adicionar uma linha para cada convidado
        guestsList.forEach(guest => {
          exportData.push({
            'Nome do Convite': invite.nameOnInvite,
            'DDI': invite.ddi || '',
            'Telefone': invite.phone || '',
            'Grupo': invite.group || '',
            'Observação': invite.observation || '',
            'Nome do Convidado': guest.fullName,
            'Gênero': guest.gender || '',
            'Faixa Etária': guest.ageGroup || '',
            'Custo/Pagamento': guest.costPayment || '',
            'Situação': guest.status || '',
            'Mesa': guest.tableNumber || '',
            'Confirmado': guest.confirmed ? 'Sim' : 'Não',
            'Mensagem': guest.message || '',
            'Data de Criação': invite.createdAt?.toISOString().split('T')[0] || '',
            'Última Atualização': guest.updatedAt?.toISOString().split('T')[0] || '',
          });
        });
      }
    }

    return NextResponse.json(exportData);

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
