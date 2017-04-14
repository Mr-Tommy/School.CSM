﻿var vedioPopup = null;//视频弹窗
var framedCloudVedio;
var mlonlat;
//var isLoadingVedio =0;
$(document).ready(function () {
    //setTimeout(videoClassify.initLogin, 5000);// 初始登录播放视频平台
});


function initVideoPopup() {

    createVedioPopup();//创建弹窗
    closeVedioPopup();
    videoClassify.initLogin();//初始登录播放视频平台

}


function addVedioPopup(e) {
    //if (isLoadingVedio == 1) {
    //    isLoadingVedio = 0;
    //    createVedioPopup();//创建弹窗
    //    closeVedioPopup();
    //    videoClassify.initLogin();//初始登录播放视频平台

    //}

    if (Alarm.alarmState) {//如果正在告警不弹窗
        alert("请在确警后再进行此操作！");
        return;
    }

    closeInfoWin();//弹出之前先关闭其他设备或者区域的弹框
    closeVedioPopup();//关掉已有的视频的弹框
    var vedioMarker = this;
    if ($("#semiCircleControl").attr("isShow") == 0) {//如果扇形没有显示
        if (vedioMarker.semiCircle) {
            semiCircleLayer.addFeatures(vedioMarker.semiCircle);
        }
    }
    vedioMarker.setUrl(vedioMarker.flash_image);



    currentClickMarker = vedioMarker;



    var AlarmInfoBoxdisplay = $('#correctAlarmInfoBox').css('display');
    if (AlarmInfoBoxdisplay == 'none') {

    }
    else {
        $("#correctAlarmInfoBox").css("display", "none");
    }
    var checkCorrectInfo = $('#checkCorrectInfo').css('display');
    if (checkCorrectInfo == 'none') {

    }
    else {
        $("#checkCorrectInfo").css("display", "none");
    }
    var alarmflowChartBox = $('#alarmflowChartBox').css('display');
    if (alarmflowChartBox == 'none') {

    }
    else {
        $("#alarmflowChartBox").css("display", "none");
    }



    if (vedioMarker.device_type == 1 || vedioMarker.device_type == 3) {//固定摄像机
        $("#playControllDiv").removeClass("videoplayer-round").addClass("videoplayer-round2");//外框
        $("#playTop").removeClass("playerionc1").addClass("playerionc01");//上
        $("#playBottom").removeClass("playerionc2").addClass("playerionc02");//下
        $("#playLeft").removeClass("playerionc3").addClass("playerionc03");//左
        $("#playRight").removeClass("playerionc4").addClass("playerionc04");//右
        $("#playLeftTop").removeClass("playerionc5").addClass("playerionc05");//左上
        $("#playRightTop").removeClass("playerionc6").addClass("playerionc06");//右上
        $("#playLeftBottom").removeClass("playerionc7").addClass("playerionc07");//左下
        $("#playRightBottom").removeClass("playerionc8").addClass("playerionc08");//右下
        $("#playMiddle").removeClass("playerionc9").addClass("playerionc09");//中间
    } else {//云台
        $("#playControllDiv").removeClass("videoplayer-round2").addClass("videoplayer-round");//外框
        $("#playTop").removeClass("playerionc01").addClass("playerionc1");//上
        $("#playBottom").removeClass("playerionc02").addClass("playerionc2");//下
        $("#playLeft").removeClass("playerionc03").addClass("playerionc3");//左
        $("#playRight").removeClass("playerionc04").addClass("playerionc4");//右
        $("#playLeftTop").removeClass("playerionc05").addClass("playerionc5");//左上
        $("#playRightTop").removeClass("playerionc06").addClass("playerionc6");//右上
        $("#playLeftBottom").removeClass("playerionc07").addClass("playerionc7");//左下
        $("#playRightBottom").removeClass("playerionc08").addClass("playerionc8");//右下
        $("#playMiddle").removeClass("playerionc09").addClass("playerionc9");//中间
    }
    $("#cameraName").html(vedioMarker.device_name);

    //if (confirm("确定只显示视频弹窗吗？")) {
    //右上角报警确警按钮隐藏
    $("#alarmRightTop").css("display", "none");
    //替换云台控制器的样式
    $("#videoRoundness").removeClass("videoplayer-function videoplayer-two").addClass("videoplayer-function videoplayer-function2 videoplayer-two");
    //隐藏报警列表
    $("#alarmList").css("display", "none");
    //显示视频下侧按钮
    $("#videoBottom").css("display", "block");
    //控件随地图的移动而移动
    var marginTop = $("#h3c_IMOS_ActiveX").css("margin-top");
    if (marginTop == "2px") {
        $("#h3c_IMOS_ActiveX").css("margin-top", "1px");
    } else {
        $("#h3c_IMOS_ActiveX").css("margin-top", "2px");
    }

    //让控件显示出来
    document.getElementById("h3c_IMOS_ActiveX").width = "100%";
    document.getElementById("h3c_IMOS_ActiveX").height = "100%";
    //}

    mapVideo.deviceCode = vedioMarker.device_code;


    //改变位置
    vedioPopup.lonlat = vedioMarker.getLonLat();
    vedioPopup.updateSize();
    var deviceCodes = [];
    //添加弹窗
    vedioPopup.show();
    //播放视频

    deviceCodes.push(vedioMarker.device_code);
    videoClassify.playVideo(deviceCodes);

}


