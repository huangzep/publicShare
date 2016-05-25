/**
 * Created by doray on 12/9/15.
 */

var _ = require('lodash/object');
var RSVP = require('rsvp');
var jQuery = require('jquery');

require('libs/jquery.cookie/jquery.cookie');

var CSRF_SAFE = /^(GET|HEAD|OPTIONS|TRACE)$/i;

function BasicOperation(whereClause, handler) {
  this.whereClause = whereClause;
  this.operationHandler = handler;
}

BasicOperation.prototype.config = function(config) {
  this.configIO = config;
  return this;
};

BasicOperation.prototype.create = function(data) {
  return this.operationHandler.create(this.whereClause, data, this.configIO);
};

BasicOperation.prototype.update = function(data) {
  return this.operationHandler.update(this.whereClause, data, this.configIO);
};

BasicOperation.prototype.query = function() {
  return this.operationHandler.query(this.whereClause, this.configIO);
};

BasicOperation.prototype.remove = function() {
  return this.operationHandler.remove(this.whereClause, this.configIO);
};

function AbstractIO() {
}

AbstractIO.prototype.where = function(whereClause) {
  return new BasicOperation(whereClause, this);
};

AbstractIO.prototype.request = function(ajaxSettings) {
  var deferred = RSVP.defer();
  var settings = ajaxSettings;

  if (!Boolean(ajaxSettings)) {
    deferred.reject('the AJAX config not defined');
    return;
  }

  if (!CSRF_SAFE.test(/* jQuery 2.x */ ajaxSettings.method || /* jQuery 1.x */ ajaxSettings.type)) {
    settings = _.defaultsDeep({
      headers: {
        // fix the issue: for some reason the HTTP header X-CSRFToken cannot be set in WeChat webview.
        'X-CSRFToken': jQuery.cookie('csrftoken')
      },
      beforeSend: function(jqXHR) {
        // NOTE: `this` refers to jQuery Ajax
        if (!this.crossDomain) {
          jqXHR.setRequestHeader("X-CSRFToken", jQuery.cookie('csrftoken'));
        }

        if (Boolean(ajaxSettings.beforeSend)) {
          ajaxSettings.beforeSend.apply(this, arguments);
        }
      }
    }, ajaxSettings);
  }

  jQuery.ajax(settings).complete(function(jqXHR, textStatus) {
    deferred.resolve({
      jqXHR: jqXHR,
      textStatus: textStatus,
      jqAjax: this
    });
  });

  return deferred.promise;
};

AbstractIO.prototype.create = function(where, data, config) {};
AbstractIO.prototype.query = function(where, config) {};
AbstractIO.prototype.update = function(where, data, config) {};
AbstractIO.prototype.remove = function(where, config) {};

module.exports = AbstractIO;



