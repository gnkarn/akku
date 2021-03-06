$(document).ready(function () {


    var navListItems = $('div.setup-panel div a'),
        allWells = $('.setup-content'),
        allNextBtn = $('.nextBtn');

    allWells.hide();

    navListItems.click(function (e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
            $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-primary').addClass('btn-default');
            $item.addClass('btn-primary');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });

    allNextBtn.click(function () {

        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            curInputs = curStep.find("input[type='text'],input[type='url']"),
            isValid = true;

        console.log(curStepBtn);

        if (curStepBtn === 'step-1') {
            isValid = false;
            $.ajax({
                method: "POST",
                async: false,
                url: "/validate-module",
                data: $("form").serialize()
            }).success(function (data) {
                var formHtml = '';
                $.each(data.things, function (key, item) {
                    formHtml += '<div class="form-group"> <label for="' + item.key + '"> Switch ' + key + 1 + '</label> <input type="text" class="form-control" name="' + item.key + '" id="' + item.key + '" value="' + item.name + '" placeholder="' + item.key + '">  </div>';
                });
                $("#sw").html(formHtml);
                $("#module_name").val(data.module_name);
                isValid = true;
            }).error(function (data) {
                sweetAlert("Oops...", "Please enter valid module key and pin", "error");
                $("#sw").html('');
                $("#module_name").val('');
                isValid = false;
            });
        }

        if (curStepBtn === 'step-2') {
            isValid = false;
            $.ajax({
                method: "POST",
                url: "/save-module",
                async: false,
                data: $("form").serialize()
            }).success(function (data) {

                isValid = true;
            }).error(function (data) {
                sweetAlert("Oops...", "Something went wrong!", "error");


                isValid = false;
            });
        }

        $(".form-group").removeClass("has-error");
        for (var i = 0; i < curInputs.length; i++) {
            if (!curInputs[i].validity.valid) {
                isValid = false;
                $(curInputs[i]).closest(".form-group").addClass("has-error");
            }
        }

        if (isValid)
            nextStepWizard.removeAttr('disabled').trigger('click');
    });

    $(".switch.enabled input").click(function (e) {
        if ($(this).parent().hasClass("enabled")) {
            $thingID = $(this).attr("data-id");
            if ($(this).is(':checked')) {
                SwitchChangeByUser($thingID, 1);
            } else {
                SwitchChangeByUser($thingID, 0);
            }
            $(this).parent().removeClass("enabled");
        } else {
            e.preventDefault();
        }
    });

    $('div.setup-panel div a.btn-primary').trigger('click');
    $('.finish-btn').click(function () {
        swal({
                title: "Good job!",
                text: "You configured the first module!",
                type: "success",
                showCancelButton: false,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "You done !! You are gonna navigation"
            },
            function () {
                window.location = "/";
            });
    });


    // handling onchange checkbox on accessible switch
    $('.switchChange:checkbox').change(function () {
        var id = $(this).attr('id');
        if ($(this).is(":checked")) {
            alert(id)
            SwitchChangeByUser(id,1);
        } else {
            SwitchChangeByUser(id,0)
        }
    });
});

function turnSwitch($thingID, $status) {
    $thingSwitch = $(".switch").find("input[data-id='" + $thingID + "']");
    if($status == 1){
        if(!$thingSwitch.is(':checked')) {
            $thingSwitch.prop( "checked", true );
        }
    } else {
        $thingSwitch.prop("checked", false);
    }
    $thingSwitch.parent().addClass("enabled");
}

/*HighChart JS for power*/
var tempChart, powerChart, humidityChart; // global

$(document).ready(function () {

    $("#setTemp").click(function () {
        payload = new Object();
        payload.action    = 'update_data';
        payload.thing_id 	= 5;
        payload.value 		= 40;
        socket.send(JSON.stringify(payload));
    })

    console.log($power);
    var isHome = $("#powerutilchart").length > 0 ? true : false;
    if(isHome) {
        humidityChart = new Highcharts.Chart({
            chart: {
                renderTo: 'humiditychart',
                defaultSeriesType: 'spline',
                events: {
                    load: setHumidityLevel
                }
            },
            title: {
                text: 'Live Humidity'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150,
                maxZoom: 20 * 1000
            },
            yAxis: {
                title: {
                    text: 'Absolute humidity'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            series: [{
                name: 'Humidity',
                data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = 0; i <= $humid.length; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: $humid[i]
                        });
                    }
                    return data;
                }())
            }]
        });

        tempChart = new Highcharts.Chart({
            chart: {
                renderTo: 'temparaturechart',
                defaultSeriesType: 'spline',
                events: {
                    load: setTemperatureLevel
                }
            },
            title: {
                text: 'Live Temperature'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Celsius'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            series: [{
                name: 'Temperature',
                data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = 0; i <= $temp.length; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: $temp[i]
                        });
                    }
                    return data;
                }())
            }]
        });


        powerChart = new Highcharts.chart('powerutilchart', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false
            },
            title: {
                text: 'Power<br>Usage',
                align: 'center',
                verticalAlign: 'middle',
                y: 40
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        distance: -50,
                        style: {
                            fontWeight: 'bold',
                            color: 'white'
                        }
                    },
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '75%']
                }
            },
            series: [{
                type: 'pie',
                name: 'Range',
                innerSize: '50%',
                data: [
                    ['Power Consumption', $power],
                    ['Available Range', ((230*5) - $power)],
                    {
                        name: 'Proprietary or Undetectable',
                        y: 0.2,
                        dataLabels: {
                            enabled: false
                        }
                    }
                ]
            }]
        });
    }
});

function setHumidityLevel($value){
    // set up the updating of the chart each second
    if(!humidityChart) return;
    var series = humidityChart.series[0];
    var x = (new Date()).getTime(), // current time
        y = $value,
        shift = series.data.length > 10;
    series.addPoint([x, y], true, shift);
}


function setTemperatureLevel($value){
    // set up the updating of the chart each second
    if(!tempChart) return;
    var series = tempChart.series[0];
    var x = (new Date()).getTime(), // current time
        y = $value,
        shift = series.data.length > 10;
    series.addPoint([x, y], true, shift);
}
