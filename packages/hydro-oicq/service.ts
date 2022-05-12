import os from 'os';
import { cli } from 'lscontests';
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

const emojis = ['(╯‵□′)╯︵┻━┻', '∑(っ°Д°;)っ', '(σﾟ∀ﾟ)σ..:*☆', '┗( ▔, ▔ )┛', '(*/ω＼*)', '（づ￣3￣）づ╭❤～'];

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
            });

            this.client.on('system.offline.kickoff', () => {
                logger.warn('Kicked offline!');
            });

            this.client.on('system.offline.network', () => {
                logger.warn('Network error causes offline!');
            });

            this.client.on('message.group', async (event) => {
                const msgList = event.raw_message.split(' ');
                const command = msgList[0];
                if (command === '/help') {
                    this.sendMsg([
                        '/contest: 查看最近 3 天各大 OJ 上的比赛信息，使用 /contest -h 查看关于此命令的更多信息',
                        '/help: 查看此条帮助信息',
                    ], null, true);
                } else if (command === '/contest') {
                    cli(msgList.slice(1).join(' '), '/contest').then((s) => this.group.sendMsg(s));
                }
            });
        } catch (e) {
            logger.error('OICQ init fail.');
            logger.error(e.toString());
            return;
        }
        logger.info('OICQ initialized.');
        this.started = true;
    }

    async sendMsg(messages: string[], url?: string, emoji = true) {
        const tail = [];
        if (emoji) tail.push(emojis[Math.floor(emojis.length * Math.random())]);
        if (url) tail.push(url);
        this.group.sendMsg([...messages, ...tail].join('\n'));
    }
}

const service = new OICQService();
global.Hydro.service.oicq = service;
declare module 'hydrooj/src/interface' {
    interface Service {
        oicq: typeof service
    }
}

const url = system.get('server.url');
const prefix = url.endsWith('/') ? url.slice(0, -1) : url;

async function getName(uid: number) {
    return (await DomainModel.getDomainUser('system', { _id: uid })).displayName || (await UserModel.getById('system', uid)).uname;
}

bus.on('record/judge', async (rdoc, updated) => {
    if (!updated || rdoc.status !== builtin.STATUS.STATUS_ACCEPTED) return;
    const messages: string[] = [];
    const { pid, uid, domainId } = rdoc;
    const pdoc = await ProblemModel.get(domainId, pid);
    if (pdoc.hidden) return;
    const name = await getName(uid);
    messages.push(`${name} 刚刚 AC 了 ${pdoc.pid} ${pdoc.title}，orz！`);
    await service.sendMsg(messages, prefix ? `${prefix}/p/${pdoc.pid || pdoc.docId}` : null);
});

bus.on('contest/add', async (tdoc, docId) => {
    const messages: string[] = [];
    const name = await getName(tdoc.owner);
    let _url: string;
    if (tdoc.rule === 'homework') {
        messages.push(`${name} 刚刚创建了作业：${tdoc.title}，快去完成吧~~~`);
        messages.push(`结束时间：${tdoc.endAt}`);
        _url = prefix ? `${prefix}/homework/${docId}` : null;
    } else {
        messages.push(`${name} 刚刚创建了比赛：${tdoc.title}，快去报名吧~~~`);
        messages.push(`开始时间：${tdoc.beginAt}`);
        messages.push(`结束时间：${tdoc.endAt}`);
        messages.push(`赛制：${tdoc.rule}`);
        _url = prefix ? `${prefix}/contest/${docId}` : null;
    }
    await service.sendMsg(messages, _url);
});

bus.on('discussion/add', async (ddoc) => {
    const messages: string[] = [];
    const name = await getName(ddoc.owner);
    messages.push(`${name} 刚刚创建了讨论：${ddoc.title}，快去看看吧~~~`);
    await service.sendMsg(messages, prefix ? `${prefix}/discuss/${ddoc.docId}#${ddoc.updateAt.getTime()}` : null);
});
