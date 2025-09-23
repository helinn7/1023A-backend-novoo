import { Request, Response } from 'express';
import { db } from '../database/banco-mongo.js';
import { MongoClient } from 'mongodb';

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
        const { usuarioId, produtoId, quantidade, precoUnitario, nomeProduto } = req.body;
        const item: ItemCarrinho = { produtoId, quantidade, precoUnitario, nomeProduto };
        // Tenta encontrar o carrinho do usuário
        const carrinhoExistente = await db.collection('carrinhos').findOne({ usuarioId });
        let resposta;
        if (carrinhoExistente) {
            // Atualiza o carrinho existente
            const itensAtualizados = [...carrinhoExistente.itens, item];
            const totalAtualizado = itensAtualizados.reduce((acc: number, i: ItemCarrinho) => acc + i.precoUnitario * i.quantidade, 0);
            resposta = await db.collection('carrinhos').updateOne(
                { usuarioId },
                { $set: { itens: itensAtualizados, total: totalAtualizado, dataAtualizacao: new Date() } }
            );
            res.status(200).json({ usuarioId, itens: itensAtualizados, total: totalAtualizado });
        } else {
            // Cria novo carrinho
            const novoCarrinho: Carrinho = {
                usuarioId,
                itens: [item],
                total: item.precoUnitario * item.quantidade,
                dataAtualizacao: new Date()
            };
            resposta = await db.collection('carrinhos').insertOne(novoCarrinho);
            res.status(201).json({ ...novoCarrinho, _id: resposta.insertedId });
        }
    }

    //removerItem
    async removerItem(req: Request, res: Response) {
        const { usuarioId, produtoId } = req.body;
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
        res.status(200).json({ usuarioId, itens: itensAtualizados, total: totalAtualizado });
    }

    //atualizarQuantidade
    async atualizarQuantidade(req: Request, res: Response) {
        const { usuarioId, produtoId, quantidade } = req.body;
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
        res.status(200).json({ usuarioId, itens: itensAtualizados, total: totalAtualizado });
    }

    //Listar itens do carrinho
    async listar(req: Request, res: Response) {
        const { usuarioId } = req.params;
        const carrinho = await db.collection('carrinhos').findOne({ usuarioId });
        if (!carrinho) {
            return res.status(404).json({ mensagem: 'Carrinho não encontrado.' });
        }
        res.status(200).json(carrinho);
    }

    //Remover todo o carrinho
    async remover(req: Request, res: Response) {
        const { usuarioId } = req.body;
        const resultado = await db.collection('carrinhos').deleteOne({ usuarioId });
        if (resultado.deletedCount === 0) {
            return res.status(404).json({ mensagem: 'Carrinho não encontrado.' });
        }
        res.status(200).json({ mensagem: 'Carrinho removido com sucesso.' });
    }
}

export default new CarrinhoController();

const client = new MongoClient(process.env.MONGO_URI!);