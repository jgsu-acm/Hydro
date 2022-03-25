import { ProblemSearchOptions } from 'hydrooj/src/interface';
import DomainModel from 'hydrooj/src/model/domain';
import * as system from 'hydrooj/src/model/system';
import * as bus from 'hydrooj/src/service/bus';
import elastic from './service';

bus.on('problem/add', async (pdoc, pdocId) => {
    await elastic.index({
        index: 'problem',
        id: `${pdoc.domainId}/${pdocId}`,
        document: {
            domainId: pdoc.domainId,
            pid: pdoc.pid || '',
            title: pdoc.title,
            tags: pdoc.tag,
        },
    });
});

bus.on('problem/edit', async (pdoc) => {
    await elastic.update({
        index: 'problem',
        id: `${pdoc.domainId}/${pdoc.docId}`,
        doc: {
            pid: pdoc.pid,
            title: pdoc.title,
            tags: pdoc.tag,
        },
    });
});

bus.on('problem/del', async (domainId, pdocId) => {
    await elastic.delete({
        index: 'problem',
        id: `${domainId}/${pdocId}`,
    });
});

global.Hydro.lib.problemSearch = async (domainId: string, q: string, opts: ProblemSearchOptions) => {
    const size = opts?.limit || system.get('pagination.problem');
    const from = opts?.skip || 0;
    const union = await DomainModel.getUnion(domainId);
    const domainIds = [domainId, ...(union?.union || [])];
    q = q.toLowerCase();
    const res = await elastic.search({
        index: 'problem',
        size,
        from,
        query: {
            bool: {
                must: domainIds.map((i) => ({ term: { domainId: i } })),
                should: [
                    { prefix: { pid: q } },
                    { match: { title: q } },
                    { match: { tags: q } },
                ],
                minimum_should_match: 1,
            },
        },
    });
    return {
        hits: res.hits.hits.map((i) => i._id),
        total: typeof res.hits.total === 'number' ? res.hits.total : res.hits.total.value,
        countRelation: typeof res.hits.total === 'number' ? 'eq' : res.hits.total.relation,
    };
};
