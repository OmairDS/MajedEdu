import {course,requireRole,validateQuiz,grade,publicQuiz} from '../lib/domain.mjs';
import {storageMode,listQuizzes,getQuiz,createQuiz,saveAttempt,summary} from '../lib/store.mjs';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function readBody(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Error('يجب إرسال JSON فقط.');
 const reader=request.body?.getReader();if(!reader)throw new Error('الطلب فارغ.');let bytes=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>32768){await reader.cancel();throw Object.assign(new Error('حجم الطلب يتجاوز ٣٢ كيلوبايت.'),{status:413});}chunks.push(value);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export default {async fetch(request){
 try{
  if(process.env.DEMO_MODE!=='true')return json({error:'يجب تفعيل DEMO_MODE=true. هذا نموذج تجريبي بلا مصادقة.'},503);
  if(process.env.VERCEL && !process.env.DATABASE_URL)return json({error:'أضف DATABASE_URL في إعدادات Vercel ثم أعد النشر.'},503);
  const role=request.headers.get('x-demo-role');requireRole(role,['teacher','student','admin']);
  const url=new URL(request.url);const action=url.searchParams.get('action')||'list';
  if(request.method==='GET' && action==='list'){const quizzes=await listQuizzes();return json({course,storage:storageMode(),quizzes:quizzes.map(publicQuiz)});}
  if(request.method==='GET' && action==='summary'){requireRole(role,['teacher','admin']);return json(await summary());}
  if(request.method!=='POST')return json({error:'المسار أو الطريقة غير متاح.'},405);
  const origin=request.headers.get('origin');if(origin && origin!==url.origin)return json({error:'مصدر الطلب غير مسموح.'},403);
  if(action==='create'){requireRole(role,['teacher']);const data=validateQuiz(await readBody(request));return json(publicQuiz(await createQuiz(data)),201);}
  if(action==='submit'){requireRole(role,['student']);const data=await readBody(request);if(!/^[0-9a-f-]{36}$/i.test(data?.quizId||''))throw new Error('معرّف الواجب غير صحيح.');const q=await getQuiz(data.quizId);if(!q)return json({error:'الواجب غير موجود.'},404);const score=grade(q,data.answers);return json(await saveAttempt(q,data.answers,score),201);}
  return json({error:'الإجراء غير موجود.'},404);
 }catch(e){if(e.status)return json({error:e.message},e.status);if(e instanceof SyntaxError)return json({error:'صيغة الطلب غير صحيحة.'},400);if(/أدخل|لكل سؤال|أجب|معرّف|JSON|فارغ/.test(e.message))return json({error:e.message},400);return json({error:'تعذر تنفيذ الطلب. تحقق من الاتصال وإعداد قاعدة البيانات.'},500);}
}};
