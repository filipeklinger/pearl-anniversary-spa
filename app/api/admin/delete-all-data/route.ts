import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { guests, invites, settings } from '@/lib/schema';

export async function DELETE(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Receber confirmação do frontend
    let confirmText = '';
    try {
      const body = await request.json();
      confirmText = body.confirmText || '';
    } catch (error) {
      // Body pode estar vazio - permitir continuar
      console.log('Body vazio ou inválido, usando confirmText vazio');
      confirmText = '';
    }
    
    if (confirmText !== 'DELETAR TUDO') {
      return NextResponse.json(
        { error: 'Texto de confirmação incorreto' },
        { status: 400 }
      );
    }

    // Deletar em cascata - começar pelas tabelas dependentes
    await db.delete(guests);
    await db.delete(invites);
    await db.delete(settings);

    return NextResponse.json(
      { message: 'Todos os dados foram deletados com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao deletar dados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
