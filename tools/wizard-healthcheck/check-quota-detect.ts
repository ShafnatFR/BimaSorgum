/**
 * Unit check for bimaClient.isUpstreamQuotaPayload — the detector that keeps an upstream
 * provider quota/rate-limit payload from being retried four times and then rendered raw
 * in the chat bubble. Run: npx tsx tools/wizard-healthcheck/check-quota-detect.ts
 */
import { isUpstreamQuotaPayload } from '../../src/services/bimaClient';

const providerPayload = JSON.stringify({
  error: {
    message: "[commandcode/Qwen/Qwen3.7-Flash] [429]: You've reached your weekly usage limit for your plan. Your limit resets at 2026-10-04T06:08:58.221Z. Please wait for the window to reset.",
  },
});

const cases: { name: string; text: string; expect: boolean }[] = [
  { name: 'provider 429 payload (observed body)', text: providerPayload, expect: true },
  {
    name: 'server ai error wrapper (python traceback style)',
    text: "Server AI gagal merespons: {'error': {'message': 'rate limit exceeded'}}",
    expect: true,
  },
  { name: 'bare 429 marker', text: 'error code: [429] too many requests', expect: true },
  { name: 'empty body', text: '', expect: false },
  {
    name: 'real recipe JSON',
    text: JSON.stringify({
      title: 'Nasi Sorgum Santan',
      ingredients: [{ name: 'Biji sorgum', amount: '150 gram', estimatedPrice: 3750 }],
      steps: [{ stepNumber: 1, title: 'Rebus', instruction: 'Rebus sorgum hingga empuk.', timerMinutes: 15 }],
    }),
    expect: false,
  },
  {
    name: 'long prose answer mentioning limits',
    text: 'Sorgum '.repeat(30) + 'memiliki batas kadar tanin yang perlu diperhatikan saat diolah menjadi minuman.',
    expect: false,
  },
  { name: 'short prose answer (no provider signature)', text: 'Sorgum adalah serealia yang kaya zat besi.', expect: false },
  { name: 'unpayload refusal JSON', text: JSON.stringify({ status: 'unpayload', message: 'Bahan tidak cocok', suggestions: [] }), expect: false },
];

let failed = 0;
for (const c of cases) {
  const got = isUpstreamQuotaPayload(c.text);
  const ok = got === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  expect=${c.expect} got=${got}  ${c.name}`);
}
console.log(failed === 0 ? 'ALL QUOTA-DETECT CHECKS PASS' : `${failed} QUOTA-DETECT CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
