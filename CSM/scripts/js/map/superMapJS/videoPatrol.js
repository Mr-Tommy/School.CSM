﻿var timetemp = null;//时间分段标记缓存
//var timer_patrol = 1000;//路线回放速度
var count = 0;//记录路线回放循环位置
var endcount = null;
var startpt = null;//路线回放定时器
var tempdevice;
var urll = null;
var checkdevice = []; //历史查询已选择设备信息
var deviceplay = null;  //路线回放选择的设备信息
var historicalroute = [];//路线回放模块历史路线数组
var mapsdata = [];
var isfloor = 0;//标示楼内楼外
isvideopatrol = true;
$(document).ready(function () {
    //isvideopatrol = pausePlaying();
    urll = getServerUrl(csm.serverUrl);
    getAllBuildingUrl();
    showVideoPatrolTable();
});


//视频巡更定时任务
function videoPatrolInterval() {
    videoPatrolStart();
    playTimer();
}




//视频巡更开始任务
function videoPatrolStart() {

    if (videopatrolList != -1)//请求已接到
    {
        
        LoadingVideodgData();
        isfloor = Number( $("#mapContainer").attr("currentMapType"));

        if(Alarm.alarmState) {//如果正在告警那么停止播放
        
            pausePlaying();
            alert("请在确警后再进行地图视频轮训操作！");
            return;
        }

        $("#videoPatrolDiv").attr("style", "display:;");
        //for (var i = 0; i < videopatrolList.length; i++) {
        if (count < videopatrolList.length) {

            $("#viedopatroltext").attr("style", "display:");//条幅
            var progressnum = parseInt(((count + 1) /videopatrolList.length) * 100);//当前播放进度
            $("#videopatrol_progressbar").attr("style", "width: " + progressnum + "%;");//进度条图
            $("#videopatrol_progressbar").text(progressnum + "%");//进度条数字
            //$("#videopatrol_num").html('<span>' + videopatrolList.length + '-' + (count+1) + '</span>');

            $('#videoPatroldg').datagrid('checkRow', count);
            $('#videoPatroldg').datagrid('loaded');
            if (videopatrolList[count].is_inbuilding == -1) {//楼外摄像机

                if (isfloor == 3 ) {
                
                    returnMainMap();//返回楼外图
                    csm.mapContainer.zoomTo(3);
                }

                var marker = searchVideoNoBuilding(videopatrolList[count].device_id);
                if (marker != -1) {
                    //this = marker;            

                    addVedioPopupPatrol(marker);
                }
            }
            else {

                loadingVideoBuilding(videopatrolList[count].ext9, videopatrolList[count].ext3, videopatrolList[count].ext6, videopatrolList[count].ext4, videopatrolList[count].ext5)
                var marker = searchFloorVideoBuilding(videopatrolList[count].device_id);
                if (marker != -1) {
                    //this = marker;               
                    addVedioPopupPatrol(marker);
                }

            }



            count++;
        }
        else {

            count = 0;
            videoPatrolStart();
            //$("#videopatrol_progressbar").attr("style", "width: " + progressnum + "%;");//进度条图
            //$("#videopatrol_progressbar").text(progressnum + "%");//进度条数字
            //$("#videopatrol_num").html('<span>' + videopatrolList.length + '-' + count + '</span>');
            //$("#videoPatrolDiv").attr("style", "display:none;");
            //clearInterval(startpt);
            //alert("播放完毕！");
        }

    }
    else {

        clearInterval(startpt);
    }
    //var videojson = JSON.parse(videodevices); //由JSON字符串转换为JSON对象

}

