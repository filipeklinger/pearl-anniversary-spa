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

    // Processar cada linha da planilha
    // Formato esperado: Nome do Convite, Telefone (opcional), Convidado 1, Convidado 2, etc.
    for (const row of data as SpreadsheetRow[]) {
      const nameOnInvite = row['Nome do Convite'] || row['nome_convite'] || row['Nome'] || '';
      const phone = row['Telefone'] || row['telefone'] || row['Phone'] || '';
      
      if (!nameOnInvite) continue;

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
            phone: phone || undefined,
            updatedAt: new Date(),
          })
          .where(eq(invites.id, existingInvite[0].id))
          .returning();
      } else {
        // Criar novo convite
        invite = await db
          .insert(invites)
          .values({
            nameOnInvite,
            phone: phone || undefined,
          })
          .returning();
      }

      const inviteId = invite[0].id;

      // Processar convidados
      const guestColumns = Object.keys(row).filter(key => 
        key.toLowerCase().includes('convidado') || 
        key.toLowerCase().includes('guest') ||
        key.toLowerCase().includes('nome')
      );

      // Adicionar também as colunas numeradas
      for (let i = 1; i <= 10; i++) {
        const possibleColumns = [`Convidado ${i}`, `Guest ${i}`, `Nome ${i}`, `convidado_${i}`];
        possibleColumns.forEach(col => {
          if (row[col] && !guestColumns.includes(col)) {
            guestColumns.push(col);
          }
        });
      }

      // Remover convidados existentes para este convite
      await db.delete(guests).where(eq(guests.inviteId, inviteId));

      // Adicionar novos convidados
      const guestNames = guestColumns
        .map(col => row[col])
        .filter(name => name && typeof name === 'string' && name.trim() !== '');

      if (guestNames.length > 0) {
        await db.insert(guests).values(
          guestNames.map(name => ({
            inviteId,
            fullName: name.trim(),
            confirmed: false,
          }))
        );
      }
    }

    return NextResponse.json(
      { message: 'Planilha importada com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao processar upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
