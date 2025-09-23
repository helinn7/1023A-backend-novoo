import produtosController from "./produtos/produtos.controller.js";
import usuarioController from "./usuarios/usuario.controller.js";

import { Router } from "express";

const rotas = Router();

//Criando rotas para os usuários
rotas.post("/usuarios", usuarioController.adicionar);
rotas.get("/usuarios", usuarioController.listar);

rotas.post("/produtos", produtosController.adicionar);
rotas.get("/produtos", produtosController.listar);
//Ainda vamos ter que criar as rotas para carrinho e produtos
//Tarefa para casa :)

export default rotas;