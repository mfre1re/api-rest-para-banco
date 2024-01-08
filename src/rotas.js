const express = require("express")
const { listarContas, criarContaBancaria, atualizarDadosDoUsuario, excluirConta, depositarValor, sacarValor, transferenciaValor, saldoValor, extratoTransacoes } = require("./controladores/operacoesBancarias")
const { banco } = require("./bancodedados")
const rotas = express()

//Validação do "Listar contas Bancárias" realizada por meio de um Middleware
const validacaoSenha = (req, res, next) => {
    const { senha_banco } = req.query
    if (!senha_banco){
        return res.status(400).json("O servidor não entendeu a requisição, pois está com uma sintaxe/formato inválido ou não foi preenchido.")
    }else if (senha_banco !== banco.senha){
        return res.status(400).json({ "mensagem": "A senha do banco informada é inválida!" }) 
    }

    next()
}

rotas.get("/contas", validacaoSenha, listarContas)
rotas.post("/contas", criarContaBancaria)
rotas.put("/contas/:numeroConta/usuario", atualizarDadosDoUsuario)
rotas.delete("/contas/:numeroConta", excluirConta)
rotas.post("/transacoes/depositar", depositarValor)
rotas.post("/transacoes/sacar", sacarValor)
rotas.post("/transacoes/transferir", transferenciaValor)
rotas.get("/contas/saldo", saldoValor)
rotas.get("/contas/extrato", extratoTransacoes)

module.exports = rotas
