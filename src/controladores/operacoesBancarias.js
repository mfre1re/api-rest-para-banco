let { contas, saques, depositos, transferenciasEnviadas, transferenciasRecebidas } = require('../bancodedados.js')
const { format } = require('date-fns')
const data = format(new Date(), 'dd/MM/yyyy HH:mm:ss')
let numeroDeContasVazias = []

const listarContas = (req, res) => {
    //Ordenamento da listagem das contas para que caso alguma conta seja excluída, a nova conta criada no lugar desta, assuma a ordem devida na numeração das contas
    const contasOrdenadas = contas.sort((a, b) => {
        return a.numero_conta - b.numero_conta
    })
    return res.status(200).send(contasOrdenadas)
}

const criarContaBancaria = (req, res) => {
    try {
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

        // Verifica se todas as propriedades foram preenchidas
        for (let validador of Object.keys({ nome, cpf, data_nascimento, telefone, email, senha })) {
            if (!req.body[validador]) {
                return res.status(400).json({ "mensagem": `É necessário preencher o campo ${validador} para prosseguir` })
            }
        }
      
        // Validar o CPF e o EMAIL além de verificar se são válidos
        if (cpf.length !== 11 || isNaN(cpf)) {
            return res.status(400).json({ "mensagem": "O CPF informado não é válido. O CPF deve ser composto apenas de 11 números" })
        }

        if (contas.some(conta => conta.usuario.cpf === cpf)){
            return res.status(400).json({ "mensagem": "O CPF informado já está cadastrado." })
        }

        if (contas.some(conta => conta.usuario.email === email) || email.indexOf('@') === -1 || email.indexOf('.', email.indexOf('@')) === -1){
            return res.status(400).json({ "mensagem": "O email informado não é válido ou já está cadastrado." })
        }

        // Adicionar novas contas diretamente ao objeto contas
        let numeroDaConta = contas.length

        //Realizando uma inspeção no array de contasVazias para caso esta tenha o valor acima de zero, seja pego seu valor e a criação da próxima conta, seja com o número VAGO dentro deste array, até voltar a seguir a sequência normal de numeração das contas
        if (numeroDeContasVazias.length > 0){
            numeroDaConta = numeroDeContasVazias.shift()
        } else{
            numeroDaConta += 1
        }

        const saldo = 0

        let contaNova = {
            numero_conta: numeroDaConta,
            saldo,
            usuario: {
                nome,
                cpf,
                data_nascimento,
                telefone,
                email,
                senha,
            }
        }

        contas.push(contaNova)

        res.status(201).json({ "mensagem": "Conta criada com sucesso" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ "mensagem": "Erro interno do servidor" })
    }
}

const atualizarDadosDoUsuario = (req, res) => {
    try {
        const { numeroConta } = req.params
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body
    
        const isConta = contas.find((conta) => {
            return conta.numero_conta === Number(numeroConta)
        })

        if (!isConta) {
            return res.status(400).json("O número da conta fornecido não existe ou não é válido")
        }

        for (let validador of Object.keys({ nome, cpf, data_nascimento, telefone, email, senha })) {
            if (!req.body[validador]) {
                return res.status(400).json({ "mensagem": `É necessário preencher o campo ${validador} para prosseguir` })
            }
        }

        if (cpf.length !== 11 || isNaN(cpf)) {
            return res.status(400).json({ "mensagem": "O CPF informado não é válido. O CPF deve ser composto apenas de 11 números" });
        }

        if (contas.some(conta => conta.usuario.cpf === cpf)){
            return res.status(400).json({ "mensagem": "O CPF informado já está cadastrado." })
        }

        if (contas.some(conta => conta.usuario.email === email) || email.indexOf('@') === -1){
            return res.status(400).json({ "mensagem": "O email informado não é válido ou já está cadastrado." })
        }

        isConta.numero_conta = Number(numeroConta)
        isConta.usuario.nome = nome
        isConta.usuario.cpf = cpf
        isConta.usuario.data_nascimento = data_nascimento
        isConta.usuario.telefone = telefone
        isConta.usuario.email = email
        isConta.usuario.senha = senha

        res.status(201).json({ "mensagem": "Atualização de conta bancária realizada com sucesso" })

    } catch (error) {
        res.status(500).json({ "mensagem": "Erro interno do servidor" })
    }
}

