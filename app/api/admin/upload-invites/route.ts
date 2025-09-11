import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { invites, guests } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface SpreadsheetRow {
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { data } = await request.json();
    
    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    console.log('Dados recebidos:', JSON.stringify(data[0], null, 2)); // Debug

    // Processar cada linha da planilha
    let addedCount = 0;
    let updatedCount = 0;

    // Agrupar linhas por convite (Nome do convite)
    const inviteGroups = new Map<string, any[]>();
    
    for (const row of data as SpreadsheetRow[]) {
      const nameOnInvite = String(row['Nome do convite *'] || row['Nome do convite'] || '').trim();
      
      if (!nameOnInvite) {
        console.log('Linha ignorada - sem nome do convite:', row);
        continue;
      }

      if (!inviteGroups.has(nameOnInvite)) {
        inviteGroups.set(nameOnInvite, []);
      }
      inviteGroups.get(nameOnInvite)!.push(row);
    }

    // Processar cada grupo de convite
    for (const [nameOnInvite, rows] of inviteGroups) {
      const firstRow = rows[0];
      
      // Extrair dados do convite da primeira linha
      const ddi = String(firstRow['DDI'] || '').trim();
      const phone = String(firstRow['DDD + Telefone para confirmação de presença'] || '').trim();
      const group = String(firstRow['Grupo do convite'] || '').trim();
      const observation = String(firstRow['Observação do convite'] || '').trim();

      console.log(`Processando convite: ${nameOnInvite}, DDI: ${ddi}, Telefone: ${phone}, Grupo: ${group}`);

      // Criar ou atualizar convite
      let invite;
      const existingInvite = await db
        .select()
        .from(invites)
        .where(eq(invites.nameOnInvite, nameOnInvite))
        .limit(1);

      if (existingInvite.length > 0) {
        // Atualizar convite existente
        invite = await db
          .update(invites)
          .set({
            ddi: ddi || undefined,
            phone: phone || undefined,
            group: group || undefined,
            observation: observation || undefined,
            updatedAt: new Date(),
          })
          .where(eq(invites.id, existingInvite[0].id))
          .returning();
        updatedCount++;
      } else {
        // Criar novo convite
        invite = await db
          .insert(invites)
          .values({
            nameOnInvite,
            ddi: ddi || undefined,
            phone: phone || undefined,
            group: group || undefined,
            observation: observation || undefined,
          })
          .returning();
        addedCount++;
      }

      const inviteId = invite[0].id;

      // Remover convidados existentes para este convite
      await db.delete(guests).where(eq(guests.inviteId, inviteId));

      // Processar convidados de todas as linhas deste convite
      const guestsToAdd = [];
      
      for (const row of rows) {
        const guestName = String(row['Nome dos convidados *'] || row['Nome dos convidados'] || '').trim();
        
        if (!guestName) continue;

        const gender = String(row['Gênero'] || '').trim();
        const ageGroup = String(row['Faixa etária'] || '').trim();
        const costPayment = String(row['Custo/pagamento'] || '').trim();
        const status = String(row['Situação'] || '').trim();
        const tableNumber = parseInt(String(row['Mesa'] || '').trim()) || undefined;

        guestsToAdd.push({
          inviteId,
          fullName: guestName,
          gender: gender || undefined,
          ageGroup: ageGroup || undefined,
          costPayment: costPayment || undefined,
          status: status || undefined,
          tableNumber: tableNumber,
          confirmed: false,
        });
      }

      // Adicionar novos convidados
      if (guestsToAdd.length > 0) {
        await db.insert(guests).values(guestsToAdd);
      }
    }

    return NextResponse.json(
      { 
        message: 'Planilha importada com sucesso',
        added: addedCount,
        updated: updatedCount,
        total: addedCount + updatedCount
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );

  } catch (error) {
    console.error('Erro ao processar upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
