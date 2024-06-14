import { secondsToHHMMSS } from "$lib/datetime";

let snakeToCamelCache: { [snake: string]: string } = {};
function snakeToCamel(snake: string): string {
    if (snakeToCamelCache[snake]) {
        return snakeToCamelCache[snake];
    }
    const camel = snake.replace(/([-_][a-z])/g, (group) => group.toUpperCase()
        .replace('-', '')
        .replace('_', ''));
    snakeToCamelCache[snake] = camel;
    return camel;
}

function csvToJson(csvString, numberFields: string[]) {
    // Split the CSV string into rows
    const rows = csvString.split('\n').filter(row => row.trim() !== '');
    
    // Extract headers from the first row
    let headers = parseRow(rows[0]);
    headers = headers.map((header) => snakeToCamel(header));
    
    // Initialize the result array
    const jsonArray = [];
    
    // Process each row according to the headers
    for (let i = 1; i < rows.length; i++) {
        const values = parseRow(rows[i]);
        
        // Initialize an object for current row
        const jsonObj = {};
        
        for (let j = 0; j < headers.length; j++) {
            let value: string | number | undefined = values[j];
            if (value === undefined) {
                value = '';
            }
            if (numberFields.includes(headers[j])) {
                value = Number(value);
            }
            jsonObj[headers[j]] = value
        }
        
        jsonArray.push(jsonObj);
    }
    
    return jsonArray;
}

// Function to parse a single CSV row
function parseRow(row) {
    const result = [];
    let inQuotes = false;
    let value = '';
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes; // Toggle inQuotes flag
        } else if (char === ',' && !inQuotes) {
            result.push(value.trim()); // Push the current value to result
            value = ''; // Reset value for next field
        } else {
            value += char; // Add char to value
        }
    }
    
    // Push the last value
    result.push(value.trim());
    
    return result;
}


function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}


// stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,zone_id,location_type,parent_station,stop_timezone,wheelchair_boarding,level_id,platform_code
// 000000009300001,93,Hlavná stanica,,48.157543182373,17.1067714691162,100,0,,,,,A
// 000000009300021,93,Hlavná stanica,,48.1581077575684,17.1071739196777,100,0,,,,,U
// 000000030600001,306,Pod stanicou,,48.1557006835938,17.1075477600098,100,0,,,,,A
export interface GtfsStop {
    stopId: string;
    stopCode: string;
    stopName: string;
    stopDesc: string;
    stopLat: number;
    stopLon: number;
    zoneId: number;
    locationType: number;
    parentStation: string;
    stopTimezone: string;
    wheelchairBoarding: number;
    levelId: string;
    platformCode: string;
}

// route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_url,route_color,route_text_color,route_sort_order
// 1989,01,1,,,0,,F56200,FFFFFF,
// 3988,01,3,,,0,,E31E24,FFFFFF,
// 4982,01,4,,,0,,5071B9,FFFFFF,
export interface GtfsRoute {
    routeId: string;
    agencyId: string;
    routeShortName: string;
    routeLongName: string;
    routeDesc: string;
    routeType: number;
    routeUrl: string;
    routeColor: string;
    routeTextColor: string;
    routeSortOrder: number;
}


// route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id,wheelchair_accessible,bikes_allowed
// 1989,Prac.dny_0,1989_04_5_1,Úrad vlády SR,,0,,TRA_00000,1,
// 1989,Prac.dny_0,1989_01_9_2,Nám. Ľ. Štúra,,0,,TRA_00001,1,
// 1989,Prac.dny_0,1989_02_11_3,Nám. Ľ. Štúra,,0,,TRA_00001,1,
export interface GtfsTrip {
    routeId: string;
    serviceId: string;
    tripId: string;
    tripHeadsign: string;
    tripShortName: string;
    directionId: number;
    blockId: string;
    shapeId: string;
    wheelchairAccessible: number;
    bikesAllowed: number;
}

// trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type,shape_dist_traveled,timepoint
// 1989_04_5_1,24:00:00,24:00:00,000000009300001,576,,0,0,,
// 1989_04_5_1,24:01:00,24:01:00,000000030600001,577,,0,0,,
// 1989_04_5_1,24:02:00,24:02:00,000000071400001,578,,0,0,,
export interface GtfsStopTime {
    tripId: string;
    arrivalTime: string;
    departureTime: string;
    stopId: string;
    stopSequence: number;
    stopHeadsign: string;
    pickupType: number;
    dropOffType: number;
    shapeDistTraveled: number;
    timepoint: string;
}

// service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date
// Prac.dny_0,1,1,1,1,1,0,0,20240602,20241231
// Leto_1,1,1,1,1,1,0,0,20240602,20241231
// Soboty_2,0,0,0,0,0,1,0,20240602,20241231
export interface GtfsCalendar {
    serviceId: string;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
    startDate: string;
    endDate: string;
}


// service_id,date,exception_type
// Prac.dny_0,20240701,2
// Prac.dny_0,20240702,2
// Prac.dny_0,20240703,2
export interface GtfsCalendarDate {
    serviceId: string;
    date: string;
    exceptionType: number;
}


// shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled
// TRA_00000,48.157543182373,17.1067714691162,1,
// TRA_00000,48.1557006835938,17.1075477600098,2,
// TRA_00000,48.1542472839355,17.1109199523926,3,
export interface GtfsShape {
    shapeId: string;
    shapePtLat: number;
    shapePtLon: number;
    shapePtSequence: number;
    shapeDistTraveled: number;
}


type DayName = "monday" | "tuesday"| "wednesday"| "thursday"| "friday"| "saturday"| "sunday";


class Gtfs {
    debug: boolean;

    timeOffset: number;

    stops: GtfsStop[];
    routes: GtfsRoute[];
    trips: GtfsTrip[];
    stopTimes: GtfsStopTime[];
    calendar: GtfsCalendar[];
    calendarDates: GtfsCalendarDate[];
    shapes: GtfsShape[];

    stopsLookup: { [stop_id: string]: GtfsStop };
    routeLookup: { [route_id: string]: GtfsRoute };
    tripLookup: { [trip_id: string]: GtfsTrip };
    stopTimeLookup: { [stop_id: string]: GtfsStopTime[] };
    calendarLookup: { [service_id: string]: GtfsCalendar };
    calendarDateLookup: { [service_id: string]: GtfsCalendarDate };
    shapeLookup: { [shape_id: string]: GtfsShape[] };

    tripIdFromTo: { [tripId: string]: string[] } = {};
    routeIdsByStopCode: { [stopCode: string]: string[] } = {};

    
    constructor(DEBUG: boolean = false) {
        this.debug = DEBUG;

        this.timeOffset = 0;         // move time by this amount of seconds (for testing purposes)

        this.stops = [];
        this.routes = [];
        this.trips = [];
        this.stopTimes = [];
        this.calendar = [];
        this.calendarDates = [];
        this.shapes = [];

        this.stopsLookup = {};
        this.routeLookup = {};
        this.tripLookup = {};
        this.stopTimeLookup = {};
        this.calendarLookup = {};
        this.calendarDateLookup = {};
        this.shapeLookup = {};

        this.tripIdFromTo = {};        // tripId -> [from, to]
        this.routeIdsByStopCode = {};  // stopId -> [routeId]
    }

