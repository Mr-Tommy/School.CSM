﻿var mapSchedule = {}  //定义全局变量
var switchDeviceArr = null; //轮切设备组数组
var monitorDeviceArr = null;//轮巡设备组数组
var fastGalleryArr = null;   //快速上大屏的大屏数组
var isRun = false;//轮巡定时器标识
var m = 0;  //轮巡只切换单个屏时，屏幕标识
var d = 0;  //轮巡只切换单个屏时，摄像头标识
//初始化加载
$(function () {
    var schduleInfo = mapSchedule.getScheduleInfo();
    if (schduleInfo != "") {
        //轮切
        if (schduleInfo.scheduleType == 1 && schduleInfo.ext2 == "2") {
            setTimeout(function () { mapSchedule.switchGallery(schduleInfo); }, 1000);
        }
            //轮巡
        else if (schduleInfo.scheduleType == 1 && schduleInfo.ext2 == "1") {
            setTimeout(function () { mapSchedule.monitorStartLive(schduleInfo); }, 1000);
        }
    }
});
//读取计划任务信息
mapSchedule.getScheduleInfo = function () {
    var schduleInfo = "";
    $.ajax({
        url: "/Map/GetScheduleInfo",
        type: "post",
        data: "",
        datatype: 'json',
        async: false,
        success: function (data) {
            if (data != "" && data != null && data.status == 0) {
                schduleInfo = JSON.parse(data.msg);
            }
            else {
                // alert(data.msg);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("读取计划任务缓存信息出现" + XMLHttpRequest.status + "错误请联系管理员！");
        }
    });
    return schduleInfo;
}
//根据设备ID查询设备信息
mapSchedule.queryDeviceGroup = function (groupId) {
    $.ajax({
        url: "/Schedule/GetCameraPatrolDeviceByGroupId",
        type: "post",
        data: { groupId: groupId },
        datatype: 'json',
        async: false,
        success: function (data) {
            if (data.status == 0 && data.msg != null) {
                var datas = data.msg;
                var deviceArr = new Array();
                for (var i = 0; i < datas.length; i++) {
                    deviceArr.push(datas[i].device_code);
                }
                monitorDeviceArr = deviceArr;
            }
            //else {
            //    alert(data.msg);
            //}
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status + "错误请联系管理员！");
        }
    })
}
//根据园区ID获取配置为快速大屏的配置
mapSchedule.queryGalleryByRegion = function (regionId) {
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
                    arr.push(datas[i].galleryCode);
                }
                fastGalleryArr = arr;
            }
            //else {
            //    // alert(data.msg);
            //    alert("该园区无快速上大屏的屏或大屏未配置");
            //}
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status + "错误请联系管理员！");
        }
    })
}
//轮切上大屏  新
mapSchedule.switchGallery = function (rec) {
    var group = null;
    if (rec.ext1 == null || rec.ext1 == "") {
        alert("未设置轮切设备组");
        return;
    }
    var group_id = parseInt(rec.ext1);
    var deviceList = null;
    if (rec.ext3 == "" || rec.ext3 == null) {
        alert("未设置轮切屏编码!");
        return;
    }
    //获取轮切设备组
    $.ajax({
        url: "/Schedule/GetDeviceGroup",
        type: "post",
        data: { groupId: group_id },
        datatype: 'json',
        async: false,
        success: function (data) {
            if (data.status == 0 && data.msg != null) {
                group = data.msg;
            }
            else {
                alert(data.msg);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("查询轮切设备组失败！" + XMLHttpRequest.status + "错误请联系管理员！");
        }
    })
    if (group != null && group.ext1 != "" && group.ext1 != null) {
        //调用地图接口，启动轮切
        videoClassify.StartMonitorSwitch(rec.ext3, group.ext1);
    }
    else {
        //alert("轮播设备组为空或者无轮切资源编码\n请至视频监控页面进行轮播分组管理");
        //获取设备组
        $.ajax({
            url: "/Schedule/GetCameraPatrolDeviceByGroupId",
            type: "post",
            data: { groupId: group_id },
            datatype: 'json',
            async: false,
            success: function (data) {
                if (data.status == 0 && data.msg != null) {
                    var deviceList = data.msg;
                    if (deviceList == null || deviceList.length < 1) {
                        alert("轮播设备组为空或者无轮切资源编码\n请至视频监控页面进行轮播分组管理");
                        return;
                    }
                    else if (deviceList.length == 1) {
                        videoClassify.StartMonitorLive(rec.ext3, deviceList[0]);  //启动上大屏播放
                    }
                }
                else {
                    alert(data.msg);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("查询轮切设备失败！" + XMLHttpRequest.status + "错误请联系管理员！");
            }
        })

    }


    ////调用地图接口，启动轮切
    //videoClassify.StartMonitorSwitch(rec.ext3, switchCode);
}

//轮切上大屏  旧
//mapSchedule.switchGallery = function (rec) {
//    if (rec.ext1 == null || rec.ext1 == "") {
//        alert("未设置轮切设备组");
//        return;
//    }
//    var group_id = parseInt(rec.ext1);
//    var deviceList = null;
//    if (rec.ext3 == "" || rec.ext3 == null) {
//        alert("未设置轮切屏编码!");
//        return;
//    }
//    //获取设备组
//    $.ajax({
//        url: "/Schedule/GetCameraPatrolDeviceByGroupId",
//        type: "post",
//        data: { groupId: group_id },
//        datatype: 'json',
//        async: false,
//        success: function (data) {
//            if (data.status == 0 && data.msg != null) {
//                var deviceList = data.msg;
//            }
//            else {
//                alert(data.msg);
//            }
//        },
//        error: function (XMLHttpRequest, textStatus, errorThrown) {
//            alert(XMLHttpRequest.status + "错误请联系管理员！");
//        }
//    })
//    if (deviceList == null || deviceList.length < 1) {
//        alert("轮切组未设置设备!");
//        return;
//    }
//    //if (rec.ext5 == "" || rec.ext5 == null) {

//    //}
//    //else {
//    //    // var resource = mapVideo.QuerySwitchResource(rec.ext5);
//    //    mapVideo.DelSwitchResource(rec.ext5);//删除轮切资源编码
//    //}
//    if (rec.ext5 != "" && rec.ext5 != null) {
//        mapVideo.DelSwitchResource(rec.ext5);//删除轮切资源编码
//    }
//    var switchArr = new Array();
//    for (var i = 0; i < deviceList.length;) {
//        var obj = new Object();
//        obj.CameraCode = deviceList[i].device_code;
//        obj.CameraName = deviceList[i].device_name;
//        obj.Interval = rec.ext4;
//        switchArr.push(obj);
//    }
//    //添加轮切资源组，返回轮切资源编码
//    var switchCode = mapVideo.AddSwitchResource(rec.schedule_name, switchArr);
//    //修改数据库轮切资源编码
//    $.ajax({
//        url: "/Schedule/UpdateSwitchCode",
//        type: "post",
//        data: { scheduleId: rec.scheduleId, switchCode: switchCode },
//        datatype: 'json',
//        async: true,
//        success: function (data) {
//            if (data.status == 0 && data.msg != null) {
//            }
//            else {
//                alert(data.msg);
//            }
//        },
//        error: function (XMLHttpRequest, textStatus, errorThrown) {
//            alert(XMLHttpRequest.status + "错误请联系管理员！");
//        }
//    })
//    //调用地图接口，启动轮切
//    videoClassify.StartMonitorSwitch(rec.ext3, switchCode);
//}

//轮巡上大屏
mapSchedule.monitorStartLive = function (rec) {
    if (rec.ext1 == null || rec.ext1 == "") {
        alert("未设置轮巡设备组");
        return;
    }
    var regionId = rec.regionId; //园区ID
    var groupId = parseInt(rec.ext1);   //设备组ID
    mapSchedule.queryGalleryByRegion(regionId);  //获取能快速大屏配置
    mapSchedule.queryDeviceGroup(groupId);       //查询设备组配置
    if (monitorDeviceArr == null || monitorDeviceArr.length < 1) {
        alert("所选设备组内设备为空！");
        return;
    }
    if (fastGalleryArr == null || fastGalleryArr.length < 1) {
        alert("该园区无快速上大屏的屏或大屏未配置！");
        return;
    }
    isRun = false;  //停止旧定时器
    if (monitorDeviceArr.length <= fastGalleryArr.length) {
        //如果设备数小于屏的数量，直接上大屏
        for (var i = 0; i < monitorDeviceArr.length; i++) {
            videoClassify.StartMonitorLive(fastGalleryArr[i], monitorDeviceArr[i]);
        }
    }
    else {
        //设置定时器，启动轮巡
        d = fastGalleryArr.length;
        mapSchedule.monitorGalleryInterval();
    }
}

//上大屏，只将换当前需要换的屏
mapSchedule.monitorGalleryInterval = function () {
    if (isRun) return;  //如果isRun==false；停止循环运行
    videoClassify.StartMonitorLive(fastGalleryArr[m], monitorDeviceArr[d]); //上大屏，只换当前需要换的屏
    m++; d++;
    if (m == fastGalleryArr.length - 1) {
        m = 0;
    }
    if (d == monitorDeviceArr.length - 1) {
        d = 0;
    }
    setTimeout(function () { mapSchedule.monitorGalleryInterval(); }, 10000);
}