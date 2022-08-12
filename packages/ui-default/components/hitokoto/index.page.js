import $ from 'jquery';
import { AutoloadPage } from 'vj/misc/Page';
import i18n from 'vj/utils/i18n';
import request from 'vj/utils/request';
import tpl from 'vj/utils/tpl';

const jinrishiciPage = new AutoloadPage('jinrishiciPage', () => {
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
  $(document).on('vjContentNew', (e) => {
    const elem = $(e.target).find('[name="jinrishici"]');
    if (elem.get) getJinrishici(elem);
  });
});

export default jinrishiciPage;
