import os from 'os';
import { cli } from 'lscontests';
import * as oicq from 'oicq';
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
        'hydro-oicq.groupId': string;
        'hydro-oicq.platform': number;
        'hydro-oicq.datadir': string;
    }
}

const emojis = ['(╯‵□′)╯︵┻━┻', '∑(っ°Д°;)っ', '(σﾟ∀ﾟ)σ..:*☆', '┗( ▔, ▔ )┛', '(*/ω＼*)', '（づ￣3￣）づ╭❤～'];

class OICQService implements BaseService {
    public started = false;

    private client: oicq.Client;
    public groups: oicq.Group[];

    validGroup(groupID: number) {
        const ids = this.groups.map((group) => group.group_id);
        return ids.includes(groupID);
    }

    async start() {
        try {
            const account = system.get('hydro-oicq.account');
            if (!account) throw Error('no account');
            const groupId = system.get('hydro-oicq.groupId').split(',');
            if (!groupId || groupId.length === 0) throw Error('no groupId');
            const platform = system.get('hydro-oicq.platform') || 1;
            const datadir = system.get('hydro-oicq.datadir') || `${os.homedir}/.hydro/oicq`;

            this.client = oicq.createClient(account, { data_dir: datadir, platform });
            this.client.on('system.login.slider', function f() {
                logger.info('Please input ticket:');
                process.stdin.once('data', (ticket) => this.submitSlider(String(ticket).trim()));
            });
            this.client.on('system.login.device', (event) => {
                logger.info('Device verification required');
                logger.info(`Secure Phone: ${event.phone}`);
                logger.info(event.url);
                logger.info('Please verify the device in the URL and press enter');
            });
            this.client.on('system.login.error', (event) => {
                switch (event.code) {
                    case oicq.LoginErrorCode.WrongPassword:
                        logger.info('Wrong account or password, please re-enter');
                        this.login();
                        break;
                    default:
                        break;
                }
            });
            this.client.on('system.online', () => {
                logger.info('Logged in!');
                this.groups = groupId.map((id) => this.client.pickGroup(parseInt(id, 10), true));
            });
            this.client.on('system.offline.kickoff', () => logger.warn('Kicked offline!'));
            this.client.on('system.offline.network', () => logger.warn('Network error causes offline!'));
            this.client.on('message.group', async (event) => {
                if (!this.validGroup(event.group_id)) return;
                const msgList = event.raw_message.split(' ');
                const command = msgList[0];
                if (command === '/help') this.help(event.group);
                else if (command === '/contest') cli(msgList.slice(1).join(' '), '/contest', (s) => event.group.sendMsg(s));
            });
            this.client.on('notice.group.poke', (event) => {
                if (!this.validGroup(event.group_id)) return;
                this.help(event.group);
            });

            this.client.login();
            if (!this.client.isOnline()) this.login();
        } catch (e) {
            logger.error('OICQ init fail.');
            logger.error(e.toString());
            return;
        }
        logger.info('OICQ initialized.');
        this.started = true;
    }

    async login() {
        logger.info('Please input password:');
        process.stdin.once('data', (password) => this.client.login(String(password).trim()));
    }

    async help(group: oicq.Group) {
        this.sendMsg(group, [
            '/contest: 查看最近 3 天各大 OJ 上的比赛信息，使用 /contest -h 查看关于此命令的更多信息',
            '/help: 查看此条帮助信息',
        ].map((s) => `${s}\n`), null, true);
    }

    async sendMsg(group: oicq.Group, messages: string[], url?: string, emoji = true) {
        const tail = [];
        if (emoji) tail.push(emojis[Math.floor(emojis.length * Math.random())]);
        if (url) tail.push(url);
        group.sendMsg([...messages, ...tail].join('\n'));
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
    if (rdoc.domainId !== 'system') return;
    if (!updated || rdoc.status !== builtin.STATUS.STATUS_ACCEPTED) return;
    const messages: string[] = [];
    const { pid, uid, domainId } = rdoc;
    const pdoc = await ProblemModel.get(domainId, pid);
    if (pdoc.hidden || pdoc.owner === rdoc.uid) return;
    const name = await getName(uid);
    messages.push(`${name} 刚刚 AC 了 ${pdoc.pid} ${pdoc.title}，orz！`);
    await Promise.all(service.groups.map((group) => service.sendMsg(group, messages, prefix ? `${prefix}/p/${pdoc.pid || pdoc.docId}` : null)));
});

bus.on('contest/add', async (tdoc, docId) => {
    if (tdoc.domainId !== 'system') return;
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
    await Promise.all(service.groups.map((group) => service.sendMsg(group, messages, _url)));
});

bus.on('discussion/add', async (ddoc) => {
    if (ddoc.domainId !== 'system') return;
    const messages: string[] = [];
    const name = await getName(ddoc.owner);
    messages.push(`${name} 刚刚创建了讨论：${ddoc.title}，快去看看吧~~~`);
    await Promise.all(
        service.groups.map(
            (group) =>
                service.sendMsg(group, messages, prefix ? `${prefix}/discuss/${ddoc.docId}#${ddoc.updateAt.getTime()}` : null),
        ),
    );
});
