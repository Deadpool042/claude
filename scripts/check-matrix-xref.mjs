import { readFileSync } from 'fs';

const cm = JSON.parse(readFileSync('./Docs/_spec/capability-matrix.json', 'utf-8'));
const plugins = JSON.parse(readFileSync('./Docs/_spec/plugins.json', 'utf-8'));
const features = JSON.parse(readFileSync('./Docs/_spec/features.json', 'utf-8'));
const cms = JSON.parse(readFileSync('./Docs/_spec/cms.json', 'utf-8'));

const pluginMap = new Map(plugins.plugins.map(p => [p.id, p]));
const featureMap = new Map(features.features.map(f => [f.id, f]));
const cmsMap = new Map(cms.cms.map(c => [c.id, c]));

const issues = [];

for (const entry of cm.matrix) {
  const feature = featureMap.get(entry.featureId);
  if (!feature) { issues.push(`MISSING FEATURE: ${entry.featureId}`); continue; }

  for (const row of entry.rows) {
    const cmsItem = cmsMap.get(row.cmsId);
    if (!cmsItem) { issues.push(`MISSING CMS: ${row.cmsId}`); continue; }

    if (row.recommendedPluginIds) {
      for (const pid of row.recommendedPluginIds) {
        const plugin = pluginMap.get(pid);
        if (!plugin) { issues.push(`MISSING PLUGIN: ${pid} in ${entry.featureId}/${row.cmsId}`); continue; }

        if (!plugin.cmsIds.includes(row.cmsId)) {
          issues.push(`CMS_MISMATCH: ${pid} ne supporte pas ${row.cmsId} (supporte: ${plugin.cmsIds.join(',')}) - feature ${entry.featureId}`);
        }

        if (!plugin.featureIds.includes(entry.featureId)) {
          issues.push(`FEATURE_MISMATCH: ${pid} ne couvre pas ${entry.featureId} (couvre: ${plugin.featureIds.join(',')}) - CMS ${row.cmsId}`);
        }
      }
    }
  }
}

// Also check consistency between capability-matrix.json and decision-rules.json
const dr = JSON.parse(readFileSync('./Docs/_spec/decision-rules.json', 'utf-8'));
for (const cmEntry of cm.matrix) {
  const drEntry = dr.matrix.find(e => e.featureId === cmEntry.featureId);
  if (!drEntry) {
    issues.push(`MISSING in DR: feature ${cmEntry.featureId} absent de decision-rules.json matrix`);
    continue;
  }
  for (const cmRow of cmEntry.rows) {
    const drRow = drEntry.rows.find(r => r.cmsId === cmRow.cmsId);
    if (!drRow) {
      issues.push(`MISSING ROW in DR: ${cmEntry.featureId}/${cmRow.cmsId} absent de decision-rules.json`);
      continue;
    }
    if (cmRow.classification !== drRow.classification) {
      issues.push(`CLASSIFICATION DIFF: ${cmEntry.featureId}/${cmRow.cmsId}: CM=${cmRow.classification} vs DR=${drRow.classification}`);
    }
  }
}

// Check features coverage
const matrixFeatureIds = new Set(cm.matrix.map(e => e.featureId));
for (const f of features.features) {
  if (!matrixFeatureIds.has(f.id)) {
    issues.push(`UNCOVERED FEATURE: ${f.id} (${f.label}) absent de la matrice`);
  }
}

console.log('=== ISSUES DE CROSS-REFERENCE ===');
issues.forEach(i => console.log(i));
console.log(`\nTotal: ${issues.length} issues`);
