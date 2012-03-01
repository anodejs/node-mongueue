var Mongueue = require('mongueue'),
    testCase = require('nodeunit').testCase;

exports.MongueueRescheduleTests = testCase({
    ScheduleNull: testReschedule({reoccurrence: null, now: new Date(), expected: 0}),
    ScheduleNoDaily: testReschedule({reoccurrence: [], now: new Date(), expected: 0}),
    NoSchedule: testReschedule({reoccurrence: {daily: [[], [], [], [], [], [], []]}, now: new Date(), expected: 0}),
    TodayLaterNotSorted: testReschedule({reoccurrence: {daily: [[46805, 46800 /*13:00 sunday*/], [], [], [], [], [], []]}, now: new Date(1322389773823), expected: 1827}),
    TodayLaterSorted: testReschedule({reoccurrence: {daily: [[46800, 46805 /*13:00 sunday*/], [], [], [], [], [], []]}, now: new Date(1322389773823), expected: 1827}),
    NextWeekSameDaySorted: testReschedule({reoccurrence: {daily: [[0, 10 /*00:00 sunday*/], [], [], [], [], [], []]}, now: new Date(1322389773823), expected: 559827}),
    NextWeekSameDayNotSorted: testReschedule({reoccurrence: {daily: [[10, 0 /*00:00 sunday*/], [], [], [], [], [], []]}, now: new Date(1322389773823), expected: 559827}),
    TomorrowSorted:  testReschedule({reoccurrence: {daily: [[], [44973, 50000], [], [], [], [], []]}, now: new Date(1322389773823), expected: 86400}),
    TomorrowNotSorted:  testReschedule({reoccurrence: {daily: [[], [50000, 44973], [], [], [], [], []]}, now: new Date(1322389773823), expected: 86400}),
    NextWeekSundayNotSorted:  testReschedule({reoccurrence: {daily: [[50000, 44973], [], [], [], [], [], []]}, now: new Date(1322476173823), expected: 518400}),
    NextWeekSundaySorted:  testReschedule({reoccurrence: {daily: [[50000, 44973], [], [], [], [], [], []]}, now: new Date(1322476173823), expected: 518400}),
    TwiceOnTheSameTime: testReschedule({reoccurrence: {daily: [[44973, 44973, 45000], [], [], [], [], [], []]}, now: new Date(1322389773823), expected: 27}),
    TwiceOnTheSameTimeNextWeek: testReschedule({reoccurrence: {daily: [[44973, 44973], [], [], [], [], [], []]}, now: new Date(1322389773823), expected: 604800}),
    RemoveEmptyDaily: testDailyClean({schedule: {daily: [[],[],[],[],[],[],[]]}, expected: false}),
    RemoveDailySixEmpty: testDailyClean({schedule: {daily: [[],[],[],[],[],[]]}, expected: false}),
    RemoveDailySixNotEmpty: testDailyClean({schedule: {daily: [[1],[2],[3],[4],[5],[6]]}, expected: false}),
    RemoveEmptyArrayDaily: testDailyClean({schedule: {daily: []}, expected: false}),
    RemoveEmptyStringDaily: testDailyClean({schedule: {daily: 'sdfn'}, expected: false}),
    RemoveEmptyUndefinedDaily: testDailyClean({schedule: {daily: null}, expected: false}),
    RemoveDailyItemString: testDailyClean({schedule: {daily: [[1],[2],[3],'4',[5],[6],[7]]}, expected: false}),
    RemoveDailyNoSchedule: testDailyClean({schedule: null, expected: false}),
    RemoveDailyNoDaily: testDailyClean({schedule: {}, expected: false}),
    DontRemoveDaily: testDailyClean({schedule: {daily: [[],[],[3],[],[],[],[]]}, expected: true})
});

function testReschedule(scenario) {
    return function (test) {
        var q = new Mongueue({}),
            nextInSec = q.next(scenario.reoccurrence, scenario.now);
        test.ok(scenario.expected == nextInSec, "Expected next time " + nextInSec + '==' + scenario.expected);
        test.done();
    }
}

function testDailyClean(scenario) {
    return function (test) {
        var q = new Mongueue({}),
            hasSchedule = scenario.schedule != undefined;
        q.clearDailyIfEmpty(scenario.schedule);
        if (!scenario.schedule) {
            test.equals(scenario.schedule != undefined, scenario.expected);
        } else {
            test.equals(scenario.schedule.daily != undefined, scenario.expected);
        }
        test.done();
    };
}