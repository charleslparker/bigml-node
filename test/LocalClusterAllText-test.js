var assert = require('assert'),
  bigml = require('../index');

function truncate(number, decimals) {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10.0,
                                                                decimals);
}

describe('Manage local cluster objects', function () {
  var sourceId, source = new bigml.Source(), path = './data/spam.csv',
    datasetId, dataset = new bigml.Dataset(),
    clusterId, cluster = new bigml.Cluster(), clusterResource,
    clusterFinishedResource, seed = 'BigML tests',
    localCluster, firstCentroidDistance, secondCentroidDistance,
    prediction1 = 'Cluster 3', prediction2 = 'Cluster 1',
    prediction3 = 'Cluster 5';

  before(function (done) {
    var tokenMode = {'fields': {'000001': {'term_analysis': {'token_mode': 'all'}}}},
      textField = {'fields': {'000001': {'optype': 'text'}}};
    source.create(path, undefined, function (error, data) {
      assert.equal(data.code, bigml.constants.HTTP_CREATED);
      sourceId = data.resource;
      source.get(sourceId, true, function (error, data) {
        source.update(sourceId, textField, function (error, data) {
          dataset.create(sourceId, tokenMode, function (error, data) {
            assert.equal(data.code, bigml.constants.HTTP_CREATED);
            datasetId = data.resource;
            cluster.create(datasetId, {seed: seed, cluster_seed: seed, k: 8},
              function (error, data) {
                assert.equal(data.code, bigml.constants.HTTP_CREATED);
                clusterId = data.resource;
                clusterResource = data;
                cluster.get(clusterResource, true, 'only_model=true',
                  function (error, data) {
                    clusterFinishedResource = data;
                    done();
                  });
            });
          });
        });
      });
    });
  });

  describe('LocalCluster(clusterId)', function () {
    it('should create a localCluster from a cluster Id', function (done) {
      localCluster = new bigml.LocalCluster(clusterId);
      if (localCluster.ready) {
        assert.ok(true);
        done();
      } else {
        localCluster.on('ready', function () {assert.ok(true);
          done();
          });
      }
    });
  });
  describe('#centroid(inputData, callback)', function () {
    it('should predict centroids asynchronously from input data', function (done) {
      var inputData = {'Type': 'ham', 'Message': 'mobile mobile call'};
      localCluster.centroid(inputData, function (error, data) {
        assert.equal(data.centroidName, prediction1);
        firstCentroidDistance = truncate(data.distance, 5);
        var centroidName = data.centroidName;
        var centroid = new bigml.Centroid();
        centroid.create(clusterId, inputData, function (error, data) {
            assert.equal(centroidName, data.object.centroid_name);
            assert.equal(firstCentroidDistance, data.object.distance);
            centroid.delete(data.resource, function (error, data) {
              assert.equal(error, null);
              done();
            });
        });
      });
    });
  });
  describe('#centroid(inputData)', function () {
    it('should predict centroids synchronously from input data', function (done) {
      var inputData = {'Type': 'ham', 'Message': 'Ok'};
      var prediction = localCluster.centroid(inputData);
      assert.equal(prediction.centroidName, prediction2);
      secondCentroidDistance = truncate(prediction.distance, 5);
      var centroidName = prediction.centroidName;
      var centroid = new bigml.Centroid();
      centroid.create(clusterId, inputData, function (error, data) {
          assert.equal(centroidName, data.object.centroid_name);
          assert.equal(secondCentroidDistance, data.object.distance);
          centroid.delete(data.resource, function (error, data) {
            assert.equal(error, null);
            done();
          });
      });
    });
  });
  describe('#centroid(inputData)', function () {
    it('should predict centroids synchronously from empty input data', function (done) {
      var inputData = {};
      var prediction = localCluster.centroid(inputData);
      assert.equal(prediction.centroidName, prediction3);
      secondCentroidDistance = truncate(prediction.distance, 5);
      var centroidName = prediction.centroidName;
      var centroid = new bigml.Centroid();
      inputData = {"Type":"", "Message":""};
      centroid.create(clusterId, inputData, function (error, data) {
          assert.equal(centroidName, data.object.centroid_name);
          assert.equal(secondCentroidDistance, data.object.distance);
          centroid.delete(data.resource, function (error, data) {
            assert.equal(error, null);
            done();
          });
      });
    });
  });
  after(function (done) {
    source.delete(sourceId, function (error, data) {
      assert.equal(error, null);
      done();
    });
  });
  after(function (done) {
    dataset.delete(datasetId, function (error, data) {
      assert.equal(error, null);
      done();
    });
  });
  after(function (done) {
    cluster.delete(clusterId, function (error, data) {
      assert.equal(error, null);
      done();
    });
  });
});
