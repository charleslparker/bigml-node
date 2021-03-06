var assert = require('assert'),
  bigml = require('../index');

describe('Manage association objects', function () {
  var sourceId, source = new bigml.Source(), path = './data/iris.csv',
    datasetId, dataset = new bigml.Dataset(), datasetId2,
    dataset2 = new bigml.Dataset(),
    associationId, association = new bigml.Association(), associationId2,
    association2 = new bigml.Association(),
    seed = "BigML tests",
    associationArgs = {};

  before(function (done) {
    source.create(path, undefined, function (error, data) {
      assert.equal(data.code, bigml.constants.HTTP_CREATED);
      sourceId = data.resource;
      dataset.create(sourceId, undefined, function (error, data) {
        assert.equal(data.code, bigml.constants.HTTP_CREATED);
        datasetId = data.resource;
        dataset2.create(sourceId, undefined, function (error, data) {
          assert.equal(data.code, bigml.constants.HTTP_CREATED);
          datasetId2 = data.resource;
          done();
        });
      });
    });
  });

  describe('#create(dataset, args, callback)', function () {
    it('should create an association from a dataset', function (done) {
      association.create(datasetId, associationArgs, function (error, data) {
        assert.equal(data.code, bigml.constants.HTTP_CREATED);
        associationId = data.resource;
        done();
      });
    });
  });
  describe('#get(association, finished, query, callback)', function () {
    it('should retrieve a finished association', function (done) {
      association.get(associationId, true, function (error, data) {
        if (data.object.status.code === bigml.constants.FINISHED) {
          assert.ok(true);
          done();
        }
      });
    });
  });
  describe('#update(association, args, callback)', function () {
    it('should update properties in the association', function (done) {
      var newName = 'my new name';
      association.update(associationId, {name: newName},
        function (error, data) {
        assert.equal(data.code, bigml.constants.HTTP_ACCEPTED);
        association.get(associationId, true, function (errorcb, datacb) {
          if (datacb.object.status.code === bigml.constants.FINISHED &&
              datacb.object.name === newName) {
            assert.ok(true);
            done();
          }
        });
      });
    });
  });
  describe('#create([dataset], args, callback)', function () {
    it('should create an association from a list of datasets ', function (done) {
      association2.create([datasetId, datasetId2], associationArgs,
                    function (error, data) {
        assert.equal(data.code, bigml.constants.HTTP_CREATED);
        associationId2 = data.resource;
        done();
      });
    });
  });
  describe('#delete(association, callback)', function () {
    it('should delete the remote association', function (done) {
      association.delete(associationId, function (error, data) {
        assert.equal(error, null);
        association2.delete(associationId2, function (error, data) {
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
      dataset2.delete(datasetId2, function (error, data) {
        assert.equal(error, null);
        done();
      });
    });
  });
});
