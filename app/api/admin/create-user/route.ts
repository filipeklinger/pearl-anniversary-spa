import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 409 }
      );
    }

    // Criar novo usuário
    const hashedPassword = await hashPassword(password);
    
    const newUser = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
      })
      .returning({ id: users.id, email: users.email });

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: { id: newUser[0].id, email: newUser[0].email }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
