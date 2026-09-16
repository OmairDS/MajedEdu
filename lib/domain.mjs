export const course = 'مقدمة في المهارات الرقمية';
export const seed = {id:'11111111-1111-4111-8111-111111111111',title:'الواجب الأول · أساسيات رقمية',questions:[
 {text:'أي برنامج يُستخدم لإنشاء الجداول الحسابية؟',options:['Excel','الرسام','مشغّل الفيديو','الكاميرا'],correct:0},
 {text:'ما الخيار الأنسب لحماية الحساب؟',options:['مشاركة كلمة المرور','كلمة مرور قوية','استخدام الاسم فقط','ترك الحساب مفتوحاً'],correct:1},
 {text:'ما الامتداد الشائع للمستندات القابلة للطباعة؟',options:['MP3','JPG','PDF','MP4'],correct:2}
]};
export function requireRole(role, allowed){if(!allowed.includes(role)) throw Object.assign(new Error('هذا الإجراء غير متاح للدور المختار.'),{status:403});}
function validText(v,max){return typeof v==='string' && v.trim().length>0 && v.length<=max;}
export function validateQuiz(data){
 if(!data || !validText(data.title,100) || !Array.isArray(data.questions) || data.questions.length<1 || data.questions.length>20) throw new Error('أدخل عنواناً و١ إلى ٢٠ سؤالاً.');
 for(const q of data.questions){if(!q || !validText(q.text,500) || !Array.isArray(q.options) || q.options.length!==4 || !q.options.every(o=>validText(o,200)) || new Set(q.options.map(o=>o.trim())).size!==4 || !Number.isInteger(q.correct) || q.correct<0 || q.correct>3) throw new Error('لكل سؤال أربعة خيارات مختلفة وإجابة صحيحة واحدة.');}
 return {title:data.title.trim(),questions:data.questions.map(q=>({text:q.text.trim(),options:q.options.map(o=>o.trim()),correct:q.correct}))};
}
export function grade(quiz, answers){if(!Array.isArray(answers)||answers.length!==quiz.questions.length||answers.some(a=>!Number.isInteger(a)||a<0||a>3)) throw new Error('أجب عن جميع الأسئلة باختيار واحد لكل سؤال.');return answers.reduce((sum,a,i)=>sum+Number(a===quiz.questions[i].correct),0);}
export function publicQuiz(q){return {id:q.id,title:q.title,questions:q.questions.map(({text,options})=>({text,options}))};}
