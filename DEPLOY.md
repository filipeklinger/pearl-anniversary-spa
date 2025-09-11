# Deploy Instructions - Pearl Anniversary SPA

## Setup para Deploy na Vercel

### 1. Preparação do Banco de Dados Neon

1. Acesse [Neon](https://neon.tech) e crie uma conta
2. Crie um novo projeto PostgreSQL
3. Copie a connection string do banco
4. Execute as migrações do Drizzle:

```bash
# Gerar as migrações
pnpm db:generate

# Aplicar as migrações no banco
pnpm db:migrate
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-random-secret-key

# Admin default user (usado apenas para criar primeiro usuário)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 3. Deploy na Vercel

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login na Vercel:
```bash
vercel login
```

3. Deploy inicial:
```bash
vercel
```

4. Configure as variáveis de ambiente na Vercel:
   - Acesse o dashboard da Vercel
   - Vá em Settings > Environment Variables
   - Adicione todas as variáveis do arquivo `.env.local`

5. Redeploy para aplicar as variáveis:
```bash
vercel --prod
```

### 4. Criar Usuário Admin Inicial

Após o deploy, acesse:
```
POST https://your-domain.vercel.app/api/admin/create-user
```

Com o body:
```json
{
  "email": "admin@example.com",
  "password": "senha-segura"
}
```

Ou use o script fornecido:
```bash
node scripts/create-admin.js
```

### 5. Estrutura de Dados da Planilha

Para importar convites, a planilha deve ter o formato:

| Nome do Convite | Telefone | Convidado 1 | Convidado 2 | Convidado 3 |
|----------------|----------|-------------|-------------|-------------|
| Família Silva  | (11) 99999-9999 | João Silva | Maria Silva | Pedro Silva |
| Família Santos | (11) 88888-8888 | Ana Santos | Carlos Santos | |

Colunas aceitas:
- `Nome do Convite` ou `nome_convite` ou `Nome`
- `Telefone` ou `telefone` ou `Phone`
- `Convidado 1`, `Convidado 2`, etc. ou `Guest 1`, `Guest 2`, etc.

### 6. Fluxo de Uso

1. **Admin**: Acesse `/admin/login` e faça login
2. **Admin**: No dashboard, importe a planilha com os convites
3. **Admin**: Configure mensagens personalizadas em `/admin/settings`
4. **Convidados**: Acessam a página principal e buscam seu convite
5. **Convidados**: Selecionam quem vai comparecer e confirmam
6. **Admin**: Acompanha confirmações no dashboard e exporta dados

### 7. Funcionalidades Implementadas

✅ Sistema de autenticação com NextAuth.js
✅ Upload e processamento de planilhas Excel/CSV
✅ Busca de convites por nome ou telefone
✅ Confirmação de presença individual por convidado
✅ Dashboard administrativo com estatísticas
✅ Filtros e busca no dashboard
✅ Exportação de dados atualizados
✅ Configurações personalizáveis (mensagem de agradecimento, data limite)
✅ Design responsivo com tema das Bodas de Pérola
✅ Galeria de fotos
✅ Informações do evento

### 8. Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **File Processing**: SheetJS (xlsx)
- **Deploy**: Vercel

### 9. Suporte e Manutenção

- Para adicionar novos convites: use a funcionalidade de upload no dashboard
- Para alterar configurações: acesse `/admin/settings`
- Para exportar dados: use o botão "Exportar Dados" no dashboard
- Para backup: exporte os dados regularmente

### 10. Segurança

- Todas as rotas administrativas são protegidas por autenticação
- Senhas são hasheadas com bcrypt
- Validação de dados em todas as APIs
- Rate limiting pode ser adicionado conforme necessário
