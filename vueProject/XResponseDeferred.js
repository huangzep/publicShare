/**
 * Created by doray on 12/21/15.
 */

var RSVP = require('rsvp');
var _object = require('lodash/object');
var _function = require('lodash/function');
var SuccessResponse = require('io/SuccessResponse');
var ErrorResponse = require('io/ErrorResponse');

function XResponseDeferred() {
  var deferred = RSVP.defer();
  _object.extend(this, deferred);
}

/**
 *
 * @param {Object} responseWrapper
 * @param {jQuery.jqXHR} responseWrapper.jqXHR
 * @param {string} responseWrapper.textStatus
 * @param {jQuery.Ajax} responseWrapper.jqAjax
 * @returns {Promise}
 */
XResponseDeferred.prototype.processResponse = function(responseWrapper) {
  var jqXHR = responseWrapper.jqXHR;
  var status = parseInt(jqXHR.status, 10);
  var statusText = jqXHR.statusText;
  var responseRawData = jqXHR.responseText;
  var contentType = jqXHR.getResponseHeader('Content-Type');
  var parsedResponse = responseRawData || {};
  var hasErrorMessage = false;
  var hasError = false;

  // @TODO allow to set up a media type handler via a middleware
  if (Boolean(contentType) && contentType.indexOf('application/json') !== -1) {
    parsedResponse = Boolean(responseRawData) ? JSON.parse(responseRawData) : {};
    // to remove the key `status` from JSON object
    responseRawData = Boolean(parsedResponse) ? parsedResponse : '';
    hasError = Boolean(parsedResponse.status) && parsedResponse.status === 'error';
  }

  if (status < 400 && status >= 200) {
    if (hasError) {
      this.reject(new ErrorResponse('error',  parsedResponse.error_message || responseRawData || statusText));
    } else {
      this.resolve(new SuccessResponse('okay', parsedResponse));
    }
  } else if (hasError || (status >= 400)) {
    this.reject(new ErrorResponse('error', parsedResponse.error_message || responseRawData || statusText));
  }

  return this.promise;
};

XResponseDeferred.prototype.getProcessor = function() {
  return _function.bind(this.processResponse, this);
};

module.exports = XResponseDeferred;