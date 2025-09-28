import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invites } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { inviteId } = await request.json();
    
    if (!inviteId || typeof inviteId !== 'number') {
      return NextResponse.json(
        { error: 'ID do convite é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o convite existe
    const existingInvite = await db
      .select()
      .from(invites)
      .where(eq(invites.id, inviteId))
      .limit(1);

    if (existingInvite.length === 0) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Gerar um token único
    let token = uuidv4();
    
    // Verificar se o token já existe (muito improvável, mas vamos garantir)
    let existingToken = await db
      .select()
      .from(invites)
      .where(eq(invites.token, token))
      .limit(1);

    // Se por acaso já existir, gerar um novo
    while (existingToken.length > 0) {
      token = uuidv4();
      existingToken = await db
        .select()
        .from(invites)
        .where(eq(invites.token, token))
        .limit(1);
    }

    // Atualizar o convite com o token
    await db
      .update(invites)
      .set({ 
        token: token,
        updatedAt: new Date()
      })
      .where(eq(invites.id, inviteId));

    return NextResponse.json({
      token: token,
      message: 'Token gerado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao gerar token:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}