const excluirConta = (req, res) => {
    try{        
        const { numeroConta } = req.params
        const numeroContaValidar = parseInt(numeroConta, 10)
        if (isNaN(numeroContaValidar) || numeroContaValidar <= 0 || numeroContaValidar > contas.length) {
            return res.status(400).json({ "mensagem": "O número da conta digitado não é válido ou não existe" })
        }
        
        const deletarConta = contas.find((conta) => {
            return conta.numero_conta === numeroContaValidar
        })

        if (deletarConta.saldo > 0) {
            return res.status(403).json({ "mensagem": "O usuário não tem permissão para acessar o recurso solicitado, pois o saldo em conta deve ser zero." })
        }

        if(!deletarConta){
            return res.status(404).json({ "mensagem": "A conta a ser deletada não existe" })
        }

        contas = contas.filter((conta) => {
            return conta.numero_conta !== deletarConta.numero_conta
        })

        numeroDeContasVazias.push(deletarConta.numero_conta)
        
        return res.status(204).json({ "mensagem": "Conta excluída com sucesso" })

    } catch(error){
        return res.status(500).json( { "mensagem": "Erro interno do servidor" })        
    }
}

const depositarValor = (req, res) => {
    try{    
        const { numero_conta, valor } = req.body
        if (!numero_conta || !valor){
            return res.status(400).json({ "mensagem": `É necessário preencher todos os campos para prosseguir` })
        }

        if(valor <= 0){
            return res.status(400).json({ "mensagem": "O valor colocado para depósito é inválido" })
        }

        const contaExiste = contas.find((buscaConta) => {
            return buscaConta.numero_conta === Number(numero_conta)
        })

        if(!contaExiste){
            return res.status(404).json({ "mensagem": "A conta bancária informada não existe" })
        } else{
            contaExiste.saldo += valor
        }

        const data = format(new Date(), 'dd/MM/yyyy HH:mm:ss')

        deposito = {
            data,
            numero_conta,
            valor
        }

        depositos.push(deposito)
        return res.status(201).json({ "mensagem": "Depósito realizado com sucesso" })

    } catch(error){
        return res.status(500).json({ "mensagem": "Erro interno do servidor" }) 
    }
}

const sacarValor = (req, res) => {
    try{        
        const { numero_conta, valor, senha } = req.body
        if (!numero_conta || !valor || !senha){
            return res.status(400).json({ "mensagem": `É necessário preencher todos os campos para prosseguir` })
        }

        const contaExiste = contas.find((buscaConta) => {
            return buscaConta.numero_conta === Number(numero_conta)
        })

        if(!contaExiste){
            return res.status(404).json({ "mensagem": "A conta bancária informada não existe" })
        }

        if (senha !== contaExiste.usuario.senha){
            return res.status(400).json({ "mensagem": "A senha informada não está correta" })
        }
        
        if (valor < 0){
            return res.status(400).json({ "mensagem": "O valor para saque não pode ser negativo." })
        }
        if(contaExiste && contaExiste.saldo >= valor){
            contaExiste.saldo -= valor
        } else if(contaExiste.saldo < valor){
            return res.status(400).json({ "mensagem": "A conta não possui saldo suficiente para atender a solicitação" })
        }

        saque = {
            data,
            numero_conta,
            valor
        }
        saques.push(saque)

        return res.status(204).json({ "mensagem": "Saque efetuado com sucesso" })
    } catch(error){
        return res.status(500).json({ "mensagem": "Erro interno do servidor" }) 
    }
}

