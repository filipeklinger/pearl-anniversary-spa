#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('🎯 Script para criar usuário administrador');
    console.log('=======================================\n');

    const domain = await question('Digite a URL do site (ex: https://site.vercel.app): ');
    const email = await question('Digite o email do admin: ');
    const password = await question('Digite a senha do admin: ');

    console.log('\n🔄 Criando usuário...');

    const response = await fetch(`${domain}/api/admin/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Usuário criado com sucesso!');
      console.log(`📧 Email: ${data.user.email}`);
      console.log(`🔑 ID: ${data.user.id}`);
      console.log(`\n🌐 Acesse: ${domain}/admin/login`);
    } else {
      const error = await response.json();
      console.error('❌ Erro ao criar usuário:', error.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;
