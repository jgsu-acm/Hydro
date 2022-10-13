import {
    BadRequestError,
    definePlugin, ForbiddenError, Handler, post, SystemModel, Types,
} from 'hydrooj';
import { isPid, parsePid } from 'hydrooj/src/lib/validator';
import problem from 'hydrooj/src/model/problem';

const defaultProblemOwnerID = 1;

class ProblemCreateAPIHandler extends Handler {
    noCheckPermView = true;

    @post('title', Types.Title)
    @post('content', Types.Content)
    @post('pid', Types.Name, true, isPid, parsePid)
    @post('hidden', Types.Boolean)
    @post('token', Types.String)
    async post(
        domainId: string, title: string, content: string, pid: string,
        hidden = false, token: string,
    ) {
        const validToken = SystemModel.get('hydro-api.token');
        if (validToken && token !== validToken) throw new ForbiddenError();
        if (pid && await problem.get(domainId, pid)) throw new BadRequestError('ProblemID already exists');
        const docId = await problem.add(domainId, pid, title, content, defaultProblemOwnerID, [], hidden);
        this.response.body = { pid: pid || docId };
    }
}

export default definePlugin({
    apply(ctx) {
        ctx.Route('problem_rest_create', '/rest/problem', ProblemCreateAPIHandler);
    },
});
