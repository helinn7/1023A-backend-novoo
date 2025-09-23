import carrinhoController from "./carrinho/carrinho.controller.js";
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

rotas.post("/carrinho", carrinhoController.adicionarItem);
rotas.delete("/carrinho/:produtoId", carrinhoController.removerItem);
rotas.put("/carrinho/:produtoId", carrinhoController.atualizarQuantidade);
rotas.get("/carrinho/:usuarioId", carrinhoController.listar);
rotas.delete("/carrinho/:usuarioId/limpar", carrinhoController.remover);
export default rotas;