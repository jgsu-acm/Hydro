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
    await elastic.index({
        index: 'problem',
        id: `${pdoc.domainId}/${pdoc.docId}`,
        document: {
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

global.Hydro.lib.problemSearch = async (domainId: string, query: string, limit = system.get('pagination.problem')) => {
    query = query.toLowerCase();
    const ids = await elastic.search({
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
        size: limit,
    });
    return ids.hits.hits.map((value) => `${value._id}`);
};
