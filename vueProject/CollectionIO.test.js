/**
 * Created by rosie on 07/01/16.
 */

require('chai').use(require('sinon-chai'));

const RSVP = require('rsvp');
const _Object = require('lodash/object');
const AbstractIO = require('io/AbstractIO');
const CollectionIO = require('io/CollectionIO');
const RequestURLs = require('io/RequestUrlsRouter');
const RequestActions = require('io/RequestActions');
const SuccessResponse = require('io/SuccessResponse');
const ErrorResponse = require('io/ErrorResponse');

const CollectionRightData = {
  'image': 'base64data',
  'introduction': '智能自行车，智能自行车',
  'name': '智能自行车'
};

const CollectionErrorData = {
  'image': '',
  'introduction': '智能自行车，智能自行车',
  'name': '智能自行车'
};

const SuccessResponseData = {
  "created_at": 1452234959,
  "editors_pick": false,
  "id": 11,
  "image": "/media/user_files/lime/55/99/55996a.jpg",
  "introduction": "智能自行车，智能自行车，",
  "minds": [],
  "name": "智能自行车",
  "resource_uri": "/api/collection/11/",
  "share_count": 0,
  "shared_count": 0,
  "special_selection": false,
  "subscribed": false,
  "subscriber_count": 0,
  "updated_at": 1452234959,
  "vote_count": 0
};

const ErrorMessage = {
  'status': 'error'
};


describe('CollectionIO', function() {

  var collectionIO;
  var fakeServer;

  beforeEach(function() {
    collectionIO = new CollectionIO();
    fakeServer = sinon.fakeServer.create();

    fakeServer.respondWith('/api/normal/', [200, {'Content-Type': 'application/json'}, JSON.stringify(SuccessResponseData)]);
    fakeServer.respondWith('/api/error/', [400, {'Content-Type': 'application/json'}, JSON.stringify(ErrorMessage)]);
  });

  afterEach(function() {
    fakeServer.restore();
  });

  it('should be an instanceo of CollectionIO and AbstractIO', function() {
    expect(collectionIO).to.be.instanceof(CollectionIO);
    expect(collectionIO).to.be.instanceof(AbstractIO);
  });


  it('should return a SuccessResponse object when create a collection succeeded', function (done) {
    sinon.stub(RequestURLs, 'getURL').withArgs(RequestActions.COLLECTION_CREATE).returns('/api/normal/');

    collectionIO.create(CollectionRightData).then(function (response) {
      expect(response.status).to.equal('okay');
      expect(response.data).to.eql(SuccessResponseData);
      done();
    }).catch(done).finally(function() {
      RequestURLs.getURL.restore();
    });

    fakeServer.respond();
  });

  it('should return a ErrorMessage object when create a collection failed', function (done) {
    sinon.stub(RequestURLs, 'getURL').withArgs(RequestActions.COLLECTION_CREATE).returns('/api/error/');

    collectionIO.create(CollectionRightData).catch(function (reason) {
      expect(reason.status).to.equal('error');
      expect(reason.message).to.eql(ErrorMessage);
      done();
    }).catch(done).finally(function() {
      RequestURLs.getURL.restore();
    });

    fakeServer.respond();
  });


  it('should return a SuccessResponse object when update a collection succeeded', function (done) {
    sinon.stub(RequestURLs, 'getURL').withArgs(RequestActions.COLLECTION_UPDATE).returns('/api/normal/');

    collectionIO.update({
      collection_id: 1
    }, CollectionRightData).then(function (response) {
      expect(response.status).to.equal('okay');
      expect(response.data).to.eql(SuccessResponseData);
      done();
    }).catch(done).finally(function() {
      RequestURLs.getURL.restore();
    });

    fakeServer.respond();
  });

  it('should return a ErrorMessage object when update a collection failed', function (done) {
    sinon.stub(RequestURLs, 'getURL').withArgs(RequestActions.COLLECTION_UPDATE).returns('/api/error/');

    collectionIO.update({
      collection_id: 1
    }, CollectionRightData).catch(function (reason) {
      expect(reason.status).to.equal('error');
      expect(reason.message).to.eql(ErrorMessage);
      done();
    }).catch(done).finally(function() {
      RequestURLs.getURL.restore();
    });

    fakeServer.respond();
  });


  it('should return okay status when remove a collection succeeded', function (done) {
    sinon.stub(RequestURLs, 'getURL').withArgs(RequestActions.COLLECTION_REMOVE).returns('/api/normal/');

    collectionIO.remove({
      collection_id: 1
    }).then(function (response) {
      expect(response.status).to.equal('okay');
      expect(response.data).to.eql(SuccessResponseData);
      done();
    }).catch(done).finally(function() {
      RequestURLs.getURL.restore();
    });

    fakeServer.respond();
  });

  it('should return error status when remove a collection failed', function (done) {
    sinon.stub(RequestURLs, 'getURL').withArgs(RequestActions.COLLECTION_REMOVE).returns('/api/error/');

    collectionIO.remove({
      collection_id: 1
    }).catch(function (reason) {
      expect(reason.status).to.equal('error');
      expect(reason.message).to.eql(ErrorMessage);
      done();
    }).catch(done).finally(function() {
      RequestURLs.getURL.restore();
    });

    fakeServer.respond();
  });

});