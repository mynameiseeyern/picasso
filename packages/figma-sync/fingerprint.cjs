/**
 * Parity fingerprint — the same canonical lines computed from a figma.json
 * (repo side, `node fingerprint.js <figma.json>`) and from a live Figma file
 * (paste the FIGMA half into the plugin console, or run it via use_figma).
 * Equal hashes per section = identical variables / styles.
 */
function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); }
const num = (n) => String(Math.round(n * 1000) / 1000);
const effSig = (fx) => fx.map((f) => [f.type, num(f.x), num(f.y), num(f.blur), num(f.spread), f.colorVar].join(" ")).join(" | ");
function summarise(lines) {
  const out = {};
  for (const l of lines) { const k = l.split("|").slice(0, 2).join("|"); (out[k] = out[k] || []).push(l); }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { n: v.length, hash: fnv(v.sort().join("\n")) }]));
}
function fromPayload(p) {
  const lines = [];
  for (const c of p.collections) for (const v of c.variables) {
    const vals = Object.keys(v.values).sort().map((m) => { const x = v.values[m]; return `${m}=${x && x.alias ? "@" + x.alias : v.type === "FLOAT" ? num(x) : x}`; });
    lines.push(`V|${c.name}|${v.name}|${v.type}|${[...v.scopes].sort().join(",")}|${vals.join(";")}`);
  }
  for (const t of p.textStyles) lines.push(`T|text|${t.name}|${t.fontFamily}|${t.fontStyle}|${num(t.fontSize)}|${num(t.lineHeightPercent)}|${num(t.letterSpacingPercent)}|${t.textCase}|${Object.keys(t.bind).sort().map((k) => k + "=" + t.bind[k]).join(",")}`);
  for (const e of p.effectStyles) lines.push(`E|effect|${e.name}|${effSig(e.effects)}`);
  return lines;
}
// FIGMA:start
async function fromFigma() {
  const hex = (c) => { const h = (n) => Math.round(n * 255).toString(16).padStart(2, "0"); const a = c.a === undefined ? 1 : c.a; return ("#" + h(c.r) + h(c.g) + h(c.b) + (a < 0.999 ? h(a) : "")).toUpperCase(); };
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const name = (id) => (vars.find((v) => v.id === id) || {}).name;
  const lines = [];
  for (const v of vars) {
    const c = cols.find((x) => x.id === v.variableCollectionId);
    const vals = c.modes.map((m) => { const x = v.valuesByMode[m.modeId]; return [m.name, x && x.type === "VARIABLE_ALIAS" ? "@" + name(x.id) : v.resolvedType === "COLOR" ? hex(x) : v.resolvedType === "FLOAT" ? num(x) : x]; })
      .sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([m, x]) => `${m}=${x}`);
    lines.push(`V|${c.name}|${v.name}|${v.resolvedType}|${[...v.scopes].sort().join(",")}|${vals.join(";")}`);
  }
  for (const s of await figma.getLocalTextStylesAsync()) {
    const b = s.boundVariables || {};
    lines.push(`T|text|${s.name}|${s.fontName.family}|${s.fontName.style}|${num(s.fontSize)}|${num(s.lineHeight.value || 0)}|${num(s.letterSpacing.value)}|${s.textCase}|${Object.keys(b).sort().map((k) => k + "=" + name(b[k].id)).join(",")}`);
  }
  for (const s of await figma.getLocalEffectStylesAsync())
    lines.push(`E|effect|${s.name}|${effSig(s.effects.map((f) => ({ type: f.type, x: (f.offset && f.offset.x) || 0, y: (f.offset && f.offset.y) || 0, blur: f.radius || 0, spread: f.spread || 0, colorVar: f.boundVariables && f.boundVariables.color ? name(f.boundVariables.color.id) : "(unbound)" })))}`);
  return lines;
}
// FIGMA:end
if (typeof module !== "undefined" && require.main === module) {
  const p = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
  const lines = fromPayload(p);
  if (process.argv[3]) console.log(lines.filter((l) => l.includes(process.argv[3])).join("\n"));
  else console.log(JSON.stringify(summarise(lines)));
}
