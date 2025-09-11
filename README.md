# Pearl Anniversary SPA
SPA criado para ser um convite online e para confirmação de presença no aniversário de 30 anos de casamento.

## Tecnologias sugeridas

Next.js + TypeScript + Tailwind CSS.
Vercel Postgres + Drizzle ORM.

## Fluxo de Confirmação

1. Entrada do convidado
2. Digita o nome no convite ou o telefone.
3. O sistema busca na tabela invites.
4. Seleção dos convidados
5. Lista todas as pessoas vinculadas a esse convite (tabela guests).

Exibe algo tipo:

João (já confirmado ✅)
Maria (não confirmado ❌)
Criança (não confirmado ❌)

Confirmação

O convidado seleciona quem vai.
Atualiza os registros confirmed = true no banco.

Feedback

# Pearl Anniversary SPA
SPA criado para ser um convite online e para confirmação de presença no aniversário de 30 anos de casamento.

## ✅ Status do Projeto: IMPLEMENTADO

Todas as funcionalidades do plano foram implementadas com sucesso!

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Banco de Dados
- ✅ Estrutura com Neon PostgreSQL + Drizzle ORM
- ✅ Tabelas: invites, guests, users, settings
- ✅ Migrações e schema configurados

### ✅ Sistema de Autenticação
- ✅ Login/logout admin com NextAuth.js
- ✅ Proteção de rotas administrativas
- ✅ Hash de senhas com bcryptjs

### ✅ Upload e Gerenciamento de Planilhas
- ✅ Página no dashboard para upload CSV/XLSX
- ✅ Processamento automático com SheetJS
- ✅ Importação de convites e convidados
- ✅ Validação e formatação de dados

### ✅ Sistema de Confirmação Pública
- ✅ Busca por nome no convite ou telefone
- ✅ Listagem de convidados do convite
- ✅ Seleção individual de quem vai comparecer
- ✅ Mensagem de agradecimento personalizada

### ✅ Dashboard Administrativo
- ✅ Estatísticas em tempo real
- ✅ Listagem de convites com status
- ✅ Filtros por confirmação/pendente
- ✅ Busca por nome ou telefone
- ✅ Exportação de dados atualizada

### ✅ Configurações Admin
- ✅ Mensagem de agradecimento personalizada
- ✅ Data limite para confirmações
- ✅ Interface de configurações amigável

### ✅ Deploy e Produção
- ✅ Configuração para Vercel
- ✅ Variáveis de ambiente documentadas
- ✅ Scripts de setup e manutenção

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js
- **UI**: Radix UI Components
- **Files**: SheetJS para planilhas
- **Deploy**: Vercel

## 🚀 Como Usar

### 1. Deploy na Vercel
Siga as instruções detalhadas em [DEPLOY.md](./DEPLOY.md)

### 2. Configuração Inicial
1. Configure o banco Neon PostgreSQL
2. Crie o usuário admin inicial
3. Importe a planilha com convites

### 3. Fluxo de Uso
1. **Admin**: Acessa `/admin/login`
2. **Admin**: Importa planilha no dashboard
3. **Convidados**: Acessam site e confirmam presença
4. **Admin**: Acompanha confirmações e exporta dados

## 📋 Formato da Planilha

Veja o arquivo exemplo em `example-data/convites-exemplo.csv`:

| Nome do Convite | Telefone | Convidado 1 | Convidado 2 | Convidado 3 |
|----------------|----------|-------------|-------------|-------------|
| Família Silva  | (11) 99999-9999 | João Silva | Maria Silva | Pedro Silva |

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Configurar .env.local
cp .env.example .env.local

# Executar migrações
pnpm db:generate
pnpm db:migrate

# Iniciar desenvolvimento
pnpm dev
```

## 📞 Scripts Úteis

```bash
# Criar usuário admin
node scripts/create-admin.js

# Gerar migrações
pnpm db:generate

# Aplicar migrações
pnpm db:migrate

# Visualizar banco
pnpm db:studio
```

## 🎯 Próximos Passos

O projeto está completo e pronto para uso! Para personalizações adicionais:

1. Ajustar cores e tema no Tailwind
2. Adicionar mais campos de dados se necessário
3. Implementar notificações por email
4. Adicionar analytics de confirmações
5. Criar relatórios mais detalhados

## 📄 Licença

Este projeto foi desenvolvido especificamente para as Bodas de Pérola de Robson & Roseli.

---

**💖 Bodas de Pérola - 30 Anos de Amor e Cumplicidade**

## Plano de implementação:

1. Estruturação do Banco (Neon + Drizzle)

Criar tabelas com base no novo fluxo:

- invites
  id (PK)
  name_on_invite (texto — ex.: "Família Silva")
  phone (opcional — usado para busca)
  code (opcional, pode servir como identificador único)

- guests
    id (PK)
    invite_id (FK → invites.id)
    full_name (pode ser vazio/incompleto)
    confirmed (boolean)

- users (admin/login)
  id (PK)
  email
  password_hash

2. Upload da Planilha (Admin)

- Criar página no dashboard para upload de CSV/XLSX.
- Processar com SheetJS.

Importar dados no formato:

- Um convite com um “nome no convite” ou telefone.
- Uma lista de convidados ligados a esse convite.
- Inserir/atualizar registros no banco (invites + guests).

3. Confirmação Pública (Site do Convite)

Formulário inicial: convidado digita nome no convite ou telefone.
O sistema encontra o invite.
Lista todos os guests associados.
Convidado marca quem vai comparecer.
Atualiza confirmed = true no banco.

Exibe mensagem personalizada:
“Obrigado, Família Silva, sua confirmação foi registrada 🎉”.

🔹 4. Dashboard de Administração

Listagem de convites (invites) com status agregado:
Ex.: “Família Silva — 2 confirmados / 3 convidados”.
Detalhes do convite (abrir lista de guests).
Filtros: confirmados / não confirmados.
Exportar planilha com status atualizado.

🔹 5. Extras

Estatísticas rápidas no dashboard:
- Total de convidados
- Total confirmados
- % de confirmação

Configurações adicionais no dashboard:
- Input para Mensagem de agradecimento personalizada.
- Input para Data Limite para confirmação (campo datetime no dashboard), Essa data deve aparecer no componente de Confirmação e nao deve permitir confirmações após essa data.

🔹 6. Deploy & Entrega

Deploy Next.js no Vercel.

Banco Neon conectado.

Testar fluxo completo (upload → confirmação → dashboard → exportação).

Entregar para o cliente com login de admin.