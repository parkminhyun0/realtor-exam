// stream-json NDJSON → 사람이 읽는 한 줄 로그.
// agy(Antigravity)의 event/step_update 형식과 Claude Code의 type/message.content 형식을 모두 받는다.
import readline from 'node:readline';

const label = process.argv[2] || '';
const t0 = Date.now();
const clock = () => {
  const s = Math.floor((Date.now() - t0) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const cut = (s, n = 150) => {
  const one = String(s).replace(/\s+/g, ' ').trim();
  return one.length > n ? `${one.slice(0, n)}…` : one;
};
const say = (icon, msg) => console.log(`[${clock()}] ${label} ${icon} ${msg}`);

// codex 는 JSON 이 아닌 원문을 그대로 흘린다. 그대로 찍으면 토큰 수·훅 알림·
// 파일 내용 에코가 화면을 가득 채워, 어느 패널이 무엇을 하는지 볼 수 없다.
// 실행 내용은 건드리지 않고 **보이는 것만** 줄인다.
const ANSI = /\[[0-9;?]*[A-Za-z]/g;
function isNoise(s) {
  if (!s) return true;
  if (/^[\d,.\s]+$/.test(s)) return true;                 // 39,897 같은 토큰 수
  if (/^tokens? used$/i.test(s)) return true;
  if (/^hook: /.test(s)) return true;                     // hook: PostToolUse Completed
  if (/^(thinking|codex|user|assistant)$/i.test(s)) return true;
  if (/^[-=_*·•\s]+$/.test(s)) return true;               // 구분선
  // 산출물 에코 — 항목 한 줄씩 되뇌는 것. 진행 상황이 아니다.
  if (/^\+?\s*['"]?(strong|lemma|translit|translitKo|glossKo|glossEn|note|review|evidence)['"]?\s*:/.test(s)) return true;
  if (/^\+?\s*['"]?[HG]\d{1,5}['"]?\s*:/.test(s)) return true;  // H4191: { …
  if (/^[{}\[\],]+$/.test(s)) return true;
  return false;
}
// 생략한 줄이 쌓이면 한 줄로 알려 준다. 패널이 죽은 것처럼 보이지 않게.
let hidden = 0;
function noteHidden() {
  hidden += 1;
  if (hidden % 40 === 0) say('·', `작업 중 … (${hidden}줄 생략)`);
}

// 같은 도구가 연달아 도는 것은 한 줄로 묶는다. run_command 가 스무 번 이어지면
// 화면이 번호 목록으로 덮이고 정작 무엇을 하는지가 묻힌다.
let lastTool = '';
let sameRun = 0;
function sayTool(text, key) {
  if (key === lastTool) {
    sameRun += 1;
    if (sameRun % 5 !== 0) return;
    say('🔧', `${text} ×${sameRun + 1}`);
    return;
  }
  lastTool = key;
  sameRun = 0;
  say('🔧', text);
}

let tools = 0;
let textChars = 0;
const rl = readline.createInterface({ input: process.stdin, terminal: false });

function firstString(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

rl.on('line', (line) => {
  const raw = line.replace(ANSI, '').trim();
  if (!raw) return;
  if (!raw.startsWith('{')) {
    if (isNoise(raw)) return noteHidden();
    say('·', cut(raw));
    return;
  }
  let ev;
  try {
    ev = JSON.parse(raw);
  } catch {
    if (isNoise(raw)) return noteHidden();
    say('·', cut(raw));
    return;
  }

  // --- agy 형식 ---
  if (ev.event) {
    if (ev.event === 'init') {
      say('▶', `시작 · model=${ev.init?.model || '?'}`);
      return;
    }
    if (ev.event === 'result') {
      const r = ev.result || {};
      say('✅', cut(firstString(r, ['text', 'response', 'summary']) || `완료 (출력 ${textChars}자, 도구 ${tools}회)`));
      return;
    }
    if (ev.event === 'step_update') {
      const su = ev.step_update || {};
      if (su.state && su.state !== 'DONE' && su.state !== 'RUNNING') return;
      const type = su.step_type || 'step';
      if (type === 'agent_response') {
        const txt = su.text_delta || '';
        textChars += txt.length;
        if (txt.trim()) say('💬', cut(txt));
        return;
      }
      if (type === 'user_input' || type === 'checkpoint') return;
      tools += 1;
      const name = firstString(su, ['tool_name', 'name', 'command', 'title']) || type;
      const hint = firstString(su, ['file_path', 'path', 'command', 'query', 'text_delta']);
      sayTool(`#${tools} ${name}${hint ? ` · ${cut(hint, 80)}` : ''}`, name);
      return;
    }
    say('·', cut(ev.event));
    return;
  }

  // --- Claude Code 형식 ---
  const blocks = ev?.message?.content ?? ev?.content ?? [];
  const list = Array.isArray(blocks) ? blocks : [blocks];
  for (const b of list) {
    if (!b || typeof b !== 'object') continue;
    if (b.type === 'text' && b.text?.trim()) {
      textChars += b.text.length;
      say('💬', cut(b.text));
    } else if (b.type === 'tool_use') {
      tools += 1;
      const inp = b.input || {};
      const hint = firstString(inp, ['file_path', 'path', 'command', 'pattern', 'description']);
      sayTool(`#${tools} ${b.name || 'tool'}${hint ? ` · ${cut(hint, 80)}` : ''}`, b.name || 'tool');
    }
  }
  if (ev.type === 'result') {
    say(ev.is_error ? '❌' : '✅', cut(ev.result ?? ev.subtype ?? 'done'));
  }
});

rl.on('close', () => say('—', `스트림 종료 (도구 ${tools}회, 출력 ${textChars}자)`));
