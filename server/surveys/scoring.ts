import { DEFINITION, type Answers, type Scores, validateAnswers } from '../../shared/surveys/contracts.js';
import { calculateSDQScore, calculatePHQAScore, calculateGAD7Score, calculateSBQRScore, calculateKnowledgeScore, calculateAttitudeScore, calculateLifestyleScore } from './reference-scoring.js';
// Only arithmetic is exposed. Draft instrument classifications are NOT promoted to clinical advice.
export function scoreSurvey(input: Answers, approved = false): Scores {
    const answers = validateAnswers(input), scores: Scores = {};
    for (const section of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) {
        const qs = DEFINITION.questions.filter(q => q.section === section);
        const missing = qs.filter(q => answers[q.code].status !== 'answered').length;
        if (missing) {
            scores[section] = { status: 'insufficient_data', missing };
            continue;
        }
        if (!approved) {
            scores[section] = { status: 'unapproved', missing: 0 };
            continue;
        }
        const values: Record<number, any> = {};
        for (const q of qs) {
            const a = answers[q.code];
            if (a.status === 'answered')
                values[Number(q.code.split('.')[1])] = a.value;
        }
        const get = (code: string) => { const a = answers[code]; return a.status === 'answered' ? a.value : ''; };
        if (section === 'B') {
            const s = calculateSDQScore(values);
            scores.B = { status: 'computed', total: s.totalDifficulties, subscales: { emotional: s.emotional, conduct: s.conduct, hyperactivity: s.hyperactivity, peer: s.peer, prosocial: s.prosocial } };
        }
        if (section === 'C')
            scores.C = { status: 'computed', total: calculatePHQAScore({ items: values, c10SadMostDays: get('C.c10SadMostDays') as any, c11Difficulty: get('C.c11Difficulty') as any, c12SuicideAttemptLifetime: get('C.c12SuicideAttemptLifetime') as any }).score };
        if (section === 'D')
            scores.D = { status: 'computed', total: calculateGAD7Score(values).score };
        if (section === 'E')
            scores.E = { status: 'computed', total: calculateSBQRScore({ e1Lifetime: get('E.e1') as any, e2PastYear: get('E.e2') as any, e3Threat: get('E.e3') as any, e4Likelihood: get('E.e4') as any }).score };
        if (section === 'F')
            scores.F = { status: 'computed', total: calculateLifestyleScore(values).averageScore };
        if (section === 'G')
            scores.G = { status: 'computed', total: calculateKnowledgeScore(values).correctCount };
        if (section === 'H')
            scores.H = { status: 'computed', total: calculateAttitudeScore(values).score };
    }
    return scores;
}
