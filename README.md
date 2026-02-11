# Projeto Sistema Financeiro Web

Sistema financeiro web desenvolvido com arquitetura moderna separando backend, frontend e database.

## Estrutura do Projeto

```
projeto-sistema-financeiro-web/
├── src/
│   └── backend/          # Backend da aplicação
│       ├── controllers/  # Controladores HTTP
│       ├── models/       # Modelos de dados
│       ├── routes/       # Rotas da API
│       ├── services/     # Lógica de negócios
│       ├── middleware/   # Middlewares
│       ├── config/       # Configurações
│       └── utils/        # Utilitários
│
├── frontend/             # Frontend da aplicação
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços de API
│   ├── styles/          # Estilos CSS/SCSS
│   ├── assets/          # Recursos estáticos
│   └── utils/           # Utilitários
│
└── database/            # Arquivos de banco de dados
    ├── migrations/      # Migrações
    ├── seeds/          # Dados iniciais
    └── schemas/        # Esquemas do banco
```

## Como Começar

1. Clone o repositório
2. Configure o backend em `src/backend/`
3. Configure o frontend em `frontend/`
4. Configure o banco de dados em `database/`

## Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.