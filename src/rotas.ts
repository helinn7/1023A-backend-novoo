import carrinhoController from "./carrinho/carrinho.controller.js";
import produtosController from "./produtos/produtos.controller.js";
import usuarioController from "./usuarios/usuario.controller.js";

import { Router } from "express";

const rotas = Router();

/*//Criando rotas para os usuários
rotas.post("/usuarios", usuarioController.adicionar);
rotas.get("/usuarios", usuarioController.listar);

rotas.post("/produtos", produtosController.adicionar);
rotas.get("/produtos", produtosController.listar);
//Ainda vamos ter que criar as rotas para carrinho e produtos
//Tarefa para casa :)*/

rotas.post("/adicionarItem", carrinhoController.adicionarItem);
rotas.delete("/removerItem/:usuarioId/:produtoId", carrinhoController.removerItem);
rotas.put("/atualizarQuantidade/:produtoId", carrinhoController.atualizarQuantidade);
rotas.get("/listar/:usuarioId", carrinhoController.listar);
rotas.delete("/remover", carrinhoController.remover);

export default rotas;

