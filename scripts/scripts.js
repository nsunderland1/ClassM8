// Checks if user is on mobile device and prompts them to consider using a better suited device
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    alert("This website is not designed for smaller screens due to the nature of the app. Please consider using a desktop computer.");
}

// Initializes the table, and arrays that keep track of courses
$(document).ready(function () {
    initTable();
    searchResult = [];
    classesInSchedule = [];
});

// Initializes the table
function initTable() {
    var scheduleTable = $(".table");
    scheduleTable.append('<tr> <td class = "frTable"> Time </td> <td class = "day"> Monday </td> <td class = "day"> Tuesday </td> <td class = "day"> Wednesday </td> <td class = "day"> Thursday </td> <td class = "day"> Friday </td> <td class = "day"> Saturday </td> <td class = "day"> Sunday </td> </tr>');

    for (i = 8; i < 23; i += 0.5) {
        var row = $('<tr class="noBorder"></tr>');
        for (j = 0; j < 8; j++) {
            if (j == 0) {
                if (i % 1 == 0) {
                    if (i < 12) {
                        row.append('<td rowspan=2>' + (i | 0) + ':00 AM</td>');
                    } else if (i == 12) {
                        row.append('<td rowspan=2>' + (i | 0) + ':00 PM</td>');
                    } else {
                        row.append('<td rowspan=2>' + ((i | 0) - 12) + ':00 PM</td>');
                    }
                } else {
                    continue;
                }
            } else {
                if (i % 1 == 0) {
                    if (i < 10) {
                        row.append('<td class= "' + 0 + i + "00" + "_" + j + '"></td>');
                    } else {
                        row.append('<td class= "' + i + "00" + "_" + j + '"></td>');
                    }
                } else {
                    if (i < 10) {
                        row.append('<td class= "' + 0 + (i | 0) + 30 + "_" + j + " dashedBorder" + '"></td>');
                    } else {
                        row.append('<td class= "' + (i | 0) + 30 + "_" + j + " dashedBorder" + '"></td>');
                    }
                }
            }
        }
        scheduleTable.append(row);
    }

    $(window).on("resize", function() {
        $('.scheduleCourseBox').each(function(i) {
            var timeBounds = $(this).find("div.scheduleCourseBoxTime").text().slice("-").trim();
            var posn = $('.' + $(this).attr("posn"));
            $(this).css("width", findWidth());
            $(this).css("height", findHeight(timeBounds[0], timeBounds[1]));
            $(this).css("top", posn.position().top);
            $(this).css("left", posn.position().left);
        });
    });
}

// Parses through the Quest data pasted in by user and calls addCourseToSchedule() on valid classes
function importSchedule(schedule) {
    $("#scheduleToImport").val('');
    classesInSchedule = [];
    $('.scheduleCourseBox').remove();
    schedule = schedule.toString();
    var scheduleArr = schedule.split("Class Nbr	Section	Component	Days & Times	Room	Instructor	Start/End Date");
    var courseNames = [];
    var firstScheduleArr = scheduleArr[0].split("University of Waterloo")[1].split(" ");
    var firstCourseName = firstScheduleArr[0].replace("\n", "") + firstScheduleArr[1];
    courseNames.push(firstCourseName);
    var numberOfOnlineClasses = 0;
    for (i = 1; i < scheduleArr.length; i++) {
        scheduleArr[i] = scheduleArr[i].trim();
        var scheduleArrExamSplitResult = scheduleArr[i].split("Exam Information");
        if (scheduleArrExamSplitResult[1] == undefined) {
            scheduleArrExamSplitResult = scheduleArr[i].split("Materials");
        }
        var courseSplit = scheduleArrExamSplitResult[1].split("\n")[2].split(" ");
        var courseName = courseSplit[0] + courseSplit[1];
        courseNames.push(courseName);

        if (scheduleArrExamSplitResult.length > 0) {

            var scheduleCourseInfo = scheduleArrExamSplitResult[0].split("\n");
            for (j = 0; j < scheduleCourseInfo.length - 1; j += 7) {
                if ((scheduleCourseInfo[j + 2] == "TST") || (scheduleCourseInfo[j + 2] == " ")) {
                    continue;
                }
                if ((scheduleCourseInfo[j + 3] == " ") || (scheduleCourseInfo[j + 3] == undefined)) {
                    numberOfOnlineClasses += 1;
                    continue;
                }
                var scheduleCourse = {
                    course: courseNames[i - 1],
                    section: scheduleCourseInfo[j + 2] + " " + scheduleCourseInfo[j + 1],
                    day: scheduleCourseInfo[j + 3].split(" ")[0],
                    start_time: convertTo24h(scheduleCourseInfo[j + 3].split(" ")[1]),
                    end_time: convertTo24h(scheduleCourseInfo[j + 3].split(" ")[3]),
                    location: scheduleCourseInfo[j + 4].replace(/  +/g, ' ')
                };
                addCourseToSchedule(scheduleCourse);
            }
        }
    }
    if (numberOfOnlineClasses > 0) {
        swal({
            title: "Online Courses detected!",
            text: "Your schedule has " + (numberOfOnlineClasses / 2) + " online courses. These were not added to your schedule.",
            type: "warning",
            confirmButtonText: "Ok"
        });

    }
}

