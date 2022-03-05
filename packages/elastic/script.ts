import { iterateAllProblem, iterateAllProblemInDomain } from 'hydrooj/src/pipelineUtils';
import elastic from './service';

export const description = 'Elastic problem search re-index';

export async function run({ domainId }, report) {
    if (domainId) elastic.deleteByQuery({ index: 'problem', query: { term: { domainId } } });
    else elastic.deleteByQuery({ index: 'problem', query: { match_all: {} } });
    let i = 0;
    const cb = async (pdoc) => {
        if (!(++i % 1000)) report({ message: `${i} problems indexed` });
        await elastic.index({
            index: 'problem',
            id: `${pdoc.domainId}/${pdoc.docId}`,
            document: {
                domainId: pdoc.domainId,
                pid: pdoc.pid || '',
                title: pdoc.title,
            },
        }).catch((e) => console.log(`${pdoc.domainId}/${pdoc.docId}`, e));
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

global.Hydro.script.ensureElasticSearch = { run, description, validate };
