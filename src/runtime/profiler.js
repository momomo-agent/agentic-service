const marks = new Map();

export function startMark(label) {
  marks.set(label, Date.now());
}

export function endMark(label) {
  const start = marks.get(label);
  if (!start) return null;
  const elapsed = Date.now() - start;
  marks.delete(label);
  return elapsed;
}

export function measurePipeline(stages) {
  const total = stages.reduce((s, st) => s + st.durationMs, 0);
  return { stages, total, pass: total < 2000 };
}
