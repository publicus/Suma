'use strict';

describe('Controller: ReportCtrl', function () {

  // load the controller's module
  beforeEach(module('sumaAnalysis'));

  var ReportCtrl,
    Controller,
    Timeout,
    scope,
    Initiatives,
    Data,
    ActsLocs,
    ErrorDispatcher,
    UIStates,
    statesStub,
    initiativesStub,
    dataStub,
    errorDispatcherStub,
    actsLocsStub,
    okResponse,
    errorResponse,
    dataResponse,
    location,
    sumaConfig,
    sumaConfig2;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, initiatives, errorDispatcher, uiStates, data, $q, $location, actsLocs, $timeout) {
    scope = $rootScope.$new();
    Controller = $controller;
    Timeout = $timeout;
    Initiatives = initiatives;
    Data = data;
    ErrorDispatcher = errorDispatcher;
    UIStates = uiStates;
    location = $location;
    ActsLocs = actsLocs;

    sumaConfig = {
      formData: {
        countOptions: [{id: 'count', title: 'Count Date'}, {id: 'start', title: 'Session Start'}, {id: 'end', title: 'Session End'}],
        dayOptions: [{id: 'all', title: 'All'}, {id: 'weekdays', title: 'Weekdays Only'}, {id: 'weekends', title: 'Weekends Only'}],
        sessionOptions: [{id: 'false', title: 'No'}, {id: 'true', title: 'Yes'}]
      },
      formDefaults: {
        count: 'countOptions',
        daygroup: 'dayOptions',
        session_filter: 'sessionOptions'
      },
      dataSource: 'getData',
      dataProcessor: 'processTimeSeriesData',
      suppWatch: true
    };

    sumaConfig2 = {
      formData: {
        countOptions: [{id: 'count', title: 'Count Date'}, {id: 'start', title: 'Session Start'}, {id: 'end', title: 'Session End'}],
        dayOptions: [{id: 'all', title: 'All'}, {id: 'weekdays', title: 'Weekdays Only'}, {id: 'weekends', title: 'Weekends Only'}],
        sessionOptions: [{id: 'false', title: 'No'}, {id: 'true', title: 'Yes'}]
      },
      formDefaults: {
        count: 'countOptions',
        daygroup: 'dayOptions',
        session_filter: 'sessionOptions'
      },
      dataSource: 'getData',
      dataProcessor: 'processTimeSeriesData',
      suppWatch: false
    };

    okResponse = function () {
      var dfd = $q.defer();
      dfd.resolve({success: true});
      return dfd.promise;
    };

    errorResponse = function () {
      var dfd = $q.defer();
      dfd.reject({error: true});
      return dfd.promise;
    };

    dataResponse = function () {
      var dfd = $q.defer();
      dfd.resolve({success: true, barChartData: {title:'title'}, actsLocsData: {items:[{title: 'title'}, {title: 'title'}, {title: 'title'}]}});
      return dfd.promise;
    };

    initiativesStub = sinon.stub(Initiatives, 'get');
    dataStub = sinon.stub(Data, 'getData');

    statesStub = sinon.stub(UIStates, 'setUIState');
    statesStub.returns(true);

    errorDispatcherStub = sinon.stub(ErrorDispatcher, 'dispatch');
    errorDispatcherStub.returns(true);
  }));

  afterEach(function () {
    initiativesStub.restore();
    dataStub.restore();
    statesStub.restore();
    errorDispatcherStub.restore();
  });

  it(':initialize should set UI state to initial', function () {
    initiativesStub.returns(okResponse());

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig
    });

    expect(UIStates.setUIState).to.be.calledWithExactly('initial', scope);
  });

  it(':initialize should set default values', function () {
    initiativesStub.returns(okResponse());

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig
    });

    expect(scope.params).to.be.an('object');
    expect(scope.countOptions).to.deep.equal([{id: 'count', title: 'Count Date'}, {id: 'start', title: 'Session Start'}, {id: 'end', title: 'Session End'}]);
    expect(scope.dayOptions).to.deep.equal([{id: 'all', title: 'All'}, {id: 'weekdays', title: 'Weekdays Only'}, {id: 'weekends', title: 'Weekends Only'}]);
    expect(scope.sessionOptions).to.deep.equal([{id: 'false', title: 'No'}, {id: 'true', title: 'Yes'}]);
    expect(scope.params.count).to.deep.equal({id: 'count', title: 'Count Date'});
    expect(scope.params.daygroup).to.deep.equal({id: 'all', title: 'All'});
    expect(scope.params.session_filter).to.deep.equal({id: 'false', title: 'No'});
    expect(scope.params.sdate).to.equal(moment().subtract('months', 6).add('days', 1).format('YYYY-MM-DD'));
    expect(scope.params.edate).to.equal(moment().add('days', 1).format('YYYY-MM-DD'));
  });

  it(':initialize should assign initiaives to scope', function () {
    initiativesStub.returns(okResponse());

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig
    });

    scope.$digest();
    expect(scope.inits).to.deep.equal({success: true});
  });

  it(':initialize should dispatch an error if Initiatives.get fails', function () {
    initiativesStub.returns(errorResponse());

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig
    });

    scope.$digest();
    expect(scope.inits).to.equal(undefined);
    expect(errorDispatcherStub).to.have.been.calledOnce;
    expect(errorDispatcherStub).to.have.been.calledWith({error:true});
  });

  it(':submit should assign data to scope and set state to success', function() {
    initiativesStub.returns(okResponse());
    dataStub.returns(dataResponse());

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig
    });

    scope.submit();
    scope.$digest();

    expect(UIStates.setUIState).to.be.calledWith('success');
    expect(scope.data.success).to.equal(true);
  });

  it(':submit should assign data to scope, set state to success, and assign watch', function() {
    var watchStub = sinon.stub(scope, '$watch');

    watchStub.returns(true)
    initiativesStub.returns(okResponse());
    dataStub.returns(dataResponse());

    scope.data = {};
    scope.data.actsLocsData = {hello: 'hi'};

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig2
    });

    scope.submit();
    scope.$digest()

    expect(scope.$watch).to.not.be.called();
    watchStub.restore();
  });

  it(':submit should dispatch an error if Data.get fails', function() {
    initiativesStub.returns(okResponse());
    dataStub.returns(errorResponse());

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig
    });

    scope.submit();
    scope.$digest();

    expect(scope.data).to.equal(undefined);
    expect(errorDispatcherStub).to.have.been.calledOnce;
    expect(errorDispatcherStub).to.have.been.calledWith({error:true});
  });

  it(':scrollTo should set locationHash', function () {
    initiativesStub.returns(okResponse());

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig
    });

    scope.scrollTo(12345);
    scope.$digest();

    expect(location.hash(12345).$$hash).to.deep.equal(12345);
  });

  it(':updateMetadata should respond to init changes', function () {
    var actsLocsStub = sinon.stub(ActsLocs, 'get'),
        response = {activities: ['first', 'second'], locations: ['third', 'fourth']};

    actsLocsStub.returns(response);
    initiativesStub.returns(okResponse());

    ReportCtrl = Controller('ReportCtrl', {
      $scope: scope,
      sumaConfig: sumaConfig
    });

    // Check branch if params.init is undefined
    scope.updateMetadata();
    scope.$digest();
    expect(scope.processMetadata).to.equal(undefined);

    // Check branch if params.init is defined
    scope.params = {};
    scope.params.init = {};
    scope.updateMetadata();
    scope.$digest();
    expect(scope.processMetadata).to.equal(true);
    expect(scope.activities).to.equal(response.activities);
    expect(scope.locations).to.equal(response.locations);
    expect(scope.params.activity).to.equal(response.activities[0]);
    expect(scope.params.location).to.equal(response.locations[0]);

    Timeout.flush();
    expect(scope.processMetadata).to.equal(false);

    actsLocsStub.restore();
  });
});