// Displays the list of classes in the table
function getListOfClasses() {
    $('.listOfClasses').empty()
    if (classesInSchedule == null || classesInSchedule == undefined || classesInSchedule.length == 0) {
        var newEmptyMessage = $('<div></div>');
        newEmptyMessage.append('There are no courses in your schedule!');
        newEmptyMessage.appendTo($('.listOfClasses'));
    } else {
        for (n = 0; n < classesInSchedule.length; n++) {
            var newClassInfo = $('<div class="classInfo"></div>');
            var newCourseName = $('<div class="courseName"></div>');
            var newCourseProf = $('<div class="courseProf"></div>');
            var newCourseLoc = $('<div class="courseLoc"></div>');

            newCourseName.append(classesInSchedule[n].course + " - " + classesInSchedule[n].section);
            newCourseProf.append(classesInSchedule[n].day + " " + classesInSchedule[n].start_time + " - " + classesInSchedule[n].end_time);
            newCourseLoc.append(classesInSchedule[n].location);
            newClassInfo.append(newCourseName, newCourseProf, newCourseLoc);
            newClassInfo.appendTo($('.listOfClasses'));
        }
    }
}

// Converts AM:PM time to 24H time and leaves 24H time as is
function convertTo24h(time) {
    if ((time.indexOf("AM") == -1) && (time.indexOf("PM") == -1)) {
        return time;
    } else {
        if (time.indexOf("AM") > -1) {
            time = time.slice(0, -2);
            var hour = time.split(":")[0];
            if (hour.length == 1) {
                hour = "0" + hour;
            }
            var minute = time.split(":")[1];
            return (hour + ":" + minute);

        } else {
            time = time.slice(0, -2);
            var hour = parseInt(time.split(":")[0]) + 12;
            var minute = time.split(":")[1];
            if (hour == 24) {
                hour = 12;
            }
            return (hour + ":" + minute);

        }

    }
}

function enterSearch() {
    if (event.keyCode == 13) $('#searchbtn').focus();
}