const transferenciaValor = (req, res) => {
    try{
        const { numero_conta_origem, numero_conta_destino, senha, valor } = req.body
        for (let validador of Object.keys({ numero_conta_origem, numero_conta_destino, senha, valor })) {
            if (!req.body[validador]) {
                return res.status(400).json({ "mensagem": `É necessário preencher o campo ${validador} para prosseguir` })
            }
        }

        const validandoContaOrigem = contas.find((contaOrigem) => {
            return contaOrigem.numero_conta === numero_conta_origem
        })

        const validandoContaDestino = contas.find((contaDestino) => {
            return contaDestino.numero_conta === numero_conta_destino
        })
        if(!validandoContaOrigem){
            return res.status(400).json({ "mensagem": "A conta de origem não é válida ou não existe" })
        }
        if(!validandoContaDestino){
            return res.status(400).json({ "mensagem": "A conta de destino não é válida ou não existe" })
        }
        if(validandoContaOrigem === validandoContaDestino){
            return res.status(400).json({ "mensagem": "Não é possível realizar transferências para a mesma conta" })   
        }

        if(validandoContaOrigem.usuario.senha === senha && validandoContaOrigem.saldo >= valor){
            validandoContaOrigem.saldo -= valor
            transferenciasRecebidas.push({
                    data,
                    numero_conta_origem,
                    numero_conta_destino,
                    valor
            })

            validandoContaDestino.saldo += valor
            transferenciasEnviadas.push({
                    data,
                    numero_conta_origem,
                    numero_conta_destino,
                    valor
                })
        } else if(validandoContaOrigem.usuario.senha !== senha){
            return res.status(400).json({ "mensagem": "A senha fornecida está incorreta" })
        } else if (validandoContaOrigem.saldo < valor){
            return res.status(400).json({ "mensagem": "Saldo insuficiente!" })
        } 
        
        return res.status(201).json({ "mensagem": "Transferência realizada com sucesso" })
    } catch(error){
        return res.status(500).json({ "mensagem": "Erro interno do servidor" })
    }
}

const saldoValor = (req, res) => {
    try{
        const { numeroConta, senha } = req.query
        if (!numeroConta || !senha){
            return res.status(400).json({ "mensagem": `É necessário que o número da conta e a senha sejam informados` })
        }

        if(!contas.some((conta) => conta.numero_conta === Number(numeroConta))){
            return res.status(404).json({ "mensagem": "Conta bancária não encontrada" })
        } else if (!contas.some((conta) => conta.usuario.senha === senha)){
            return res.status(400).json({ "mensagem": "A senha informada não é válida" })            
        } else{
            return res.status(200).json({"saldo": `${(contas.find((conta) => conta.numero_conta === Number(numeroConta)).saldo)}`})
        }       
    
    } catch(error){
        return res.status(500).json({ "mensagem": "Erro interno do servidor" })
    }
}

const extratoTransacoes = (req, res) => {
    try{
        const { numero_conta, senha } = req.query
        if(!numero_conta || !senha){
            return res.status(400).json({ "mensagem": `É necessário que o número da conta e a senha sejam informados` })
        }

        const buscandoConta = contas.find((conta) => {
            return conta.numero_conta === Number(numero_conta)
        })

        const verificandoSenha = contas.find((senhaValida) => {
            return senhaValida.usuario.senha === senha
        })

        if(buscandoConta && verificandoSenha){
            const depositoConta = depositos.filter((deposito) => {
                return deposito.numero_conta === Number(numero_conta)
            })
            const saqueConta = saques.filter((saque) => {
                return saque.numero_conta === Number(numero_conta)
            })
            const tranferenciasContaEnviadas = transferenciasEnviadas.filter((transferencias) => {
                return transferencias.numero_conta_origem === Number(numero_conta)
            })
            const tranferenciasContaRecebidas = transferenciasRecebidas.filter((transferencias) => {
                return transferencias.numero_conta_destino === Number(numero_conta)
            })

            const extrato = {
                depositoConta,
                saqueConta,
                tranferenciasContaEnviadas,
                tranferenciasContaRecebidas
            }
            
            return res.status(200).json(extrato)
        }else{
            return res.status(400).json({ "mensagem": "A conta bancária ou senha informados não são válidos"})
        }

    } catch(error){
        return res.status(500).json({ "mensagem": "Erro interno do servidor" })
    }
}

module.exports = { listarContas, criarContaBancaria, atualizarDadosDoUsuario, excluirConta, depositarValor, sacarValor, transferenciaValor, saldoValor, extratoTransacoes }
