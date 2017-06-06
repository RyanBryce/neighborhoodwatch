angular.module('nWatch').controller('editEventCtrl', function($scope, eventSrvc, $log, sessionSrv, $stateParams, myEvent) {
  const eventId = $stateParams.eventId
  var session = () => {
    sessionSrv.session().then((res) => {

      if (res.isLoggedIn) {
        $scope.userId = res.user[0].user_id
      }
      $scope.attending = res.followedEvents;
      if (res.isLoggedIn) {
        $scope.hood = res.neighborhood[0].neighborhood_id;
      }
    })
  }
  $scope.lists = [
    {
      name: 'Lost Pet',
      type_id: 1
    },
    {
      name: 'Damage',
      type_id: 2
    },
    {
      name: 'Neighborhood Watch',
      type_id: 4
    },
    {
      name: 'Clean-up',
      type_id: 5
    },
    {
      name: 'Missing Person',
      type_id: 6
    },
    {
      name: 'Meet Up',
      type_id: 7
    },
    {
      name: 'Entertainment',
      type_id: 8
    },
    {
      name: 'Other',
      type_id: 3
    }
  ]
  $scope.category = $scope.lists[0]

  $scope.event = {};

  eventSrvc.getEvent(eventId).then(function(res){
    console.log("this is the event", res)
    if (res) {
      $scope.event.photo = res[0].photo;
      $scope.event.title = res[0].title;
      $scope.dt = res[0].date;
      $scope.mytime = res[0].event_time;
      $scope.event.event_place = res[0].event_place;
      $scope.event.details = res[0].details;
      $scope.event.photo = res[0].photo;
      $scope.lat = res[0].event_location_lat;
      $scope.long = res[0].event_location_lon;
    }
  });
  $scope.eventCreate = (event) => {
    event.event_place = $scope.event.event_place
    event.type_id = $scope.category.type_id;
    event.event_location_lat = $scope.lat;
    event.event_location_lon = $scope.long;
    event.event_time = $scope.mytime;
    event.date = $scope.dt;
    event.photo = '';
    event.created_by = $scope.userId;
    if ($scope.userId) {
      event.neighborhood_id = $scope.hood;
    };
    event.event_id = $stateParams.eventId;
    console.log("hmm", event);
    eventSrvc.save(event)
  }


  //edit map section, just working on getting it working
  // will make it a directive soon
  var lat = Number(myEvent[0].event_location_lat)
  console.log(lat);
  var long = Number(myEvent[0].event_location_lon)
  // console.log(lat, long);
  var latilongi = `${lat},${long}`
    $scope.map = {}

  var myLatLng = {lat: lat, lng: long};
  eventSrvc.getAdd(latilongi).then((res) => {
    console.log("this is shte add func", res.data);
    var corAdd = res.data.results[0].formatted_address;
    var addressArr = corAdd.split(',');
    console.log(addressArr);
    $scope.map.address = addressArr[0];
    $scope.map.city = addressArr[1];
    var zipSt = addressArr[2].split(' ');
    console.log("zipSt", zipSt);
    $scope.map.state = zipSt[1];
    $scope.map.zip = zipSt[2];
  })

  //edit map section, just working on getting it working
  // will make it a directive soon
  var lat = Number(myEvent[0].event_location_lat)
  var long = Number(myEvent[0].event_location_lon)
  // console.log(lat, long);
  var myLatLng = {lat: lat, lng: long};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 17,
    center: myLatLng
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hello World!'
  });

  $scope.changeMap = (map) => {
    if (map.address && map.city && map.state && map.zip) {
    var mapA = map.address;
    var mapC = map.city;
    var mapS = map.state;
    var mapZ = map.zip
    var address = `${mapA} ${mapC}, ${mapS} ${mapZ}`
    console.log(address);
      eventSrvc.getMaps(address)
      .then((res) => {
        var cordinates = res.data.results[0].geometry.location;
        var lati = cordinates.lat;
        var long = cordinates.lng
        $scope.lat = cordinates.lat
        console.log(lati, long);
        $scope.long = cordinates.lng

        var myLatLng = {lat: lati, lng: long};

        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: myLatLng
        });

        var marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: 'Hello World!'
        });
      })
    }else {
      alert('please fill out all boxes on from to generate a event map')
    }
  }
  // ui--bootstrap date js
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();
  $scope.options = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };
  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }
  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date(tomorrow);
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];
  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }
    return '';
  }
  // time picker
  $scope.mytime = new Date();
  $scope.hstep = 1;
  $scope.mstep = 15;
  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };
  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
  };
  $scope.changed = function () {
    $log.log('Time changed to: ' + $scope.mytime);
  };
  $scope.deleteEvent = () => {
    eventSrvc.delete(eventId)
  }
  session();
})
