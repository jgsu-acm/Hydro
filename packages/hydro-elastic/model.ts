import { ProblemSearchOptions } from 'hydrooj/src/interface';
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

global.Hydro.lib.problemSearch = async (domainId: string, query: string, options: ProblemSearchOptions) => {
    query = query.toLowerCase();
    const res = await elastic.search({
        index: 'problem',
        query: {
            bool: {
                must: [{ term: { domainId } }],
                should: [
                    { prefix: { pid: query } },
                    { match: { title: query } },
                    { match: { tags: query } },
                ],
                minimum_should_match: 1,
            },
        },
        size: options.limit,
    });
    return {
        hits: res.hits.hits.map((i) => i._id),
        total: typeof res.hits.total === 'number' ? res.hits.total : res.hits.total.value,
        countRelation: typeof res.hits.total === 'number' ? 'eq' : res.hits.total.relation,
    };
};