function vedioPopupClose() {
    if (vedioPopup) {
        try {
            vedioPopup.hide();
            //vedioPopup.destroy();
        }
        catch (e) { }
    }
    if (simplePopup) {
        try {
            simplePopup.hide();
            simplePopup.destroy();
        }
        catch (e) { }
    }
    //停止播放当前视频
    videoClassify.stopPlayVideo();
}


//function AlarmPopupClose() {


//    if (vedioPopup) {
//        try {
//            vedioPopup.hide();
//            //vedioPopup.destroy();
//        }
//        catch (e) { }
//    }

//}

function closeVedioPopup() {

    if (vedioPopup) {
        try {
            vedioPopup.hide();
            //vedioPopup.destroy();
            if ($("#semiCircleControl").attr("isShow") == 0) {//如果扇形没有显示
                if (currentClickMarker.semiCircle) {
                    semiCircleLayer.removeAllFeatures();//清除扇形图层的全部的要素
                    semiCircleLayer.removeFeatures(currentClickMarker.semiCircle);//关闭扇形
                }
            }
            if (currentClickMarker.device_status == 1) {
                currentClickMarker.setUrl(currentClickMarker.normal_image);
            }
            else {
                currentClickMarker.setUrl(currentClickMarker.error_image);
            }
           

            //var size = new SuperMap.Size(15.15, 23);
            //var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 2));
            //var icon = new SuperMap.Icon(currentClickMarker.normal_image, size, offset);
            //currentClickMarker.icon = icon;//更换为正常图标

        }
        catch (e) { }
    }
}

//关闭告警执行硬件 乔
function closeHardware() {
    if (Alarm.alarmState == true) {
        AlarmPopupClose();
    }
}

