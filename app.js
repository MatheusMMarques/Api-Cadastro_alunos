const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());


const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// Define as opções do Swagger JSDoc
const options = {
  definition: {
    openapi: '3.0.0', // Especifica a versão do OpenAPI
    info: {
      title: 'API de Cadastro de Alunos', // Nome da API
      version: '1.0.0',
      description: 'API para cadastro de alunos em um sistema EAD.',
    },
    servers: [
      {
        url: 'https://api-cadastro-alunos-19700570991d.herokuapp.com/api-docs/',
      },
    ],
  },
  apis: ['app.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do banco de dados   
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'alunos'
});

db.connect(err => {
  if (err) {
    console.error('Erro na conexão com o banco de dados: ' + err.message);
    return;
  }
  console.log('Conectado ao banco de dados');
});

// Anotação Swagger para o endpoint de cadastro de alunos
/**
 * @swagger
 * /cadastro-aluno:
 *   post:
 *     summary: Cadastra um novo aluno
 *     tags:
 *       - Alunos
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               sobrenome:
 *                 type: string
 *               nomeUsuario:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               repitaSenha:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Aluno cadastrado com sucesso
 *       '400':
 *         description: Erro no cadastro do aluno
 */
app.post('/cadastro-aluno', (req, res) => {
    const { nome, sobrenome, nomeUsuario, email, senha, repitaSenha } = req.body;
  
    // Valida os dados
    if (!nome || !sobrenome || !nomeUsuario || !email || !senha || !repitaSenha) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      return;
    }
  
    if (senha !== repitaSenha) {
      res.status(400).json({ error: 'As senhas não correspondem.' });
      return;
    }
  
    // Executa uma inserção no banco de dados
    const query = 'INSERT INTO alunos (nome, sobrenome, nome_usuario, email, senha) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nome, sobrenome, nomeUsuario, email, senha], (err, result) => {
      if (err) {
        console.error('Erro ao inserir aluno: ' + err.message);
        res.status(500).json({ error: 'Erro ao inserir aluno.' });
        return;
      }
      console.log('Aluno cadastrado com sucesso!');
      res.status(200).json({ message: 'Aluno cadastrado com sucesso.' });
    });
  });

    // Rota para a documentação Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API está executando na porta ${port}`);
});


