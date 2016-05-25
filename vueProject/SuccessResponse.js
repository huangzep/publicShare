/**
 * Created by doray on 12/10/15.
 */

function SuccessResponse (status, data) {
  this.status = status || 'okay';
  this.data = data;
}

SuccessResponse.prototype.setStatus = function(status) {
  this.status = status;
};

SuccessResponse.prototype.setData = function(data) {
  this.data = data;
};

SuccessResponse.prototype.getStatus = function() {
  return this.status;
};

SuccessResponse.prototype.getData = function() {
  return this.data;
};

module.exports = SuccessResponse;