    async init() {
        const responseStopsPromise = fetch('/gtfs/stops.txt');
        const responseRoutesPromise = fetch('/gtfs/routes.txt');
        const responseTripsPromise = fetch('/gtfs/trips.txt');
        const responseStopTimesPromise = fetch('/gtfs/stop_times.txt');
        const responseCalendarPromise = fetch('/gtfs/calendar.txt');
        const responseCalendarDatesPromise = fetch('/gtfs/calendar_dates.txt');
        const responseShapesPromise = fetch('/gtfs/shapes.txt');

        const [responseStops, responseRoutes, responseTrips, responseStopTimes, responseCalendar, responseCalendarDates, responseShapes] = await Promise.all([
            responseStopsPromise,
            responseRoutesPromise,
            responseTripsPromise,
            responseStopTimesPromise,
            responseCalendarPromise,
            responseCalendarDatesPromise,
            responseShapesPromise
        ]);

        this.stops = csvToJson(await responseStops.text(), ["stopLat", "stopLon", "zoneId", "locationType", "wheelchairBoarding"]);
        this.routes = csvToJson(await responseRoutes.text(), ["routeType", "routeSortOrder"]);
        this.trips = csvToJson(await responseTrips.text(), ["directionId", "wheelchairAccessible", "bikesAllowed"]);
        this.stopTimes = csvToJson(await responseStopTimes.text(), ["stopSequence", "pickupType", "dropOffType", "shapeDistTraveled"]);
        this.calendar = csvToJson(await responseCalendar.text(), ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
        this.calendarDates = csvToJson(await responseCalendarDates.text(), ["exceptionType"]);
        this.shapes = csvToJson(await responseShapes.text(), ["shapePtLat", "shapePtLon", "shapePtSequence", "shapeDistTraveled"]);

        // create lookups
        for (const stop of this.stops) {
            this.stopsLookup[stop.stopId] = stop;
        }
        for (const route of this.routes) {
            this.routeLookup[route.routeId] = route;
        }
        for (const trip of this.trips) {
            this.tripLookup[trip.tripId] = trip;
        }
        for (const stopTime of this.stopTimes) {
            if (!this.stopTimeLookup[stopTime.tripId]) {
                this.stopTimeLookup[stopTime.tripId] = [];
            }
            if (!this.stopTimeLookup[stopTime.tripId].find((st) => st.stopId === stopTime.stopId)) {
                this.stopTimeLookup[stopTime.tripId].push(stopTime);
            }
        }
        for (const calendar of this.calendar) {
            this.calendarLookup[calendar.serviceId] = calendar;
        }
        for (const calendarDate of this.calendarDates) {
            this.calendarDateLookup[calendarDate.serviceId] = calendarDate;
        }
        for (const shape of this.shapes) {
            if (!this.shapeLookup[shape.shapeId]) {
                this.shapeLookup[shape.shapeId] = [];
            }
            this.shapeLookup[shape.shapeId].push(shape);
        }


        // lookup tripId times (from to)
        for (const stopTime of this.stopTimes) {
            const tripId = stopTime.tripId;
            if (!this.tripIdFromTo[tripId]) {
                this.tripIdFromTo[tripId] = [stopTime.arrivalTime, stopTime.departureTime];
            }
            if (stopTime.arrivalTime < this.tripIdFromTo[tripId][0]) {
                this.tripIdFromTo[tripId][0] = stopTime.arrivalTime;
            }
            if (stopTime.departureTime > this.tripIdFromTo[tripId][1]) {
                this.tripIdFromTo[tripId][1] = stopTime.departureTime;
            }
        }

        //         this.routeIdsByStopId = {};  // stopId -> [routeId]

        for (const stopTime of this.stopTimes) {
            const stop = this.stopsLookup[stopTime.stopId];
            if (!stop) {
                continue;
            }
            const route = this.routeLookup[this.tripLookup[stopTime.tripId].routeId];
            if (!route) {
                continue;
            }
            if (!this.routeIdsByStopCode[stop.stopCode]) {
                this.routeIdsByStopCode[stop.stopCode] = [];
            }
            if (!this.routeIdsByStopCode[stop.stopCode].includes(route.routeId)) {
                this.routeIdsByStopCode[stop.stopCode].push(route.routeId);
            }
        }

        if (this.debug) {
            console.log("gtfs stops", this.stops);
            console.log("gtfs routes", this.routes);
            console.log("gtfs trips", this.trips);
            console.log("gtfs stopTimes", this.stopTimes);
            console.log("gtfs calendar", this.calendar);
            console.log("gtfs calendarDates", this.calendarDates);
            console.log("gtfs shapes", this.shapes);
    
            console.log("gtfs stopsLookup", this.stopsLookup);
            console.log("gtfs routeLookup", this.routeLookup);
            console.log("gtfs tripLookup", this.tripLookup);
            console.log("gtfs stopTimeLookup", this.stopTimeLookup);
            console.log("gtfs calendarLookup", this.calendarLookup);
            console.log("gtfs calendarDateLookup", this.calendarDateLookup);
            console.log("gtfs shapeLookup", this.shapeLookup);

            console.log("gtfs tripIdFromTo", this.tripIdFromTo);
            console.log("gtfs routesByStopId", this.routeIdsByStopCode);
        }
    }

    getTodaysServiceIds(): string[] {
        const today = this.now()
        const day = today.getDay();
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        
        const dayName: DayName = days[day] as DayName;
        const date = today.toISOString().slice(0, 10).replace(/-/g, "");
        console.log("dayName", dayName, date);

        const serviceIds = [];
        for (const calendar of this.calendar) {
            if (calendar[dayName] === 1 && calendar.startDate <= date && calendar.endDate >= date) {
                serviceIds.push(calendar.serviceId);
            }
        }

        return serviceIds;
    }

    /**
        Finds trip by that id (for example 1989_02_11_3)
    */
    enrichTripId(tripId: string) {
        const trip = deepCopy(this.tripLookup[tripId]);
        if (!trip) {
            return;
        }

        const route = deepCopy(this.routeLookup[trip.routeId]);
        const shape = deepCopy(this.shapeLookup[trip.shapeId]);
        const stopTimes = deepCopy(this.stopTimeLookup[trip.tripId]);

        const res: any = trip
        trip.route = route;
        trip.shape = shape;
        stopTimes.sort((a: any, b: any) => a.arrivalTime ? a.arrivalTime > b.arrivalTime ? 1 : -1 : 1);
        trip.stopTimes = stopTimes
        
        for (const stopTime of stopTimes) {
            stopTime.stop = this.stopsLookup[stopTime.stopId];
            stopTime.stop.routeIds = this.routeIdsByStopCode[stopTime.stop.stopCode];
        }

        return res;
    }


    /**
     * set the current time in this function
     */
    now() {
        const now = new Date()
        now.setSeconds(now.getSeconds() + this.timeOffset);
        // now.setHours(now.getHours() + 3);  // allows us to offset the time while developing at the night :D :D
        return now;
    }

    moveTime(offsetSeconds: number) {
        this.timeOffset += offsetSeconds;
    }


    /**
     * use tripIdFromTo lookup to get trips that are happening now (between from and to)
     * time format 04:40:00
     * @returns 
     */
    getTripsNow(): GtfsTrip[] {
        const serviceTripsToday = this.getTodaysServiceIds();
        let tripsNow: GtfsTrip[] = [];
        const now = this.now();
        const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const nowStr = secondsToHHMMSS(nowSeconds)

        for (const tripId in this.tripIdFromTo) {
            const [from, to] = this.tripIdFromTo[tripId];
            if (from <= nowStr && nowStr <= to) {
                const trip = this.tripLookup[tripId];
                if (!serviceTripsToday.includes(trip.serviceId)) {
                    continue;
                }
                tripsNow.push(trip);
            }
        }

        // sort by time it takes to get to the last stop
        tripsNow.sort((a, b) => {
            const aStopTimes = this.stopTimeLookup[a.tripId];
            const bStopTimes = this.stopTimeLookup[b.tripId];
            const aLastStopTime = aStopTimes[aStopTimes.length - 1];
            const bLastStopTime = bStopTimes[bStopTimes.length - 1];
            return aLastStopTime.departureTime > bLastStopTime.departureTime ? 1 : -1;
        });

        return tripsNow;
    }
}


const gtfs = new Gtfs(false);
await gtfs.init();
export default gtfs;