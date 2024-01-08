const express = require('express')
const servidor = express()
const rotas = require('./rotas')

servidor.use(express.json())
servidor.use(rotas)

const porta = 3000
servidor.listen(porta, () => {
    console.log(`Conectado a porta ${porta}`)
})
