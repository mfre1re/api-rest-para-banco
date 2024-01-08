#Mini API Rest para Banco

Este é um mini projeto de API Rest para um sistema bancário simples, desenvolvido como parte de um desafio. O projeto inclui funcionalidades como criação de contas, depósitos, saques, transferências e consultas de saldo e extrato.

Para execução da API é importante que tenha o Node.js instalado.

##1. Clonar o repositório:
   git clone

##2. Instale as dependências:
   npm install
   
   Dependências utilizadas:
   - date-fns, biblioteca JavaScript que realiza gerenciamento de datas;
   - express, framework web para Node.js, para simplificar o desenvolvimento de APIs;
   - nodemon, dependência de desenvolvimento para reinicialização automatica do servidor

##4. Inicie o servidor:
   *npm start* (ou *npm run dev* com a instalação da dependência nodemon)
   ###O servidor estará disponível em http://localhost:3000

##5 .Rotas Disponíveis
  GET /contas: Lista todas as contas bancárias.
  POST /contas: Cria uma nova conta bancária.
  PUT /contas/:numeroConta/usuario: Atualiza os dados do usuário de uma conta.
  DELETE /contas/:numeroConta: Exclui uma conta bancária.
  POST /transacoes/depositar: Realiza um depósito em uma conta.
  POST /transacoes/sacar: Realiza um saque em uma conta.
  POST /transacoes/transferir: Realiza uma transferência entre contas.
  GET /contas/saldo: Consulta o saldo de uma conta.
  GET /contas/extrato: Consulta o extrato de transações de uma conta.   
   
