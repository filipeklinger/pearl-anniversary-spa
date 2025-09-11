import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
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

    const allSettings = await db.select().from(settings);
    
    const settingsMap = allSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);

  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
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

    const { key, value } = await request.json();
    
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Chave e valor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a configuração já existe
    const existingSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existingSetting.length > 0) {
      // Atualizar configuração existente
      await db
        .update(settings)
        .set({
          value: value.toString(),
          updatedAt: new Date(),
        })
        .where(eq(settings.key, key));
    } else {
      // Criar nova configuração
      await db
        .insert(settings)
        .values({
          key,
          value: value.toString(),
        });
    }

    return NextResponse.json(
      { message: 'Configuração salva com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
