/**
 * Created by doray on 12/10/15.
 */

var ErrorResponse = function(status, message) {
  this.status = status || 'error';
  this.message = message;
};

ErrorResponse.prototype.setStatus = function(status) {
  this.status = status;
};

ErrorResponse.prototype.setMessage = function(message) {
  this.message = message;
};

ErrorResponse.prototype.getStatus = function() {
  return this.status;
};

ErrorResponse.prototype.setMessage = function() {
  return this.message;
};

module.exports = ErrorResponse;