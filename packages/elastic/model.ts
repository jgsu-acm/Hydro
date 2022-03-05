import * as system from 'hydrooj/src/model/system';
import * as bus from 'hydrooj/src/service/bus';
import elastic from './service';

bus.on('problem/add', async (doc, docId) => {
    await elastic.index({
        index: 'problem',
        document: {
            domainId: doc.domainId,
            docId,
            pid: doc.pid || '',
            title: doc.title,
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
        },
    });
});

bus.on('problem/del', async (domainId, docId) => {
    await elastic.delete({
        index: 'problem',
        id: `${domainId}/${docId}`,
    });
});

global.Hydro.lib.problemSearch = async (domainId: string, query: string, limit = system.get('pagination.problem')) => {
    const ids = await elastic.search({
        index: 'problem',
        query: {
            bool: {
                must: [{ term: { domainId } }],
                should: [
                    {
                        prefix: {
                            pid: query.toLowerCase(),
                        },
                    },
                    {
                        match: {
                            title: query.toLowerCase(),
                        },
                    },
                ],
                minimum_should_match: 1,
            },
        },
        size: limit,
    });
    return ids.hits.hits.map((value) => `${value._id}`);
};
