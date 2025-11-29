import { authenticateToken } from "./middleware";
import { taskQueries, taskTypeQueries } from "./database";
import express from 'express';

const router = express.Router();

router.post('/', authenticateToken, async (req: any, res) => {
    try {
        if(req.user.type !== 'gestor') {
            return res.status(403).json({
                error: 'Apenas gestores podem criar tarefas'
            });
        }

        const taskTypeData = req.body;

        console.log('Dados recebidos: ');
        console.log('Body completo:', JSON.stringify(taskTypeData, null, 2));
        


    } catch (error:any) {
        
    }
});

router.get('/', authenticateToken, async (req:any, res) => {
    try {
        const taskType = await taskTypeQueries.getAll();
        res.json(taskType);
    } catch (error){
        console.error('Erro ao buscar tasksType:', error);
        res.status(500).json({
            error: 'Erro ao buscar tasksType'
        });
    }
    
});

router.delete('/:id', authenticateToken, async (req:any, res) => {
    try {
        if(req.user.type !== 'gestor') {
            return res.status(403).json({
                error: 'Apenas gestores '
            });
        }


    } catch (error) {
        res.status(500).json({
            error: 'Erro'
        });
    }
});

export default router;