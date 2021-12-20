import { ProblemDoc } from 'hydrooj';
import DomainModel from 'hydrooj/src/model/domain';
import * as system from 'hydrooj/src/model/system';
import * as bus from 'hydrooj/src/service/bus';
import sonic from './service';

function push(did: string, key: string, doc: Partial<ProblemDoc>, docId: number) {
    return sonic.push('problem', `${did}@${key}`, `${doc.domainId}/${docId}`, doc[key].toString());
}

function flusho(did: string, key: string, domainId: string, docId: number) {
    return sonic.flusho('problem', `${did}@${key}`, `${domainId}/${docId}`);
}

async function getTask(domainId: string, func: (did: string, key: string) => unknown) {
    const union = await DomainModel.searchUnion({ union: domainId, problem: true });
    const tasks = [];
    for (const did of [domainId, ...union.map((i) => i._id)]) {
        tasks.concat(['pid', 'title', 'content'].map((key) => func(did, key)));
    }
    await Promise.all(tasks);
}

bus.on('problem/add', async (ppdoc, docId) => getTask(ppdoc.domainId, (did: string, key: string) => push(did, key, ppdoc, docId)));

bus.on('problem/del', async (domainId, docId) => getTask(domainId, (did: string, key: string) => flusho(did, key, domainId, docId)));

bus.on('problem/edit', async (pdoc) => getTask(pdoc.domainId, (did: string, key: string) =>
    flusho(did, key, pdoc.domainId, pdoc.docId).then(() => push(did, key, pdoc, pdoc.docId))));

global.Hydro.lib.problemSearch = async (domainId: string, query: string, limit = system.get('pagination.problem')) => {
    const ids = await sonic.query('problem', `${domainId}@pid`, query, { limit });
    if (limit - ids.length > 0) ids.concat(await sonic.query('problem', `${domainId}@title`, query, { limit: limit - ids.length }));
    if (limit - ids.length > 0) ids.concat(await sonic.query('problem', `${domainId}@content`, query, { limit: limit - ids.length }));
    return ids;
};
