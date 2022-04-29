import os from 'os';
import { Client, createClient, Group } from 'oicq';
import { BaseService } from 'hydrooj';
import { Logger } from 'hydrooj/src/logger';
import * as builtin from 'hydrooj/src/model/builtin';
import DomainModel from 'hydrooj/src/model/domain';
import { ProblemModel } from 'hydrooj/src/model/problem';
import * as system from 'hydrooj/src/model/system';
import UserModel from 'hydrooj/src/model/user';
import * as bus from 'hydrooj/src/service/bus';

const logger = new Logger('oicq');

declare module 'hydrooj/src/interface' {
    interface SystemKeys {
        'hydro-oicq.account': number;
        'hydro-oicq.groupId': number;
        'hydro-oicq.datadir': string;
    }
}

class OICQService implements BaseService {
    public started = false;
    public error = '';

    private client: Client;
    public group: Group;

    async start() {
        try {
            const account = system.get('hydro-oicq.account');
            if (!account) throw Error('no account');
            const groupId = system.get('hydro-oicq.groupId');
            if (!groupId) throw Error('no groupId');
            const datadir = system.get('hydro-oicq.datadir') || `${os.homedir}/.hydro/oicq`;

            this.client = createClient(account, { data_dir: datadir });
            this.client.on('system.login.qrcode', function cb() {
                logger.info('Please scan this qrcode and press enter.');
                process.stdin.once('data', () => {
                    this.login();
                });
            }).login();

            this.client.on('system.online', () => {
                logger.info('Logged in!');
                this.group = this.client.pickGroup(groupId, true);
                console.log(this.client.sl);
            });

            this.client.on('system.offline.kickoff', () => {
                logger.warn('Kicked offline!');
            });

            this.client.on('system.offline.network', () => {
                logger.warn('Network error causes offline!');
            });
        } catch (e) {
            logger.error('OICQ init fail.');
            logger.error(e.toString());
            return;
        }
        logger.info('OICQ initialized.');
        this.started = true;
    }
}

const service = new OICQService();
global.Hydro.service.oicq = service;
declare module 'hydrooj/src/interface' {
    interface Service {
        oicq: typeof service
    }
}

const emojis = ['(╯‵□′)╯︵┻━┻', '∑(っ°Д°;)っ', '(σﾟ∀ﾟ)σ..:*☆', '┗( ▔, ▔ )┛', '(*/ω＼*)', '（づ￣3￣）づ╭❤～'];

bus.on('record/judge', async (rdoc, updated) => {
    if (!updated) return;
    const accept = rdoc.status === builtin.STATUS.STATUS_ACCEPTED;
    if (accept) {
        const { pid, uid, domainId } = rdoc;
        const pdoc = await ProblemModel.get(domainId, pid);
        // @ts-ignore
        const dudoc = await DomainModel.getDomainUser(domainId, { _id: uid });
        const udoc = await UserModel.getById(domainId, uid);
        const userName = dudoc.displayName || udoc.uname;
        const message = `${userName} 刚刚 AC 了 ${pdoc.pid} ${pdoc.title}！\n${emojis[Math.floor(emojis.length * Math.random())]}`;
        await service.group.sendMsg(message);
    }
});
