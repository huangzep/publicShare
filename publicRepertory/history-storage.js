/**
 * Created by rosie on 2015-11-10.
 */
(function(global) {
  'use strict';
  /**
  * localStorage 缓存溢出异常字段
  */
  var STORAGE_OVREFLOW = 'QuotaExceededError';
  var SECOND_TO_MSEC = 1000;
  var ONE_DAY_SECOND = 86400;
  var expiresAt;
  /**
   * @class
   *   history storage
   *
   * @description
   *   历史本地存储插件，提供数据本地存储，获取本地存储数据和清除本地存储数据。
   */
  function HistoryStorage () {
  }
  /**
   * @description
   *   设置本地缓存。
   *
   * @example
   *   var key = 'KAY_IFANR';
   *   var value = {
   *     data: 'data'
   *   };
   *   var config = {
   *     expiresIn: 10000
   *   };
   *   HistoryStorage.setCache(key, value, options);
   *
   *
   * @param {String} key 设置本地缓存键名
   * @param {Object} value 需要存储的本地缓存数据
   * @param {Int >= 0} config.expiresIn 本地缓存期效，单位秒，如果为空则默认 1 天
   */

  HistoryStorage.prototype.setCache = function(key, value, config){
    var nowTime = new Date().getTime();
    var expiresIn = config && config.expiresIn ? config.expiresIn : ONE_DAY_SECOND;
    var history;

    if (!key || !value) {
      return undefined;
    }

    expiresAt = nowTime + parseInt(expiresIn * SECOND_TO_MSEC);
    history = {data: value, timeStamp: expiresAt};

    /** 捕捉本地存储超出异常，超出限额清除客户端本地缓存后重设 */
    try {
      localStorage.setItem(key, JSON.stringify(history));
    } catch (oException) {
      if (oException.name === STORAGE_OVREFLOW) {
        this.removeAll();
        localStorage.setItem(key, JSON.stringify(history));
      }
    }
  };


  /**
   * @description
   *   获取本地缓存。
   *
   * @return {Object} 键名下的本地缓存或缓存分类目录下的数据
   */
  HistoryStorage.prototype.getCache = function(key){
    var history = localStorage.getItem(key);
    var nowTime = new Date().getTime();

    if(history){
      history = JSON.parse(history) || {};

      if (history.timeStamp < nowTime) {
        this.removeItem(key);
        return undefined;
      }

      return history;
    }

    return undefined;
  };


  /**
   * @description
   *   清除键名下的本地缓存。
   */
  HistoryStorage.prototype.removeItem = function(key) {
    localStorage.removeItem(key);
  };

  /**
  * @description
  *   清除客户端本地缓存。
  */
  HistoryStorage.prototype.removeAll = function() {
    localStorage.clear();
  };

  var historyStorage = new HistoryStorage();
  global.historyStorage = historyStorage;

})(window);