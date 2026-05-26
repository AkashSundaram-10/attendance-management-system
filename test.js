const getWeek = (date) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
};

console.log("May 18:", getWeek(new Date('2026-05-18')));
console.log("May 24:", getWeek(new Date('2026-05-24')));
console.log("May 25:", getWeek(new Date('2026-05-25')));
console.log("May 31:", getWeek(new Date('2026-05-31')));
