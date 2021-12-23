import DomainModel from 'hydrooj/src/model/domain';
import { iterateAllProblem, iterateAllProblemInDomain } from 'hydrooj/src/pipelineUtils';
import sonic from './service';

export const description = 'Sonic problem search re-index';

export async function run({ domainId }, report) {
    if (domainId) await sonic.flushb('problem', domainId);
    else await sonic.flushc('problem');
    let i = 0;
    const cb = async (pdoc) => {
        i++;
        if (!(i % 1000)) report({ message: `${i} problems indexed` });
        const union = await DomainModel.searchUnion({ union: pdoc.domainId, problem: true });
        const tasks = [];
        for (const did of [pdoc.domainId, ...union.map((j) => j._id)]) {
            tasks.concat(
                ['pid', 'title'].map((key) =>
                    pdoc[key] && sonic.push('problem', `${did}@${key}`, `${pdoc.domainId}/${pdoc.docId}`, pdoc[key].toString())),
            );
        }
        await Promise.all(tasks).catch((e) => console.log(`${pdoc.domainId}/${pdoc.docId}`, e));
    };
    if (domainId) await iterateAllProblemInDomain(domainId, ['pid', 'title'], cb);
    else await iterateAllProblem(['pid', 'title'], cb);
    return true;
}

export const validate = {
    $or: [
        { domainId: 'string' },
        { domainId: 'undefined' },
    ],
};

global.Hydro.script.ensureSonicSearch = { run, description, validate };
