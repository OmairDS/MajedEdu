import {randomUUID} from 'node:crypto';
import {seed} from './domain.mjs';
const memory={quizzes:[structuredClone(seed)],attempts:[]};
let client;
async function sqlClient(){if(!client){const {neon}=await import('@neondatabase/serverless');client=neon(process.env.DATABASE_URL);}return client;}
export const storageMode=()=>process.env.DATABASE_URL?'neon':'memory';
export async function listQuizzes(){if(!process.env.DATABASE_URL)return memory.quizzes;const sql=await sqlClient();return sql`SELECT id,title,questions FROM quizzes ORDER BY created_at DESC LIMIT 100`;}
export async function getQuiz(id){if(!process.env.DATABASE_URL)return memory.quizzes.find(q=>q.id===id);const sql=await sqlClient();return (await sql`SELECT id,title,questions FROM quizzes WHERE id=${id}`)[0];}
export async function createQuiz(data){const q={id:randomUUID(),...data};if(!process.env.DATABASE_URL){memory.quizzes.unshift(q);return q;}const sql=await sqlClient();await sql`INSERT INTO quizzes(id,title,questions) VALUES(${q.id},${q.title},${JSON.stringify(q.questions)}::jsonb)`;return q;}
export async function saveAttempt(quiz,answers,score){const a={id:randomUUID(),quiz_id:quiz.id,title:quiz.title,score,total:quiz.questions.length,created_at:new Date().toISOString()};if(!process.env.DATABASE_URL){memory.attempts.unshift(a);return a;}const sql=await sqlClient();await sql`INSERT INTO attempts(id,quiz_id,answers,score,total) VALUES(${a.id},${quiz.id},${JSON.stringify(answers)}::jsonb,${score},${a.total})`;return a;}
export async function summary(){if(!process.env.DATABASE_URL)return {count:memory.attempts.length,average:memory.attempts.length?memory.attempts.reduce((s,a)=>s+100*a.score/a.total,0)/memory.attempts.length:0,recent:memory.attempts.slice(0,50)};const sql=await sqlClient();const [s]=await sql`SELECT count(*)::int AS count,coalesce(avg(100.0*score/total),0)::float AS average FROM attempts`;const recent=await sql`SELECT a.id,a.quiz_id,q.title,a.score,a.total,a.created_at FROM attempts a JOIN quizzes q ON q.id=a.quiz_id ORDER BY a.created_at DESC LIMIT 50`;return {...s,recent};}
