const domain = require('../model/domain');
const system = require('../model/system');
const setting = require('../model/setting');
const { Route, Handler } = require('../service/server');
const { PRIV_EDIT_SYSTEM } = require('../model/builtin').PRIV;
const hpm = require('../lib/hpm');
const loader = require('../loader');

class SystemHandler extends Handler {
    async prepare({ domainId }) {
        this.checkPriv(PRIV_EDIT_SYSTEM);
        this.domain = await domain.get(domainId);
    }
}

class SystemDashboardHandler extends SystemHandler {
    async get() {
        const path = [
            ['Hydro', 'homepage'],
            ['manage', null],
            ['manage_dashboard', null],
        ];
        this.response.template = 'manage_dashboard.html';
        this.response.body = { domain: this.domain, path };
    }
}

class SystemModuleHandler extends SystemHandler {
    async get() {
        const installed = await hpm.getInstalled();
        const path = [
            ['Hydro', 'homepage'],
            ['manage', null],
            ['manage_module', null],
        ];
        this.response.body = { installed, active: loader.active, path };
        this.response.template = 'manage_module.html';
    }

    async postInstall({ url, id }) {
        await hpm.install(url, id);
        this.back();
    }

    async postDelete({ id }) {
        await hpm.del(id);
        this.back();
    }
}

class SystemSettingHandler extends SystemHandler {
    async get() {
        this.response.template = 'manage_settings.html';
        const current = {};
        const settings = setting.SYSTEM_SETTINGS;
        for (const s of settings) {
            // eslint-disable-next-line no-await-in-loop
            current[s.key] = await system.get(s.key);
        }
        this.response.body = {
            current, settings,
        };
    }

    async post(args) {
        const tasks = [];
        for (const key in args) {
            if (typeof args[key] === 'object') {
                const subtasks = [];
                for (const sub in args[key]) {
                    if (setting.SYSTEM_SETTINGS_BY_KEY[`${key}.${sub}`]) {
                        const s = setting.SYSTEM_SETTINGS_BY_KEY[`${key}.${sub}`];
                        if (s.ui === 'checkbox') {
                            if (args[key][sub] === 'on') {
                                subtasks.push(system.set(`${key}.${sub}`, true));
                            } else {
                                subtasks.push(system.set(`${key}.${sub}`, false));
                            }
                        } else {
                            subtasks.push(system.set(`${key}.${sub}`, args[key][sub]));
                        }
                    }
                }
                tasks.push(Promise.all(subtasks));
            } else tasks.push(system.set(key, args[key]));
        }
        await Promise.all(tasks);
        this.back();
    }
}

async function apply() {
    Route('system_dashboard', '/system', SystemDashboardHandler);
    Route('system_module', '/system/module', SystemModuleHandler);
    Route('system_setting', '/system/setting', SystemSettingHandler);
}

global.Hydro.handler.manage = module.exports = apply;
