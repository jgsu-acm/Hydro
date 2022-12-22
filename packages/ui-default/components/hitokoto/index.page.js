import $ from 'jquery';
import { NamedPage } from 'vj/misc/Page';
import { i18n, request, tpl } from 'vj/utils';

export default new NamedPage('homepage', () => {
  function getJinrishici($containers) {
    $containers.get().forEach((container) => {
      new Promise((resolve) => {
        // eslint-disable-next-line global-require
        const jinrishici = require('jinrishici');
        jinrishici.load((result) => {
          resolve(result.data.content);
        });
      })
        .then((jinrishici) => {
          const dom = $(tpl`<p>${jinrishici}</p>`);
          dom.appendTo(container);
        })
        .catch((e) => {
          console.error(e);
          const dom = $(tpl`<p>${i18n('Cannot get jinrishici.')}</p>`);
          dom.appendTo(container);
        });
    });
  }
  if ($('[name="jinrishici"]')) getJinrishici($('[name="jinrishici"]'));
});