function createVedioPopup(lonlat) {
    var activeXhtml = "";
    switch (definedVideoPlatform) {
        case 1://宇视
            activeXhtml = '<object classid="clsid:067A4418-EBAC-4394-BFBE-8C533BA6503A" id="h3c_IMOS_ActiveX" events="true" height="100%" width="100%"></object>';
            break;
        case 2://海康
            break;
        case 3://博世
            activeXhtml = '<object classid="clsid:{B430599E-D328-4713-8DD4-DB0E93947BF0}" id="h3c_IMOS_ActiveX" events="true" height="100%" width="100%"></object>';
            break;
    }
    var vedioPopuptHtml = '<div class="videoplayer-title">' +
        '<b id="cameraName">宇视球机</b>' +
        '<a href="#" class="videoplayer-link">详情>></a>' +
        '<div class="about-close" onclick="closeVedioPopup();closeHardware();"></div>' +
    '</div>' +
    '<div class="videoplayer-content">' +
        '<div class="videoplayer-top">' +
            '<div class="videoplayer-view" id="videoplayerView">' +
            activeXhtml +
            '</div>' +
            '<div id="my3" class="viewR">' +
                '<div class="videoplayer-view camera-box" id="alarmflowChartBox" style="display:none">' +
                    '<div class="camera-title">' +
                        '<b id="flowChartTitle">预案流程图</b>' +
                        '<div class="camera-close" onclick="Alarm.imgFlowClose() "></div>' +
                    '</div>' +
                    '<textarea id="SavedModel" style="display:none"></textarea>' +
                    '<div class="camera-content" id="alarmflowChart"></div>' +
                '</div>' +
                '<div class="videoplayer-view videolist-box" id="correctAlarmInfoBox" style="display:none">' +
                    '<div class="videolist-title">' +
                        '<b>确警信息框</b>' +
                        '<div class="videolist-close" onclick="Alarm.closeConfirm()"></div>' +
                    '</div>' +
                    '<div class="videolist-content">' +
                        '<form role="form">' +
                            '<table style="margin:0 auto">' +
                                '<tr>' +
                                    '<td>报警编号：</td>' +
                                    '<td><input type="text" style="cursor:not-allowed"  class="form-control" id="alarmid" readonly="readonly" ></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>确警人：</td>' +
                                    '<td><input type="text" style="cursor:not-allowed" class="form-control" readonly="readonly" id="confirmAlarmname"></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>确警结论：</td>' +
                                    '<td>' +
                //$("confirmResult").html() +
                                    $("#confirmResultDiv").html() +
                                    '</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>确警位置：</td>' +
                                    '<td><input type="text" class="form-control" id="Alarmlocation"></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>确警描述：</td>' +
                                    '<td><textarea class="form-control formStyle" rows="3" id="confirmAlarmText"></textarea></td>' +
                                '</tr>' +
                            '</table>' +
                            '<div class="tabFoot btnCancel">' +
                                '<button type="button" class="btn btn-primary query" onclick="Alarm.confirm()">确定</button>' +
                                '<button type="button" class="btn btn-default queryD" onclick="Alarm.closeConfirm()">取消</button>' +
                            '</div>' +
                        '</form>' +
                    '</div>' +
                '</div>' +
                '<div class="videoplayer-view videolist-box1" style="display:none;" id="checkCorrectInfo">' +
                    '<div class="videolist-title">' +
                        '<b id="checkConfirmAlarmId">查看确警信息</b>' +
                        '<div class="videolist-close" onclick="Alarm.closeCheckConfirm()"></div>' +
                    '</div>' +
                    '<div class="videolist-content">' +
                        '<form  role="form">' +
                            '<table style="margin:0 auto">' +
                                '<tr>' +
                                    '<td>确警人：</td>' +
                                    '<td><input type="text" style="cursor:not-allowed"  class="form-control" readonly="readonly" id="checkConfirmAlarmname"></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>确警结论：</td>' +
                                    '<td>' +
                                    '<input type="text"  style="cursor:not-allowed" class="form-control" readonly="readonly" id="checkConfirmResult">' +
                                    '</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>确警位置：</td>' +
                                    '<td><input type="text" style="cursor:not-allowed"  class="form-control" readonly="readonly" id="checkAlarmlocation"></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>确警描述：</td>' +
                                    '<td><textarea  style="cursor:not-allowed" class="form-control formStyle" rows="3" id="confirmContent" readonly="readonly"></textarea></td>' +
                                '</tr>' +
                            '</table>' +
                        '</form>' +
                    '</div>' +
                '</div>' +
                '<div class="videoplayer-right">' +
                    '<div class="videoplayer-function videoplayer-one" style="display:block" id="alarmRightTop">' +
                        '<div class="videoimg">' +
                            '<span class="videoimg1" style="cursor:pointer" onclick="Alarm.fourLampAndLedClose()"></span>' +
                            '<span class="videoimg2" style="cursor:pointer" onclick="Alarm.confirmOpen()"></span>' +
                            '<span class="videoimg3" style="cursor:pointer" onclick="Alarm.imgFlowOpen()"></span>' +
                        '</div>' +
                        '<ul>' +
                            '<li onclick="Alarm.fourLampAndLedClose()" style="cursor:pointer">关闭声光</li>' +
                            '<li onclick="Alarm.confirmOpen()" style="cursor:pointer">确警</li>' +
                            '<li onclick="Alarm.imgFlowOpen() " style="cursor:pointer">流程图</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div class="videoplayer-function videoplayer-two" id="videoRoundness">' +
                        '<h4>云台控制器</h4>' +
                        '<div class="videoplayer-round" id="playControllDiv">' +
                            '<span class="playerionc1" id="playTop" onmousedown="mapVideo.topDown()" onmouseup="mapVideo.topUp()"></span>' +
                            '<span class="playerionc2" id="playBottom" onmousedown="mapVideo.bottomDown()" onmouseup="mapVideo.bottomUp()"></span>' +
                            '<span class="playerionc3" id="playLeft" onmousedown="mapVideo.leftDown()" onmouseup="mapVideo.leftUp()"></span>' +
                            '<span class="playerionc4" id="playRight" onmousedown="mapVideo.rightDown()" onmouseup="mapVideo.rightUp()"></span>' +
                            '<span class="playerionc5" id="playLeftTop" onmousedown="mapVideo.lefttopDown()" onmouseup="mapVideo.lefttopUp()"></span>' +
                            '<span class="playerionc6" id="playRightTop" onmousedown="mapVideo.righttopDown()" onmouseup="mapVideo.righttopUp()"></span>' +
                            '<span class="playerionc7" id="playLeftBottom" onmousedown="mapVideo.leftbottomDown()" onmouseup="mapVideo.leftbottomUp()"></span>' +
                            '<span class="playerionc8" id="playRightBottom" onmousedown="mapVideo.rightbottomDown()" onmouseup="mapVideo.rightbottomUp()"></span>' +
                            '<span class="playerionc9" id="playMiddle"></span>' +
                        '</div>' +
                        '<div class="change-num">' +
                            '<p>变倍：</p>' +
                            '<ul>' +
                                '<li onmousedown="mapVideo.amplificationDown()" onmouseup="mapVideo.amplificationUp()" class="changeAdd"></li>' +
                                '<li onmousedown="mapVideo.shrinkDown()" onmouseup="mapVideo.shrinkUp()" class="changeMinus"></li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                    '<div class="videoplayer-function videoplayer-three">' +
                        '<h4>预置位</h4>' +
                        '<ul>' +
                            '<li onclick="mapVideo.usePresetting(1)">1</li>' +
                            '<li onclick="mapVideo.usePresetting(2)">2</li>' +
                            '<li onclick="mapVideo.usePresetting(3)">3</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div class="videoplayer-function videoplayer-four">' +
                        '<h4>视频回放</h4>' + $("#createTimeDiv").html() +
                        '<div class="adjust">' +
                            '<ul>' +
                                '<li><p>调整分钟</p></li>' +
                                '<li><button onclick="mapVideo.playbackTimeControll(1)">-</button></li>' +
                                '<li><p class="adjust-num" id="timeDifference">5</p></li>' +
                                '<li><button onclick="mapVideo.playbackTimeControll(0)">+</button></li>' +
                            '</ul>' +
                            '<div class="adjust-direction">' +
                                '<span class="adjustLeft" id="retrogress" onclick="mapVideo.retrogressPlayback()" title="快退" value="2"></span>' +
                                '<span class="adjustCenter" id="pauseContinue" onclick="mapVideo.pausePlayback()" title="暂停" value="1"></span>' +
                                '<span class="adjustRight" id="advance" onclick="mapVideo.advancePlayback()" title="快进" value="2"></span>' +
                            '</div>' +
                            '<div class="adjust-btn">' +
                                '<button onclick="mapVideo.startPlayback()">加载</button>' +
                                '<button onclick="mapVideo.stopPlayback()">停止</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div id="alarmList">' +
            '<div class="videoplayer-list" id="videoPlayFrame" style="display:block">' +
                '<h4>报警列表</h4>' +
                '<div class="videoplayer-scroll">' +
                    '<div class="videoplayer-alarm">' +
                        '<div class="alarm-num" id="alarmNum"></div>' +
                    '</div>' +
                    '<div class="videoplayer-ionc1" id="scrollLeft"><span class="scrollLeft"></span></div>' +
                    '<div class="videoplayer-ul">' +
                        '<ul id="alarmInfo"></ul>' +
                    '</div>' +
                    '<div class="videoplayer-ionc2 " id="scrollRight"><span class="scrollRight"></span></div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div id="videoBottom">' +
            '<div class="videoplayer-footer videoplayer-footer2">' +
                '<ul>' +
                    '<li onclick="eventRecord()">' +
                        '<span class="footionc1"></span>' +
                        '<p>事件记录</p>' +
                    '</li>' +
                    '<li onclick="cameraEventAlarm()">' +
                        '<span class="footionc2"></span>' +
                        '<p>人工上报</p>' +
                    '</li>' +
                    '<li onclick="gotoMonitor()">' +
                        '<span class="footionc3"></span>' +
                        '<p>上大屏</p>' +
                    '</li>' +
                    '<li onclick="fastGotoMonitor()">' +
                        '<span class="footionc4"></span>' +
                        '<p>快速上大屏</p>' +
                    '</li>' +
                    '<li>' +
                        '<span class="footionc5"></span>' +
                        '<p class="footword5" onclick="mapVideo.timelyPlayback()">及时回放</p>' +
                    '</li>' +
                    '<li>' +
                        '<span class="footionc6"></span>' +
                        '<p>语音对讲</p>' +
                    '</li>' +
                    '<li>' +
                        '<span class="footionc7"></span>' +
                        '<p onclick="mapVideo.downloadVideoDialog()">视频下载</p>' +
                    ' </li>' +
                '</ul>' +
            '</div>' +
        '</div>' +
    '</div>';
    //$("#vedioPlayer").append(vedioPopuptHtml);
    framedCloudVedio = new SuperMap.Popup.FramedCloud("vedioPopup", new SuperMap.LonLat(0, 0), null, vedioPopuptHtml, null, false, null, true);
    framedCloudVedio.autoSize = true;
    framedCloudVedio.panMapIfOutOfView = true;
    vedioPopup = framedCloudVedio;
    csm.mapContainer.addPopup(framedCloudVedio);
}
//事件记录
function eventRecord() {
    alert("正在开发中...");
}
//点击上大屏
function gotoMonitor() {
    alert("正在开发中...");
}
//快速上大屏
function fastGotoMonitor() {
    if (!IsMain) {
        alert("只有主终端才能调用此功能！");
    }
    else {
        if ($.cookie("mainControlRegionId")) {
            regionId = $.cookie("mainControlRegionId");
            $.ajax({
                url: "/Schedule/GetGalleryConfigByRegionId",
                type: "post",
                data: { regionId: regionId },
                datatype: 'json',
                async: false,
                success: function (data) {
                    if (data.status == 0 && data.msg != null) {
                        var datas = data.msg;
                        var arr = new Array();
                        for (var i = 0; i < datas.length; i++) {
                            arr.push(datas[i].screenCode);
                        }
                        if (arr.length > 0) {
                            videoClassify.StartMonitorLive(arr[0], currentClickMarker.device_code);
                        }
                        else {
                            alert("该园区无快速上大屏的屏或大屏未配置！");
                        }
                    }
                    else {
                        alert("该园区无快速上大屏的屏或大屏未配置！");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(XMLHttpRequest.status + "错误请联系管理员！");
                }
            })
        }
        else {
            alert("未获取到当前主控园区！");
        }

    }
}

