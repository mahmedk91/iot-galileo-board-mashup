var express = require('express');
var app = express();
var rest = require('restler');

app.get('/', function (req, res) {
  var currentdate = new Date();
  var reqSeconds = currentdate.getSeconds();
  var reqMilliSeconds = currentdate.getMilliseconds();
  var data={
    uid: req.query.uid,
    lat: req.query.lat,
    long: req.query.long,
    sensorid: req.query.sensor,
    requestTime: currentdate.getDate()+"/"+(currentdate.getMonth()+1)+"/"+currentdate.getFullYear()+" @ "+currentdate.getHours()+":"+currentdate.getMinutes()+":"+reqSeconds+":"+reqMilliSeconds
  };
  
  rest.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+data.lat+","+data.long+"&key=AIzaSyCAiuF4LPhSwYLdeUfJ_y5t57IaNueADW4").on('complete', function(geocode) {
    if(geocode.status=="OK"){
      
      data.address=geocode.results[0].formatted_address;
    } else {
      data.address=geocode;
    }
    rest.get("http://www.distance24.org/route.json?stops="+data.address).on('complete', function(dist24) {
      
      data.timeZoneId=dist24.stops[0].timeZone.id;
      data.timeZoneName=dist24.stops[0].timeZone.name;
      data.timeZoneAbbr=dist24.stops[0].timeZone.abbr;
      data.state=dist24.stops[0].region;
      data.countryCode=dist24.stops[0].countryCode;
      data.city=dist24.stops[0].city;
      data.postalCode=dist24.stops[0].postalCode;
      currentdate = new Date();
      var responseSec = currentdate.getSeconds();
      var responseMillisec = currentdate.getMilliseconds();
      data.delay = ((1000 * parseInt(responseSec) + parseInt(responseMillisec)) - (1000 * parseInt(reqSeconds) + parseInt(reqMilliSeconds))) / 1000 + " seconds";
      data.responseTime = currentdate.getDate()+"/"+(currentdate.getMonth()+1)+"/"+currentdate.getFullYear()+" @ "+currentdate.getHours()+":"+currentdate.getMinutes()+":"+responseSec+":"+responseMillisec;
      res.set('Connection', 'keep-alive');
      rest.post('https://ancient-fjord-57969.herokuapp.com/', {
        data: data,
      }).on('complete', function(data2, response) {
          if(data2.status==1){
            var status = {status:1};
            res.json(status);
          } else {
            var status = {status:0};
            res.json(status);
          }
      });
    });
  });
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});
