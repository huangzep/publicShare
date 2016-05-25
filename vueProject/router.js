import RequestUrlsRouter from 'io/RequestUrlsRouter';
import Actions from 'io/RequestActions';

/**
 * @name router
 * @module v-plugins/router.js
 * @see module:v-plugins
 * @desc 注册路由
 *
 * @author rosie
 */

module.exports = {
  install() {
    const API_BASE = '/api/';

    RequestUrlsRouter.setRouterList([
      {
        name: Actions.COLLECTION_CREATE,
        urlExpr: API_BASE + 'collection/'
      }, {
        name: Actions.COLLECTION_QUERY,
        urlExpr: API_BASE + 'collection/<collection_id>'
      }, {
        name: Actions.COLLECTION_UPDATE,
        urlExpr: API_BASE + 'collection/<collection_id>'
      }, {
        name: Actions.COLLECTION_REMOVE,
        urlExpr: API_BASE + 'collection/<collection_id>'
      }
    ]);
  }
};