import { writeFileSync } from 'node:fs';
import { catalogTargets } from './add-comment-from-issue.mjs';
writeFileSync('public/comment-targets.json', JSON.stringify(catalogTargets()));
