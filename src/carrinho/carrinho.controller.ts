import { Request, Response } from 'express';
import { db } from '../database/banco-mongo.js';

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nomeProduto: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    total: number;
    dataAtualizacao: Date;
}
class CarrinhoController {
    //adicionarItem
    async adicionarItem(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId, quantidade, precoUnitario, nomeProduto } = req.body;
            if (!usuarioId || !produtoId || !quantidade || !precoUnitario || !nomeProduto) {
                return res.status(400).json({ mensagem: 'Dados obrigatórios faltando.' });
            }
            const item: ItemCarrinho = { produtoId, quantidade, precoUnitario, nomeProduto };
            const carrinhoExistente = await db.collection('carrinhos').findOne({ usuarioId });
            let resposta;
            if (carrinhoExistente) {
                const itensAtualizados = [...carrinhoExistente.itens, item];
                const totalAtualizado = itensAtualizados.reduce((acc: number, i: ItemCarrinho) => acc + i.precoUnitario * i.quantidade, 0);
                resposta = await db.collection('carrinhos').updateOne(
                    { usuarioId },
                    { $set: { itens: itensAtualizados, total: totalAtualizado, dataAtualizacao: new Date() } }
                );
                return res.status(200).json({ usuarioId, itens: itensAtualizados, total: totalAtualizado });
            } else {
                const novoCarrinho: Carrinho = {
                    usuarioId,
                    itens: [item],
                    total: item.precoUnitario * item.quantidade,
                    dataAtualizacao: new Date()
                };
                resposta = await db.collection('carrinhos').insertOne(novoCarrinho);
                return res.status(201).json({ ...novoCarrinho, _id: resposta.insertedId });
            }
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro interno ao adicionar item.', erro: (error as Error).message });
        }
    }

    //removerItem
    async removerItem(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId } = req.body;
            if (!usuarioId || !produtoId) {
                return res.status(400).json({ mensagem: 'Dados obrigatórios faltando.' });
            }
            const carrinho = await db.collection('carrinhos').findOne({ usuarioId });
            if (!carrinho) {
                return res.status(404).json({ mensagem: 'Carrinho não encontrado.' });
            }
            const itensAtualizados = carrinho.itens.filter((item: ItemCarrinho) => item.produtoId !== produtoId);
            const totalAtualizado = itensAtualizados.reduce((acc: number, i: ItemCarrinho) => acc + i.precoUnitario * i.quantidade, 0);
            await db.collection('carrinhos').updateOne(
                { usuarioId },
                { $set: { itens: itensAtualizados, total: totalAtualizado, dataAtualizacao: new Date() } }
            );
            return res.status(200).json({ usuarioId, itens: itensAtualizados, total: totalAtualizado });
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro interno ao remover item.', erro: (error as Error).message });
        }
    }

    //atualizarQuantidade
    async atualizarQuantidade(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId, quantidade } = req.body;
            if (!usuarioId || !produtoId || typeof quantidade !== 'number') {
                return res.status(400).json({ mensagem: 'Dados obrigatórios faltando ou inválidos.' });
            }
            const carrinho = await db.collection('carrinhos').findOne({ usuarioId });
            if (!carrinho) {
                return res.status(404).json({ mensagem: 'Carrinho não encontrado.' });
            }
            const itensAtualizados = carrinho.itens.map((item: ItemCarrinho) => {
                if (item.produtoId === produtoId) {
                    return { ...item, quantidade };
                }
                return item;
            });
            const totalAtualizado = itensAtualizados.reduce((acc: number, i: ItemCarrinho) => acc + i.precoUnitario * i.quantidade, 0);
            await db.collection('carrinhos').updateOne(
                { usuarioId },
                { $set: { itens: itensAtualizados, total: totalAtualizado, dataAtualizacao: new Date() } }
            );
            return res.status(200).json({ usuarioId, itens: itensAtualizados, total: totalAtualizado });
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro interno ao atualizar quantidade.', erro: (error as Error).message });
        }
    }

    //Listar itens do carrinho
    async listar(req: Request, res: Response) {
        try {
            const { usuarioId } = req.params;
            if (!usuarioId) {
                return res.status(400).json({ mensagem: 'Usuário não informado.' });
            }
            const carrinho = await db.collection('carrinhos').findOne({ usuarioId });
            if (!carrinho) {
                return res.status(404).json({ mensagem: 'Carrinho não encontrado.' });
            }
            return res.status(200).json(carrinho);
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro interno ao listar carrinho.', erro: (error as Error).message });
        }
    }

    //Remover todo o carrinho
    async remover(req: Request, res: Response) {
        try {
            const { usuarioId } = req.body;
            if (!usuarioId) {
                return res.status(400).json({ mensagem: 'Usuário não informado.' });
            }
            const resultado = await db.collection('carrinhos').deleteOne({ usuarioId });
            if (resultado.deletedCount === 0) {
                return res.status(404).json({ mensagem: 'Carrinho não encontrado.' });
            }
            return res.status(200).json({ mensagem: 'Carrinho removido com sucesso.' });
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro interno ao remover carrinho.', erro: (error as Error).message });
        }
    }
}
export default new CarrinhoController();

