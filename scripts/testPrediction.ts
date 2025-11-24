import { initDatabase, predictionQueries } from '../src/lib/database';

const divider = () => console.log('\n' + '-'.repeat(60) + '\n');

const runStep = (label: string, callback: () => void) => {
  console.log(label);
  try {
    callback();
  } catch (error) {
    console.error(`❌ Erro durante "${label}":`, error);
  }
  divider();
};

async function main() {
  console.log('🧪 Teste do algoritmo de predição');
  divider();

  initDatabase();

  runStep('Teste 1: Predição genérica com 5 SP', () => {
    const predictionGeneric = predictionQueries.predictTaskTime(5);
    console.log(JSON.stringify(predictionGeneric, null, 2));
  });

  runStep('Teste 2: Variação por story points', () => {
    [1, 2, 3, 5, 8, 13].forEach((sp) => {
      const p = predictionQueries.predictTaskTime(sp);
      console.log(`${sp} SP -> ${p.estimated_hours}h (confiança: ${p.confidence_level})`);
    });
  });

  runStep('Teste 3: Velocidade da equipa (8 semanas)', () => {
    const velocity = predictionQueries.calculateTeamVelocity(undefined, 8);
    console.log(JSON.stringify(velocity, null, 2));
  });

  runStep('Teste 4: Razão pontos-horas', () => {
    const ratio = predictionQueries.calculatePointsToHoursRatio();
    console.log(JSON.stringify(ratio, null, 2));
  });

  runStep('Teste 5: Predição de múltiplas tarefas', () => {
    const multiPrediction = predictionQueries.predictMultipleTasks([
      { storyPoints: 3 },
      { storyPoints: 5 },
      { storyPoints: 8 },
    ]);
    console.log(JSON.stringify(multiPrediction, null, 2));
  });

  console.log('✅ Teste concluído');
}

main().catch((error) => {
  console.error('❌ Erro ao executar testes:', error);
  process.exit(1);
});

