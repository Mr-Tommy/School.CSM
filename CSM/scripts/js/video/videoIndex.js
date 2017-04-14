﻿
$(function () {
    //加载树结构
    //getCameraTree();
    getMonitoringCameraTree();
    //初始化视频控件
    videoClassify.initLogin();
    //设置控件窗格数
    videoClassify.ChangeWindow(9);
    //截取url获取设备组id参数
    executeLunxun();
})
//离开页面之前事件
window.onbeforeunload = function () {
    var type = getUrlParam("type");
    var groupid = getUrlParam("groupId");
    if (type != null && type != "") {
        videoClassify.StopFrameSwitch(1);
    }
}
//执行轮播
function executeLunxun() {
    var type = getUrlParam("type");
    var groupid = getUrlParam("groupId");
    if (type != null && type != "") {
        $("#line").removeClass("col-xs-6 active").addClass("col-xs-6");
        $("#lineSwitch").removeClass("col-xs-6").addClass("col-xs-6 active");
        $("#DeviceTreeDiv").hide();
        $("#definedDeviceTreeDiv").show();
        getCameraTree();
        //videoClassify.StopFrameSwitch(1);
        playDeviceGroup(type, groupid);
    } else {
        //videoClassify.StopFrameSwitch(1);
    }
}
//截取url
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
var switchDevice;
//播放视频组
function playDeviceGroup(type, groupId) {
    var treeObj = $.fn.zTree.getZTreeObj("definedDeviceTree");
    var sNodes = treeObj.getNodes();
    var deviceData;
    for (var i = 0; i < sNodes[0].children.length; i++) {
        if (sNodes[0].children[i].id == groupId) {
            deviceData = sNodes[0].children[i];
        }
    }
    if (deviceData != null) {
        //轮切播放（一块屏上播放）
        if (type == "switch") {
            if (deviceData.children != null) {
                if (deviceData.children.length > 1) {
                    videoClassify.stopOnePlayVideo(1);
                    videoClassify.StartFrameSwitch(1, deviceData.resSwitchCode);
                }
                else {
                    videoClassify.stopOnePlayVideo(1);
                    videoClassify.onePlayVideo(1, deviceData.children[0].device_code);
                }
            }

        } else {//多屏轮播
            if (deviceData.children != null) {
                //小于10个设备则每个屏播一个视频
                if (deviceData.children.length < 10) {
                    for (var i = 0; i < deviceData.children.length; i++) {
                        mapVideo.stopOnePlayVideo(i + 1);
                        videoClassify.onePlayVideo(i + 1, deviceData.children[i].device_code);
                    }
                } else {//轮询播放(1-9)为一组剩余的数量再上
                    switchDevice = deviceData.children;
                    lunxunPlay();
                }
            }
        }
    }
}
var frameNumFlag = 1;
var setTimeOutFlag = true;
function lunxunPlay() {
    if (!setTimeOutFlag) {
        return;
    }
    var zheng = Math.floor(switchDevice.length / 9);
    var yu = switchDevice.length % 9;
    var num = frameNumFlag * 9;
    var devices = [];
    if (frameNumFlag == zheng + 1) {
        for (var i = num - 9; i < num - 9 + yu; i++) {
            devices.push(switchDevice[i]);
        }
    } else {
        for (var i = num - 9; i < num; i++) {
            devices.push(switchDevice[i]);
        }
    }
    for (var i = 0; i < devices.length; i++) {
        videoClassify.stopOnePlayVideo(i + 1);
        videoClassify.onePlayVideo(i + 1, devices[i].device_code);
    }

    frameNumFlag += 1;
    if (frameNumFlag > zheng + 1) {
        frameNumFlag = 1;
    }
    setTimeout(lunxunPlay, 10000);
}
//获取自定义设备分组树结构
function getCameraTree() {
    var regionId = $.cookie("mainControlRegionId");
    $.ajax({
        url: "/Video/GetDefinedGroupTree",
        type: "post", //这里是http类型
        data: { regionId: regionId },
        dataType: "json", //传回来的数据类型
        async: false,
        success: function (data) {
            if (data.status == 1) {
                alert(data.msg);
            } else {
                //绑定树形结构的数据源
                $.fn.zTree.init($("#definedDeviceTree"), setting, data.msg);
                var treeObj = $.fn.zTree.getZTreeObj("definedDeviceTree");
                treeObj.expandAll(true);
                var sNodes = treeObj.getNodes();
                for (var i = 0; i < sNodes[0].children.length; i++) {
                    if (sNodes[0].children[i].pid == -1) {
                        sNodes[0].children[i].isParent = true;
                        sNodes[0].children[i].open = true;
                        treeObj.updateNode(sNodes[0].children[i]);
                    }
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status + "错误请联系管理员！");
        }
    });
}

var setting = {
    edit: {
        enable: false
    },
    view: {
        dblClickExpand: false
    },
    data: {
        keep: {
            parent: true,
            leaf: true
        },
        simpleData: {
            enable: true,
            idKey: "sid",
            pIdKey: "pid",
            rootPId: -2
        }
    },
    callback: {
        onDblClick: playVideo
    }
}
//获取监控平台摄像头列表
function getMonitoringCameraTree() {
    var regionId = $.cookie("mainControlRegionId");
    $.ajax({
        url: "/DeviceInfo/GetDeviceGroupInfo",
        type: "post", //这里是http类型
        data: { regionId: regionId, pageType: 1 },
        dataType: "json", //传回来的数据类型
        async: true,
        success: function (data) {
            if (data.status == 1) {
                alert(data.msg);
                return;
            } else {
                //绑定树形结构的数据源
                $.fn.zTree.init($("#DeviceTree"), setting, data.msg);
                var treeObj = $.fn.zTree.getZTreeObj("DeviceTree");
                treeObj.expandAll(true);
                var sNodes = treeObj.getNodes();
                for (var i = 0; i < sNodes.length; i++) {
                    if (sNodes[i].pid == -1) {
                        sNodes[i].isParent = true;
                        sNodes[i].open = true;
                        treeObj.updateNode(sNodes[i]);
                    }
                }
            }
        }
    });
}


var settingMonitoring = {
    edit: {
        enable: false
    },
    //view: {
    //    dblClickExpand: false,
    //    addDiyDom: addDiyDom
    //},
    data: {
        keep: {
            parent: true,
            leaf: true
        },
        key: {
            name: "devicName"
        },
        simpleData: {
            enable: true,
            idKey: "sid",
            pIdKey: "orgCode",
            rootPId: "rootid"
        }
    },
    callback: {
        onDblClick: playVideo2
    }
}
function playVideo2(event, treeId, treeNode) {
    //判断是否是子节点
    //if (treeNode.pid == -1) {
    //    return;
    //}
    setTimeOutFlag = false;
    if (treeNode.devicCode != "") {
        var windowNum = videoClassify.GetFocusFrame();
        videoClassify.stopOnePlayVideo(windowNum);
        videoClassify.onePlayVideo(windowNum, treeNode.devicCode);
    }
}
function playVideo(event, treeId, treeNode) {
    setTimeOutFlag = false;
    //判断是否是子节点
    if (treeNode == null) {
        return;
    }
    if (treeNode.pid == -1) {
        return;
    }
    if (treeNode.device_code != "") {
        var windowNum = videoClassify.GetFocusFrame();
        videoClassify.onePlayVideo(windowNum, treeNode.device_code);
    }
}