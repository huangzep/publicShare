/**
 * Created by rosie on 12/24/16.
 */

var RequestURLs = require('io/RequestUrlsRouter');
var XResponseDeferred = require('io/XResponseDeferred');
var AbstractIO = require('io/AbstractIO');
var _Object = require('lodash/object');
var RequestActions = require('io/RequestActions');


function CollectionIO() {
  AbstractIO.call(this);
}

CollectionIO.prototype = _Object.create(AbstractIO.prototype, {
  constructor: CollectionIO
});

CollectionIO.prototype.create = function(data) {
  var deferred = new XResponseDeferred();

  return this.request({
    url: RequestURLs.getURL(RequestActions.COLLECTION_CREATE),
    method: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data)
  }).then(deferred.getProcessor());
};


CollectionIO.prototype.query = function(where) {
  var deferred = new XResponseDeferred();

  return this.request({
    url: RequestURLs.getURL(RequestActions.COLLECTION_QUERY, [where.collection_id]),
    method: 'get',
    contentType: 'application/json'
  }).then(deferred.getProcessor());
};


CollectionIO.prototype.update = function(where, data) {
  var deferred = new XResponseDeferred();

  return this.request({
    url: RequestURLs.getURL(RequestActions.COLLECTION_UPDATE, [where.collection_id]),
    method: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data)
  }).then(deferred.getProcessor());
};


CollectionIO.prototype.remove = function(where) {
  var deferred = new XResponseDeferred();

  return this.request({
    url: RequestURLs.getURL(RequestActions.COLLECTION_REMOVE, [where.collection_id]),
    method: 'delete'
  }).then(deferred.getProcessor());
};


module.exports = CollectionIO;