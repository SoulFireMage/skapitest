// Sanity-checks js/projects.js after an edit. Run from the repo root:
//   node .claude/skills/add-star/scripts/check_projects.js
// Exits non-zero if anything is wrong, so it can gate a commit.

var fs = require('fs');
eval(fs.readFileSync('js/projects.js', 'utf8'));

var problems = [];
var ids = {};
var topic = {}, method = {};
CLUSTERS.forEach(function (c) { topic[c.id] = c; });
METHOD_CLUSTERS.forEach(function (c) { method[c.id] = c; });

PROJECTS.forEach(function (p) {
  if (ids[p.id]) problems.push('duplicate project id: ' + p.id);
  ids[p.id] = true;
  ['id', 'name', 'cluster', 'year', 'lang', 'url', 'kat', 'rich'].forEach(function (k) {
    if (p[k] === undefined || p[k] === '') problems.push(p.id + ': missing ' + k);
  });
  if (!topic[p.cluster]) problems.push(p.id + ': unknown topic cluster ' + p.cluster);
  if (!method[METHOD_OF[p.id]]) problems.push(p.id + ': no valid METHOD_OF entry');
  if (typeof p.year !== 'number') problems.push(p.id + ': year must be a number');
  [p.url, p.alt].forEach(function (u) {
    if (u && !/^https:\/\//.test(u)) problems.push(p.id + ': link is not https: ' + u);
  });
});

Object.keys(METHOD_OF).forEach(function (id) {
  if (!ids[id]) problems.push('METHOD_OF names a project that does not exist: ' + id);
});

var seen = {};
THREADS.forEach(function (t) {
  if (!ids[t.a] || !ids[t.b]) problems.push('thread with unknown end: ' + t.a + ' - ' + t.b);
  if (t.a === t.b) problems.push('thread to itself: ' + t.a);
  var key = [t.a, t.b].sort().join('|');
  if (seen[key]) problems.push('duplicate thread: ' + key);
  seen[key] = true;
  if (!t.why) problems.push('thread without a reason: ' + key);
});

TRIVIA.forEach(function (t) {
  if (!ids[t.p]) problems.push('trivia for unknown project: ' + t.p);
});

// Crowding: the chart's layout spirals members out from the cluster centre,
// so a constellation much bigger than the rest starts to collide with its neighbours.
function counts(of) {
  var n = {};
  PROJECTS.forEach(function (p) { var c = of(p); n[c] = (n[c] || 0) + 1; });
  return n;
}
var byTopic = counts(function (p) { return p.cluster; });
var byMethod = counts(function (p) { return METHOD_OF[p.id]; });

console.log('projects ' + PROJECTS.length + ', threads ' + THREADS.length + ', trivia ' + TRIVIA.length);
console.log('by topic:  ' + JSON.stringify(byTopic));
console.log('by method: ' + JSON.stringify(byMethod));
Object.keys(byTopic).concat(Object.keys(byMethod)).forEach(function (c) {
  var n = byTopic[c] || byMethod[c];
  if (n > 11) console.log('warning: ' + c + ' has ' + n + ' stars; check the screenshot for overlaps');
});

if (problems.length) {
  console.log('\nPROBLEMS:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log('ok');