// Sends a GET request to the API and displays the data in divs inside of the courseBoxContainer
function search() {
    var searchval = document.getElementById("searchbox").value.trim();
    var e = document.getElementById("term");
    var term = e.options[e.selectedIndex].value;

    if (searchval.split(" ").length - 1 == 1) {
        var words = searchval.split(" ");
        var first = words[0];
        var second = words[1];
        if ((/^[a-zA-Z]+$/.test(first)) && (/^\d+$/.test(second))) {
            $('#courseBoxContainer').empty();
            $('#courseBoxContainer').append('<div class="spinner"> <div class = "bounce1" > </div> <div class = "bounce2" > </div> <div class = "bounce3" > </div> </div>')
            
            $.ajax({
                url: "https://classm8.herokuapp.com/get_course/" + term + "/" + first + "/" + second,
                cache: false,
                success: function (data) {
                    $('#courseBoxContainer').empty();
                    var data = JSON.parse(data)
                    if (data.data.length == 0) {
                        $('#courseBoxContainer').append("<center>No courses available based on your search criteria.</center>");
                    }

                    for (i = 0; i < data.data.length; i++) {
                        var currData = data.data[i];
                        if (currData.section.split(" ")[0] == "TST") {
                            continue;
                        }
                        var currClasses = currData.classes[0];
                        if (currClasses.date.start_time == null && currClasses.date.end_time == null) {
                            continue;

                        }
                        searchResult[i] = {
                            course: currData.subject + currData.catalog_number,
                            section: currData.section,
                            day: currClasses.date.weekdays,
                            start_time: currClasses.date.start_time,
                            end_time: currClasses.date.end_time,
                            location: currClasses.location.building + " " + currClasses.location.room
                        };

                        var newCourseBox = $('<div class="courseBox" onclick="findInArray(' + i + ')"></div>');
                        var newCID = $('<div class="courseBoxCID"></div');
                        var newENR = $('<div class="courseBoxEnr"></div>');
                        var newProf = $('<div class="courseBoxProf"></div>');
                        var newTime = $('<div class="courseBoxTime"></div>');
                        var newLoc = $('<div class="courseBoxLoc"></div>');
                        newCID.append(currData.subject + currData.catalog_number + " - " + currData.section);
                        newENR.append(currData.enrollment_total + "/" +
                            currData.enrollment_capacity + " Enrolled");
                        newProf.append(currClasses.instructors[0]);
                        newTime.append(currClasses.date.weekdays + " " +
                            currClasses.date.start_time + " - " + currClasses.date.end_time);
                        newLoc.append(currClasses.location.building + " " + currClasses.location.room);

                        newCourseBox.append(newCID, newENR, newProf, newTime, newLoc);

                        if (currData.section.split(" ")[0] == "TUT") {
                            newCourseBox.css("background-color", "#a0eddb");
                        } else if (currData.section.split(" ")[0] == "LAB") {
                            newCourseBox.css("background-color", "#c9a0ed");
                            newCourseBox.css("border-color", "#ad77dd")
                        }

                        newCourseBox.attr('id', currData.class_number);
                        $('#courseBoxContainer').append(newCourseBox);
                    }

                }
            });
        } else {
            swal({
                title: "Incorrect Format Detected",
                text: "Please use the correct format. e.g 'cs 135' or 'rec 100'.",
                type: "error",
                confirmButtonText: "Ok"
            });
        }
    } else {
        swal({
            title: "Incorrect Format Detected",
            text: "'" + searchval + "'" + " not an accepted input. Please make sure your search is a valid course code. e.g 'cs 135' or 'rec 100'.",
            type: "error",
            confirmButtonText: "Ok"
        });
    }
}

// Finds the height of the box to put in schedule based on the length of the course
function findHeight(start, end) {
    var lengthHour = ((end.split(":")[0]) * 60) - ((start.split(":")[0]) * 60);
    var lengthMin = end.split(":")[1] - start.split(":")[1];
    if (lengthMin < 0) {
        lengthMin += 60;
        lengthHour -= 60;
    }
    var length = lengthHour + lengthMin + 10;
    var halfHourHeight = 20;
    length = (length / 30) * halfHourHeight;
    return length;
}

// Finds the width of the box to put in schedule based on the user's browser size.
function findWidth() {
    return ($($("td")[9]).width() + 2);
}

// Looks for the object inside of searchResult[]
function findInArray(objectIndex) {
    CheckIfRemovable(searchResult[objectIndex]);
}

// Checks if a class is removable from the table
function CheckIfRemovable(classToAdd) {
    if ((arguments.callee.caller.name) != "importSchedule") {
        removeSameCourse(classToAdd);
        removeOverlappingCourse(classToAdd);
    }
}

// Removes courses with the same course name and catalog number 
function removeSameCourse(classToRemove) {
    var courseName = classToRemove.course;
    var courseSection = classToRemove.section.split(" ")[0];
    var classesWithSameCourseName = $.grep(classesInSchedule, function (x) {
        return x.course == courseName
    });
    var classesWithSameNameAndSection = $.grep(classesWithSameCourseName, function (y) {
        return y.section.split(" ")[0] == courseSection
    });
    for (i = 0; i < classesWithSameNameAndSection.length; i++) {
        $("." + classesWithSameNameAndSection[i].course + classesWithSameNameAndSection[i].section.split(" ")[0]).remove();
        var indexOfClassWithSameNameAndSection = classesInSchedule.indexOf(classesWithSameNameAndSection[i]);
        classesInSchedule.splice(indexOfClassWithSameNameAndSection, 1);
    }
}

