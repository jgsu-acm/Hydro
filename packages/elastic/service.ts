import { Client, TransportRequestOptionsWithOutMeta } from '@elastic/elasticsearch';
import * as T from '@elastic/elasticsearch/lib/api/types';
import * as TB from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { BaseService } from 'hydrooj';
import { Logger } from 'hydrooj/src/logger';
import * as system from 'hydrooj/src/model/system';

const logger = new Logger('elastic');

declare module 'hydrooj/src/interface' {
    interface SystemKeys {
        'elastic.host': string;
        'elastic.port': number;
    }
}

class ElasticService implements BaseService {
    public started = false;
    public error = '';

    private client: Client;

    async start() {
        const host = system.get('elastic.host') || 'localhost';
        const port = system.get('elastic.port') || 9200;
        try {
            this.client = new Client({ node: `http://${host}:${port}` });
        } catch (e) {
            logger.warn('Elastic init fail. Will retry later.');
            this.error = e.toString();
            setTimeout(() => this.start(), 10000);
        }
        logger.info('Elastic initialized.');
        this.started = true;
    }

    async stop() {
        await this.client.close();
    }

    async index(params: T.IndexRequest<unknown> | TB.IndexRequest<unknown>, options?: TransportRequestOptionsWithOutMeta) {
        await this.client.index(params, options);
    }

    async update(params: T.UpdateRequest<unknown, unknown> | TB.UpdateRequest<unknown, unknown>, options?: TransportRequestOptionsWithOutMeta) {
        await this.client.update(params, options);
    }

    async search(params: T.SearchRequest | TB.SearchRequest, options?: TransportRequestOptionsWithOutMeta) {
        return await this.client.search(params, options);
    }

    async delete(params: T.DeleteRequest | TB.DeleteRequest, options?: TransportRequestOptionsWithOutMeta) {
        await this.client.delete(params, options);
    }

    async deleteByQuery(params: T.DeleteByQueryRequest | TB.DeleteByQueryRequest, options?: TransportRequestOptionsWithOutMeta) {
        await this.client.deleteByQuery(params, options);
    }
}

const service = new ElasticService();
global.Hydro.service.elastic = service;
export = service;
declare module 'hydrooj/src/interface' {
    interface Service {
        elastic: typeof service
    }
}