//播放视频方法
function addVedioPopupPatrol(marker) {
    //if (isLoadingVedio == 1) {
    //    isLoadingVedio = 0;
    //    createVedioPopup();//创建弹窗
    //    closeVedioPopup();
    //    videoClassify.initLogin();//初始登录播放视频平台

    //}

    closeInfoWin();//弹出之前先关闭其他设备或者区域的弹框
    closeVedioPopup();//关掉已有的视频的弹框
    var vedioMarker = marker;
    currentClickMarker = vedioMarker;

    if ($("#semiCircleControl").attr("isShow") == 0) {//如果扇形没有显示
        if (vedioMarker.semiCircle) {
            semiCircleLayer.addFeatures(vedioMarker.semiCircle);
        }
    }
    vedioMarker.setUrl(vedioMarker.flash_image);




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


//从楼外设备中检索所需设备
function searchVideoNoBuilding(id) {

    if (markerLayerArray != undefined && markerLayerArray != null && markerLayerArray != "") {//判断设备图层存在

        for (var j = 0; j < markerLayerArray.length; j++) {//轮训设备图层

            if (markerLayerArray[j].deviceType == 1 || markerLayerArray[j].deviceType == 2 || markerLayerArray[j].deviceType == 3 || markerLayerArray[j].deviceType == 4) {

                for (var h = 0; h < markerLayerArray[j].markers.length; h++) {//轮训markers集合

                    if (markerLayerArray[j].markers[h].id == id) {

                        return markerLayerArray[j].markers[h];

                    }

                }



            }

        }

        return -1;
    }
    else {

        return -1;

    }

}



//从楼内设备中检索所需设备
function searchFloorVideoBuilding(id) {

    if (floorDeviceLayerArray != undefined && floorDeviceLayerArray != null && floorDeviceLayerArray != "") {//判断设备图层存在

        for (var j = 0; j < floorDeviceLayerArray.length; j++) {//轮训设备图层

            if (floorDeviceLayerArray[j].deviceType == 1 || floorDeviceLayerArray[j].deviceType == 2 || floorDeviceLayerArray[j].deviceType == 3 || floorDeviceLayerArray[j].deviceType == 4) {

                for (var h = 0; h < floorDeviceLayerArray[j].markers.length; h++) {//轮训markers集合

                    if (floorDeviceLayerArray[j].markers[h].id == id) {

                        return floorDeviceLayerArray[j].markers[h];

                    }

                }



            }

        }

        return -1;
    }
    else {

        return -1;

    }

}



//加载楼内图
function loadingVideoBuilding(id,building_id, floor_src_2d, point1, point2) {
    var serverurl = "";
    var bl = false;
    for (var i = 0; i < mapsdata.length; i++) {
        if (mapsdata[i].additions != null && mapsdata[i].additions != undefined && mapsdata[i].additions.length > 0) {
            if (mapsdata[i].additions[0] == floor_src_2d)//floorinfo.building_id + "@" +
            {
                serverurl = mapsdata[i].url + "/maps/" + mapsdata[i].additions[0];
                bl = true;
            }
        }
    }

    if (!bl) {
        alert("没有找到服务名为：" + floor_src_2d + ",楼编号为：" + building_id + "的楼层地图服务，请检查楼层配置是否正常！");
        return;
    }
    if (isfloor != 3) {
        $("#rightFloat").hide();//隐藏区域工具栏
        $(".mapswitch").hide();//隐藏2/3维切换
        // $(".floorTool-num").html(html);//设置楼内图工具栏div
        $("#floorTool").show();//显示楼内图的工具栏
        resetDeviceToolIcon();//重置设备工具栏图标，都设置为激活图标
        $(".floor").hide();//显示楼内图的工具栏
        for (var i = 0; i < markerLayerArray.length; i++) {
            csm.mapContainer.removeLayer(markerLayerArray[i]);
        }//移除楼外的设备
        for (var i = 0; i < polygonLayerArray.length; i++) {
            csm.mapContainer.removeLayer(polygonLayerArray[i]);
        }//移除楼外的区域
    }
    if (csm.floorMap) {
        csm.mapContainer.removeLayer(csm.floorMap);//移除楼内图
        csm.floorMap = null;
        for (var i = 0; i < floorDeviceLayerArray.length; i++) {
            csm.mapContainer.removeLayer(floorDeviceLayerArray[i]);
        }
        floorDeviceLayerArray = [];//清除楼内图的设备
    }
    closeInfoWin();//关闭地图上的一些非视频弹窗和区域的弹框
    //floorNumClick(id);//将楼内图工具条第一个的楼内显示出来

    //把左下右上坐标转换为中心点位
    var centerxy = swAndneToCenter(point1,point2);
    //创建楼层中心点位坐标
    csm.floorCenter = new SuperMap.LonLat(centerxy.x, centerxy.y);
   
    //加载楼内图
    LoadFloorMap(serverurl);



    //加载楼内图的设备的加载
    addFloorDevice(id);//根据当前楼内图的id找到对应的设备
    //$(".currentFloor").html(obj.getAttribute("building_name"));//显示当前楼内图所在区域的名称
    //$(".currentFloor").html(obj.getAttribute("area_name") + floorName);//楼层所在区域+楼层名
    //$(".currentID").html(obj.getAttribute("id"));//隐藏域，当前楼层的id，在上下切换的时候用



}

//获取地图服务器地址
function getServerUrl(baseurl) {
    var serverurl = "";
    if (baseurl != null && baseurl != undefined && baseurl != "") {
        if (baseurl.indexOf('/') > 0) {
            var baseurlarr = baseurl.split('/');
            serverurl = "http://" + baseurlarr[2] + "/iserver/services.json";
        }
    }

    else {
        alert("地图配置读取失败！");
    }
    return serverurl;
}

//获取超图发布的所有rest服务
function getAllBuildingUrl() {
    var a = "";
    $.get(urll, function (data) {

        for (var i = 0; i < data.length; i++) {
            if (data == null) {
                alert("getBuildingUrl()方法请求超图服务失败！请检查超图服务是否正常开启！");
            }
            //瓦片发布形式修改---- 1）
            if (data[i].interfaceType == "com.supermap.services.rest.RestServlet") {
                var datanew = data[i];
                mapsdata.push(datanew);
            }
            //var indexnum = csm.serverUrl.indexOf("/maps/");
            //if (indexnum > 0) {
            //var serverstring = csm.serverUrl.substring(0, indexnum);
            //if (data[i].interfaceType == "com.supermap.services.rest.RestServlet" && data[i].url == serverstring) {
            //        var datanew = data[i];
            //        mapsdata.push(datanew);
            //    }
            //}
        }
    });
}


//开始播放
function startPlaying() {
    if (Alarm.alarmState) {//如果正在告警那么停止播放

        pausePlaying();
        alert("请在确警后再进行地图视频轮训操作！");
        return;
    }
    videoPatrolStart();
    playTimer();
    document.getElementById('videopatrol_config').onclick = function () {
        pausePlaying();
    };
    $("#videopatrol_config").html('<img src="../style/base/images/public/stop.png" /><span>暂停</span>');

}

//暂停播放
function pausePlaying() {
    $("#viedopatroltext").attr("style", "display:none");//条幅
    document.getElementById('videopatrol_config').onclick = function () {
        startPlaying();
    };
    $("#videopatrol_config").html('<img src="../style/base/images/public/play.png" /><span>播放</span>');
    clearInterval(startpt);
}

//播放定时器
function playTimer() {
    clearInterval(startpt);
    var playspeednum = $("#videopatrol_playspeed").val();
    var playspeedtimer =  Number(playspeednum) * 1000;
    startpt = setInterval(videoPatrolStart, playspeedtimer);
}

//停止播放，复位
function stopPlaying() {
    $("#viedopatroltext").attr("style", "display:none");//条幅
    pausePlaying();
    count = 0;
    var stopisfloor = $("#mapContainer").attr("currentMapType");

    if (Alarm.alarmState) {//如果正在告警那么停止播放
        return;
    }
    if (stopisfloor == 3) {

        returnMainMap();//返回楼外图
        csm.mapContainer.zoomTo(2);

    }
    closeVedioPopup();//关闭视频弹窗

}


//显示轮训组的摄像机列表
function showVideoGroupData() {

    $("#videoPatroldgdiv").attr("style", "display:;");
    document.getElementById('videoGroupData').onclick = function () {
        hideVideoGroupData();
    };
    $("#videoGroupData").html('<img src="../style/base/images/public/look.png" /><span>查看</span>');

    showVideoPatrolTable();
    LoadingVideodgData();
    $('#videoPatroldg').datagrid('checkRow', count);
}


//隐藏轮训组的摄像机列表
function hideVideoGroupData() {
    $("#videoPatroldgdiv").attr("style", "display:none;");
    document.getElementById('videoGroupData').onclick = function () {
        showVideoGroupData();
    };
    $("#videoGroupData").html('<img src="../style/base/images/public/look-grey.png" /><span>查看</span>');

}

//界面上直接选取速度
function speedChange() {
    if ($("#videopatrol_config").attr("onclick") == "startPlaying()") {
        return;
    } //播放完毕直接退出方法
    clearInterval(startpt);
    playTimer();

}


//快进增速
function fastForwardAdd() {
    var speed = $("#playspeed").val();
    if (speed < 10) {
        speed++;
    }
    else {
        speed = 10;
    }
    $("#playspeed").val(speed);
    if (endcount == 1) { return; }//播放完毕直接退出方法
    clearInterval(startpt);
    playTimer();
}

//减速播放
function fastForwardSub() {
    var speed = $("#playspeed").val();
    if (speed > 1) {
        speed--;
    }
    else {
        speed = 1;

    }

    $("#playspeed").val(speed);
    if (endcount == 1) { return; } //播放完毕直接退出方法
    clearInterval(startpt);
    playTimer();
}

//关闭视频巡更方法
function closeVideoPatrolPopue() {
    $("#viedopatroltext").attr("style", "display:none");//条幅

    $("#videoPatrolDiv").attr("style", "display:none;");
    count = 0;
    clearInterval(startpt);

    var stopisfloor = $("#mapContainer").attr("currentMapType");
    if (Alarm.alarmState) {//如果正在告警那么停止播放
        return;
    }
    if (stopisfloor == 3) {

        returnMainMap();//返回楼外图
        csm.mapContainer.zoomTo(2);

    }

    closeVedioPopup();//关闭视频弹窗

}

//左下右上坐标转换为中心点坐标
function swAndneToCenter(southwest, northeast) {
    var center_x = (Number(northeast.split(',')[0]) - Number(southwest.split(',')[0])) / 2 + Number(southwest.split(',')[0]);
    var center_y = (Number(northeast.split(',')[1]) - Number(southwest.split(',')[1])) / 2 + Number(southwest.split(',')[1]);
    var center = { "x": center_x, "y": center_y };
    return center;
}


//列表初始化
function showVideoPatrolTable(){

    $('#videoPatroldg').datagrid({
        data: "",
        fitColumns: false,
        singleSelect: true,
        method: 'get',
        loadMsg: '正在加载……',
        pageNumber: 1, //重点:传入当前页数
        checkbox: true,
        pagination: false, //分页控件 
        //rownumbers: true, //行号
        checkOnSelect: false,
        queryParams: {
        },
        onDblClickRow: function (rowIndex, rowData) {//双击事件

            count = rowIndex;
            videoPatrolStart();

        },
        columns: [[
           // { field: 'ck', checkbox: true },
            {
                field: 'is_inbuilding', title: '位置', width: '38', align: "center",
                formatter: function (value, row, index) {
                    if (value == -1) {
                        return '楼外'
                    }
                    else {
                        return '楼内'

                    }
                }
            },
            { field: 'device_name', title: '设备名称', width: '155', align: "center" }
        ]],
        //singleSelect: false,
        onLoadSuccess: function (data) {
        },
        onLoadError: function () {
            alert('关联文件显示加载失败');
        }

    });
}

//加载列表数据
function LoadingVideodgData() {

    if (videopatrolList != null) {
        $('#videoPatroldg').datagrid('loadData', videopatrolList);
    }
    $('#videoPatroldg').datagrid('loaded');
}