// Removes overlapping courses in the table
function removeOverlappingCourse(classToRemove) {
    var newStartTime = classToRemove.start_time.split(":")[0] + classToRemove.start_time.split(":")[1];
    var newEndTime = classToRemove.end_time.split(":")[0] + classToRemove.end_time.split(":")[1];
    var classesToRemoveFromScheduleArr = [];
    var courseOverlap = false;
    var isConfirmed = false;
    for (n = 0; n < classesInSchedule.length; n++) {
        var oldClass = $("." + classesInSchedule[n].course + classesInSchedule[n].section.split(" ")[0]);
        var oldStartTime = classesInSchedule[n].start_time.split(":")[0] + classesInSchedule[n].start_time.split(":")[1];
        var oldEndTime = classesInSchedule[n].end_time.split(":")[0] + classesInSchedule[n].end_time.split(":")[1];
        var courseToRemoveDays = classToRemove.day.split(/(?=[A-Z])/);
        var courseInScheduleDays = classesInSchedule[n].day.split(/(?=[A-Z])/);
        for (t = 0; t < courseToRemoveDays.length; t++) {
            if (courseInScheduleDays.indexOf(courseToRemoveDays[t]) > -1) {
                if (((newStartTime >= oldStartTime) && (newStartTime <= oldEndTime)) ||
                    ((newEndTime >= oldStartTime) && (newEndTime <= oldEndTime)) ||
                    ((newStartTime >= oldStartTime) && (newEndTime <= oldEndTime)) ||
                    ((newStartTime <= oldStartTime) && (newEndTime >= oldEndTime))) {
                    if (!courseOverlap) {
                        courseOverlap = true;
                        var r = confirm("The course you selected overlaps with another course in your schedule. Do you want to replace it?");
                        if (r == true) {
                            oldClass.remove();
                            if (classesToRemoveFromScheduleArr.indexOf(classesInSchedule[n]) == -1) {
                                classesToRemoveFromScheduleArr.push(classesInSchedule[n])
                            }
                            isConfirmed = true;
                        } else {
                            break;
                        }
                    } else {
                        if (classesToRemoveFromScheduleArr.indexOf(classesInSchedule[n]) == -1) {
                            classesToRemoveFromScheduleArr.push(classesInSchedule[n])
                        }
                        oldClass.remove();
                    }
                }
            }
        }
    }
    for (x = 0; x < classesToRemoveFromScheduleArr.length; x++) {
        var indexOfClassesToRemove = classesInSchedule.indexOf(x);
        classesInSchedule.splice(indexOfClassesToRemove, 1);
    }
    if (isConfirmed) {
        addCourseToSchedule(classToRemove);
    }
    if (!courseOverlap) {
        addCourseToSchedule(classToRemove);
    }
}

// Adds the selected course into the table
function addCourseToSchedule(classToAdd) {
    classesInSchedule.push(classToAdd);
    var days = ["M", "T", "W", "Th", "F", "Sa", "Su"];
    var courseDays = classToAdd.day.split(/(?=[A-Z])/);

    for (k = 0; k < courseDays.length; k++) {
        var posnClass = classToAdd.start_time.replace(':', '') + "_" + (days.indexOf(courseDays[k]) + 1);
        var posn = $('.' + posnClass);
        var newScheduleCourseBox = $('<div class="scheduleCourseBox ' + classToAdd.course + classToAdd.section.split(" ")[0] + '"></div>');
        var scheduleCourseBoxCourse = $('<center><div class="scheduleCourseBoxCourse">' +
            classToAdd.course + " - " + classToAdd.section.split(" ")[0] + '</div></center>');
        var scheduleCourseBoxTime = $('<center><div class="scheduleCourseBoxTime">' +
            classToAdd.start_time + " - " + classToAdd.end_time + '</div></center>');
        newScheduleCourseBox.append(scheduleCourseBoxCourse, scheduleCourseBoxTime);
        newScheduleCourseBox.css("top", posn.position().top);
        newScheduleCourseBox.css("left", posn.position().left);
        newScheduleCourseBox.css("height", findHeight(classToAdd.start_time,
            classToAdd.end_time));
        newScheduleCourseBox.css("width", findWidth());
        newScheduleCourseBox.attr("posn", posnClass)

        if (classToAdd.section.split(" ")[0] == "TUT") {
            newScheduleCourseBox.css("background-color", "#a0eddb");
            newScheduleCourseBox.css("border-color", "#68a294")
        } else if (classToAdd.section.split(" ")[0] == "LAB") {
            newScheduleCourseBox.css("background-color", "#c9a0ed");
            newScheduleCourseBox.css("border-color", "#ad77dd")
        }

        newScheduleCourseBox.appendTo('.table');
    }
}