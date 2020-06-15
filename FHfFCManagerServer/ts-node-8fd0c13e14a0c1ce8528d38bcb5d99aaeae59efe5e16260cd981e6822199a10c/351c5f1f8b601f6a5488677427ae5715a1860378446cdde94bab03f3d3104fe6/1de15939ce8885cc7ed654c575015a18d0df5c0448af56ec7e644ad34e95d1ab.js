"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
var mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect('mongodb://127.0.0.1:27017/sodatest', {
    useMongoClient: true
});
var db = mongoose.connection;
var Endpointinthedb_schema = mongoose.Schema({
    addedd: Date,
    endPoint: Object,
    inserted: String,
    total: String
});
;
var EndPointInTheDb = mongoose.model('EndPointInTheDb', Endpointinthedb_schema, 'EndPointInTheDb');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("siamoconnessi ");
});
let app = express();
app.get('/endPoints', (request, response) => {
    EndPointInTheDb.find({}, (err, exit) => {
        console.log("*********************");
        console.log("Errore : " + err);
        console.log(exit); // Space Ghost is a talk show host.
        response.json({
            exit
        });
        console.log("*********************");
    });
});
app.listen(3000);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL21lZGlhL2Nhcm5hdXNlci9Wb2x1bWUvQ05SL0ZIZkZDV2ViU2VydmVyL3NyYy9pbmRleC50cyIsInNvdXJjZXMiOlsiL21lZGlhL2Nhcm5hdXNlci9Wb2x1bWUvQ05SL0ZIZkZDV2ViU2VydmVyL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1DQUFvQztBQUVwQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFbkMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFNUIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRTtJQUNuRCxjQUFjLEVBQUUsSUFBSTtDQUN2QixDQUFDLENBQUM7QUFFSCxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO0FBRTdCLElBQUksc0JBQXNCLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztJQUN6QyxNQUFNLEVBQUUsSUFBSTtJQUNaLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLEtBQUssRUFBRSxNQUFNO0NBQ2hCLENBQUMsQ0FBQztBQU9GLENBQUM7QUFHRixJQUFJLGVBQWUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLHNCQUFzQixFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFFbkcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztBQUVqRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtJQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNsQyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBRXBCLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO0lBRXhDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBVyxFQUFFLElBQXlCLEVBQUUsRUFBRTtRQUdoRSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFDLG1DQUFtQztRQUNyRCxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ1YsSUFBSTtTQUNQLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUV6QyxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDO0FBRUgsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFERFJDT05GSUcgfSBmcm9tICdkbnMnO1xuaW1wb3J0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5cbnZhciBtb25nb29zZSA9IHJlcXVpcmUoJ21vbmdvb3NlJyk7XG5cbm1vbmdvb3NlLnNldCgnZGVidWcnLCB0cnVlKTtcblxubW9uZ29vc2UuY29ubmVjdCgnbW9uZ29kYjovLzEyNy4wLjAuMToyNzAxNy9zb2RhdGVzdCcsIHtcbiAgICB1c2VNb25nb0NsaWVudDogdHJ1ZVxufSk7XG5cbnZhciBkYiA9IG1vbmdvb3NlLmNvbm5lY3Rpb247XG5cbnZhciBFbmRwb2ludGludGhlZGJfc2NoZW1hID0gbW9uZ29vc2UuU2NoZW1hKHtcbiAgICBhZGRlZGQ6IERhdGUsXG4gICAgZW5kUG9pbnQ6IE9iamVjdCxcbiAgICBpbnNlcnRlZDogU3RyaW5nLFxuICAgIHRvdGFsOiBTdHJpbmdcbn0pO1xuXG5pbnRlcmZhY2UgRW5kcG9pbnRpbnRoZWRiSWYge1xuICAgIC8vICBhZGRlZGQ6IERhdGUsXG4gICAgZW5kUG9pbnQ6IE9iamVjdCxcbiAgICBpbnNlcnRlZDogU3RyaW5nLFxuICAgIHRvdGFsOiBTdHJpbmdcbn07XG5cblxudmFyIEVuZFBvaW50SW5UaGVEYiA9IG1vbmdvb3NlLm1vZGVsKCdFbmRQb2ludEluVGhlRGInLCBFbmRwb2ludGludGhlZGJfc2NoZW1hLCAnRW5kUG9pbnRJblRoZURiJyk7XG5cbmRiLm9uKCdlcnJvcicsIGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlLCAnY29ubmVjdGlvbiBlcnJvcjonKSk7XG5cbmRiLm9uY2UoJ29wZW4nLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coXCJzaWFtb2Nvbm5lc3NpIFwiKTtcbn0pO1xuXG5sZXQgYXBwID0gZXhwcmVzcygpO1xuXG5hcHAuZ2V0KCcvZW5kUG9pbnRzJywgKHJlcXVlc3QsIHJlc3BvbnNlKSA9PiB7XG5cbiAgICBFbmRQb2ludEluVGhlRGIuZmluZCh7fSwgKGVycjogU3RyaW5nLCBleGl0OiBFbmRwb2ludGludGhlZGJJZltdKSA9PiB7XG5cblxuICAgICAgICBjb25zb2xlLmxvZyhcIioqKioqKioqKioqKioqKioqKioqKlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcmUgOiBcIiArIGVycilcbiAgICAgICAgY29uc29sZS5sb2coZXhpdCkgLy8gU3BhY2UgR2hvc3QgaXMgYSB0YWxrIHNob3cgaG9zdC5cbiAgICAgICAgcmVzcG9uc2UuanNvbih7XG4gICAgICAgICAgICBleGl0XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhcIioqKioqKioqKioqKioqKioqKioqKlwiKTtcblxuICAgIH0pO1xuXG59KTtcblxuYXBwLmxpc3RlbigzMDAwKTtcbiJdfQ==