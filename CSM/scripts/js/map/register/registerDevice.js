﻿var CURRENT_REGISTER_TYPE = -1;//-1为2D上注册，0为2.5D上注册，1为楼内图注册
var UPDATEANDADDFLAG;//修改和添加标示符
$(function () {
    LoadDeviceListTree();
    videoClassify.initLogin();
    //$("#subsystem_id").change(function () {
    //    if ($("#subsystem_id").val() == "1") {//视频子系统
    //        $("#coverRangeTr").show();
    //        $("#cameraTowardsTr").show();
    //        $("#visualRangeTr").show();
    //        $("#jishiduolu").show();//及时回放和多路视频
    //        $("#daqianglishi").show();//上大墙、历史回放
    //    } else {
    //        $("#coverRangeTr").hide();
    //        $("#cameraTowardsTr").hide();
    //        $("#visualRangeTr").hide();
    //        $("#jishiduolu").hide();//及时回放和多路视频
    //        $("#daqianglishi").hide();//上大墙、历史回放
    //    }
    //})
    $("#device_type").change(function () {
        var device_type = $("#device_type").val();
        if (device_type == 1 || device_type == 2 || device_type == 3 || device_type == 4) {//摄像头
            $("#coverRangeTr").show();
            $("#cameraTowardsTr").show();
            $("#visualRangeTr").show();
            $("#jishiduolu").show();//及时回放和多路视频
            $("#daqianglishi").show();//上大墙、历史回放
        } else {
            $("#coverRangeTr").hide();
            $("#cameraTowardsTr").hide();
            $("#visualRangeTr").hide();
            $("#jishiduolu").hide();//及时回放和多路视频
            $("#daqianglishi").hide();//上大墙、历史回放
        }
    })
    // videoActiveX.Init();//初始登录播放视频平台
})

//加载二维注册的树
function LoadDeviceListTree() {
    $.ajax({
        url: "/Register/Get2DNotRegisterDevice",
        type: "post", //这里是http类型
        data: {},
        dataType: "json", //传回来的数据类型
        async: true,
        success: function (data) {
            if (data.state == 1) {
                alert(data.message);
                return;
            }
            //绑定树形结构的数据源
            $.fn.zTree.init($("#deviceTree"), setting2D, data);
            var treeObj = $.fn.zTree.getZTreeObj("deviceTree");
            treeObj.expandAll(true);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status + "错误请联系管理员！");
        }
    });
}
//加载2.5D注册的树
function LoadDeviceListTree25D() {
    $.ajax({
        url: "/Register/Get2dDeviceToRegister25dDevice",
        type: "post", //这里是http类型
        data: { industryId: IndustryId, regionID: regionID },
        dataType: "json", //传回来的数据类型
        async: true,
        success: function (data) {
            if (data.state == 1) {
                alert(data.message);
                return;
            }
            //绑定树形结构的数据源
            $.fn.zTree.init($("#deviceTree"), setting25D, data);
            var treeObj = $.fn.zTree.getZTreeObj("deviceTree");
            treeObj.expandAll(true);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status + "错误请联系管理员！");
        }
    });
}
//加载楼内图的树
function loadBuildingTree() {
    $.ajax({
        url: "/Register/GetBuildingTree",
        type: "post", //这里是http类型
        data: { industryId: IndustryId, regionID: regionID },
        dataType: "json", //传回来的数据类型
        async: true,
        success: function (data) {
            if (data.state == 1) {
                alert(data.message);
                return;
            }
            //绑定树形结构的数据源
            $.fn.zTree.init($("#floorTree"), settingFloor, data);
            var treeObj = $.fn.zTree.getZTreeObj("floorTree");
            treeObj.expandAll(true);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status + "错误请联系管理员！");
        }
    });
}



//楼内图的设备注册的树的配置
var settingFloor = {
    edit: {
        enable: false
    },
    view: {
        dblClickExpand: false,
        //addDiyDom: addDiyDom
    },
    data: {
        keep: {
            parent: true,
            leaf: true
        },
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "pId",
            rootPId: -1
        }
    },
    callback: {
        onDblClick: clickTreeNodeBuildingFloor
    }
}
//二维设备注册的树的配置
var setting2D = {
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
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
            idKey: "ip",
            pIdKey: "pip",
            rootPId: -1
        }
    },
    callback: {
        onDblClick: clickTreeNode2D
    }
}
//2.5D设备注册的树的配置
var setting25D = {
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },
    view: {
        dblClickExpand: false
    },
    data: {
        key: {
            name: "device_name",
            title: "device_name"
        },
        keep: {
            parent: true,
            leaf: true
        },
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "pid",
            rootPId: -1
        }
    },
    callback: {
        onDblClick: clickTreeNode25D
    }
}



//楼内图设备的双击事件floor_src_2d = "images/map/buildingImage/教二楼的楼房/F1"
function clickTreeNodeBuildingFloor(event, treeId, treeNode) {
    if (!treeNode) {
        return null;
    }
    //xx子系统（文件夹）
    if (treeNode.id == 0) {
        return;
    }
    if (treeNode.pId == -1) {
        return;
    }
    //treeNodeDblClick(treeNode.id, treeNode.floor_src_2d, treeNode.point1, treeNode.point2);
    treeNodeDblClick(treeNode);

}
//2D树的双击事件
function clickTreeNode2D(event, treeId, treeNode) {
    if (!treeNode) {
        return null;
    }
    //xx子系统（文件夹）
    if (treeNode.id == 0) {
        return;
    }
    addDeviceDialogSet(treeNode);
}
//25D树的双击事件
function clickTreeNode25D(event, treeId, treeNode) {
    if (!treeNode) {
        return null;
    }
    //xx子系统（文件夹）
    if (treeNode.id == 0) {
        return;
    }
    if (treeNode.pid == 0) {
        AddMoveMarker(treeNode.id);
    }
}
//注册2.5D的设备
function registerDevice25D(id, local_longitude, local_latitude) {
    var result = false;
    $.ajax({
        url: "/Register/registerDevice25D",
        data: { id: id, local_longitude: local_longitude, local_latitude: local_latitude },
        type: "post",
        datatype: "json",
        async: false,
        success: function (data) {
            if (data.state == 1) {
                alert(data.message);
                return;
            }
            if (data) {
                alert("注册成功")
                result = data;
            } else {
                alert("注册失败")
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status + "错误请联系管理员！");
        }
    });
    return result;
}
//添加设备窗体赋值
function addDeviceDialogSet(treeNode) {
    //xx子系统下的设备

    //其他设备
    if (treeNode.id == -2) {
        $("#deviceTempID").val(0);//设备临时表id
        $("#device_name").val("");//设备名称
        $("#device_name").attr("disabled", false);//设置设备名称输入框可编辑
        $("#subsystem_id").attr("disabled", false);//子系统
        $("#device_type").attr("disabled", false);//设备类型
        $("#device_code").val("");//设备编码
        $("#device_code").attr("disabled", false);//设备编码输入框可编辑
        AddMoveMarker(treeNode.id);//地图上打点
    } else {
        if (treeNode.pId != -1) {
            AddMoveMarker(treeNode.id); //左侧树双击后调用这个方法在地图上标注marker(地图js中的方法)
            $("#deviceTempID").val(treeNode.id);//设备临时表id
            $("#device_name").val(treeNode.name);//设备名称
            $("#device_name").attr("disabled", true);//设置设备名称输入框不可编辑
            var device_type = document.getElementById('device_type');//设备类型
            for (var i = 0; i < device_type.length; i++) {
                if (device_type[i].value == treeNode.device_type) {
                    device_type[i].selected = true;
                    break;
                }
            }
            var subsystem = document.getElementById('subsystem_id');//子系统
            for (var i = 0; i < subsystem.length; i++) {
                if (subsystem[i].value == treeNode.subsystem_id) {
                    subsystem[i].selected = true;
                    break;
                }
            }
            $("#subsystem_id").attr("disabled", true);//子系统
            $("#device_type").attr("disabled", false);//设备类型
            $("#device_code").val(treeNode.device_code);//设备编码
            $("#device_code").attr("disabled", true);//设备编码禁止输入
            if (treeNode.device_type < 5) {//子系统为视频子系统时显示覆盖范围填写框
                $("#coverRangeTr").show();
                $("#cameraTowardsTr").show();
                $("#visualRangeTr").show();
            }
            else if (treeNode.device_type >= 5) {
                $("#coverRangeTr").hide();
                $("#cameraTowardsTr").hide();
                $("#visualRangeTr").hide();
            }
        }
    }
}
//显示添加弹窗
function showAddDeviceDialog() {
    $("#deviceID").val(0);
    //让弹出框的div显示出来
    if ($("#device_type").val() < 5) {
        $("#coverRangeTr").show();//覆盖角度
        $("#cameraTowardsTr").show();//设备朝向
        $("#visualRangeTr").show();//覆盖半径
        $("#jishiduolu").show();//及时回放和多路视频
        $("#daqianglishi").show();//上大墙、历史回放
    }
    UPDATEANDADDFLAG = "ADD";
    //$("#deviceRegisterPopup").show();
    $("#deviceRegisterPopup").dialog('open');
    $("#deviceRegisterPopup").show();
    $("#device_name")[0].focus();
}
//弹出修改窗体并赋值
function showUpdateDeviceDialog(data) {
    $("#deviceID").val(data.id);//设备id，修改时使用
    $("#device_name").val(data.device_name);//设备名称
    $("#device_name")[0].focus();
    $("#device_code").val(data.device_code)//设备编号
    $("#is_inbuilding").val(data.is_inbuilding);
    if (data.device_type < 5) {
        $("#device_code").attr("disabled", true);//设备编码禁止输入
    }
    var device_type = $('#device_type option');//设备类型
    for (var i = 0; i < device_type.length; i++) {
        if (device_type[i].value == data.device_type) {
            device_type[i].selected = true;
        }
    }
    var subsystem = $('#subsystem_id option');//子系统
    for (var i = 0; i < subsystem.length; i++) {
        if (subsystem[i].value == data.subsystem_id) {
            subsystem[i].selected = true;
        }
    }
    $("#subsystem_id").attr("disabled", true);//子系统
    $("#device_type").attr("disabled", true);//设备类型
    //复合设备
    var is_parts = document.getElementsByName("is_parts");
    var compoundDevice = $("#compoundDevice");
    if (data.is_parts < 1) {
        //隐藏复合设备下拉框
        closeCompoundDiv();
        for (var i = 0; i < is_parts.length; i++) {
            if (is_parts[i].value == data.is_parts) {
                is_parts[i].checked = true;
            }
        }
    } else {
        //选中关联符合设备
        is_parts[2].checked = true;
        //显示复合设备下拉框
        showCompoundDiv();
        //默认选中下拉框
        $("#compoundDevice").val(data.is_parts);
    }
    //设备状态
    $("#device_status").val(data.device_status);
    //坐标
    $("#lonLat").val(data.latitude + "," + data.longitude);//2D的
    $("#lonLat25D").val(data.local_latitude + "," + data.local_longitude);//25D的
    if (data.device_type < 5) {//摄像头
        //显示覆盖角度等start
        $("#coverRangeTr").show();//覆盖角度
        $("#cameraTowardsTr").show();//设备朝向
        $("#visualRangeTr").show();//覆盖半径
        $("#jishiduolu").show();//及时回放和多路视频
        $("#daqianglishi").show();//上大墙、历史回放
        //显示覆盖角度end
        $("#cover_range").val(data.cover_range);//覆盖角度
        $("#camera_towards").val(data.camera_towards);//覆盖朝向
        $("#visual_range").val(data.visual_range);//覆盖半径
        //及时回访
        if ($("#jishihuifang").val() == data.ext1) {
            document.getElementById("jishihuifang").checked = true;
        }
        //多路播放
        if ($("#duolubofang").val() == data.ext2) {
            document.getElementById("duolubofang").checked = true;
        }
        //上大墙
        if ($("#shangdaqiang").val() == data.ext3) {
            document.getElementById("shangdaqiang").checked = true;
        }
        //历史回放
        if ($("#lishihuifang").val() == data.ext4) {
            document.getElementById("lishihuifang").checked = true;
        }
    } else {
        //隐藏覆盖角度等start
        $("#coverRangeTr").hide();//覆盖角度
        $("#cameraTowardsTr").hide();//设备朝向
        $("#visualRangeTr").hide();//覆盖半径
        $("#jishiduolu").hide();//及时回放和多路视频
        $("#daqianglishi").hide();//上大墙、历史回放
        //隐藏覆盖角度end
    }
    $("#deviceTempID").val(0);//设备临时表id
    UPDATEANDADDFLAG = "UPDATE";
    $("#deviceRegisterPopup").dialog('open');
    $("#deviceRegisterPopup").show();
}
//关闭弹窗
function hideRegisterPopup() {
    if (UPDATEANDADDFLAG == "ADD") {
        RemoveMoveMarker();//清楚地图上的点位
    } else if (UPDATEANDADDFLAG == "UPDATE") {
        cancelUpdate();
    }
    //$("#deviceRegisterPopup").hide();
    $("#deviceRegisterPopup").dialog('close');
}
//显示复合设备下拉框
function showCompoundDiv() {
    $("#compoundDevice").show();
}
//隐藏复合设备下拉框
function closeCompoundDiv() {
    $("#compoundDevice").hide();
}
//设备注册提交
function AddDeviceCommit() {
    var deviceID = $("#deviceID").val();//设备id，修改时使用
    var device_name = $("#device_name").val();//设备名称
    if (device_name == "") {
        alert("请输入设备名称");
        return;
    }
    var device_code = $("#device_code").val();//设备编码
    var device_type = $("#device_type").val();//设备类型
    if (device_type == "") {
        alert("请选择设备类型");
        return;
    }
    var subsystem_id = $("#subsystem_id").val();//子系统id
    if (subsystem_id == "") {
        alert("请选择子系统");
        return;
    }
    var device_status = $("#device_status").val();//设备状态
    if (device_status == "") {
        alert("请选择设备状态");
        return;
    }
    var cover_range = $("#cover_range").val();//覆盖角度
    if (cover_range == "") {
        cover_range = 0;
    }
    var camera_towards = $("#camera_towards").val();//设备朝向
    if (camera_towards == "") {
        camera_towards = 0;
    }
    var visual_range = $("#visual_range").val();//覆盖半径
    if (visual_range == "") {
        visual_range = 0;
    }
    var is_inbuilding = $("#is_inbuilding").val();//是否楼内
    var lonLat = $("#lonLat").val();//2Dx,y坐标
    var lonLat25D = $("#lonLat25D").val();//25D的坐标
    //复合设备
    var isParts = $('input[name="is_parts"]:checked').val();
    if (isParts == "") {
        alert("请选择是否复合设备");
        return;
    } else if (isParts == "0") {//复合设备部件
        isParts = $("#compoundDevice").val();
        if (isParts == "" || isParts == undefined) {
            alert("请选择复合设备部件");
        }
    }
    //园区编号
    //var regionID = regionID;
    //if (CURRENT_REGISTER_TYPE == -1) {//2D
    //    regionID = regionID;
    //} else if (CURRENT_REGISTER_TYPE == 0) {//2.5D
    //    regionID = regionID
    //} else {//楼内
    //    regionID = regionID;
    //}
    var jishihuifang = 0;
    if (document.getElementById("jishihuifang").checked == true) {//选中及时回访
        jishihuifang = 1;
    }
    var duolubofang = 0;
    if (document.getElementById("duolubofang").checked == true) {//选中多路回放
        duolubofang = 1;
    }
    var shangdaqiang = 0;
    if (document.getElementById("shangdaqiang").checked == true) {//选中上大墙
        shangdaqiang = 1;
    }
    var lishihuifang = 0;
    if (document.getElementById("lishihuifang").checked == true) {//选中历史回放
        lishihuifang = 1;
    }
    var deviceTempID = $("#deviceTempID").val();
    //房间号
    //区域编号
    if (UPDATEANDADDFLAG == "ADD") {
        $.ajax({
            url: "/Register/AddDevice2D",
            data: { device_name: device_name, device_code: device_code, device_type: device_type, subsystem_id: subsystem_id, device_status: device_status, cover_range: cover_range, camera_towards: camera_towards, visual_range: visual_range, is_inbuilding: is_inbuilding, lonLat: lonLat, isParts: isParts, regionID: regionID, jishihuifang: jishihuifang, duolubofang: duolubofang, shangdaqiang: shangdaqiang, lishihuifang: lishihuifang, deviceTempID: deviceTempID, industryId: IndustryId },
            type: "post",
            datatype: "json",
            async: true,
            success: function (data) {
                if (data.state == 1) {
                    alert(data.message);
                    return;
                } else if (data.state == 2) {
                    alert(data.message);
                    return;
                }
                var newOptions = {};
                newOptions.device_code = data.device_code; //设备编号
                newOptions.is_parts = isParts; //复合设备
                newOptions.device_name = device_name; //设备名称
                newOptions.device_type = device_type; //设备类型
                newOptions.subsystem_id = subsystem_id; //子系统编号
                newOptions.longitude = lonLat.split(',')[1]; //经度
                newOptions.latitude = lonLat.split(',')[0]; // 纬度
                newOptions.register_time = ""; //注册时间
                newOptions.search_code = ""; //设备搜索缩写
                //newOptions.local_longitude = lonLat25D.split(',')[1];//本地X轴（经度）
                //newOptions.local_latitude = lonLat25D.split(',')[0];//本地Y轴（纬度）
                newOptions.device_status = device_status;//设备状态
                newOptions.update_status_time = "";//状态修改时间
                newOptions.cover_range = cover_range;//覆盖角度
                newOptions.camera_towards = camera_towards;//设备朝向
                newOptions.visual_range = visual_range;//覆盖半径
                newOptions.asset_code = "";//资产编号
                newOptions.org_id = "";//所属部门
                newOptions.manufactor = "";//厂家
                newOptions.asset_model = "";//型号
                newOptions.create_time = "";//出厂日期
                newOptions.guarantee_time = "";//保修期
                newOptions.asset_status = "";//资产状态
                newOptions.asset_ip = "";//ip地址
                newOptions.port = "";//端口
                newOptions.mac_code = "";//mac地址
                newOptions.serial_number = "";//序列号
                newOptions.manager_id = "";//负责人ID
                newOptions.is_inbuilding = is_inbuilding;//是否在楼内
                newOptions.room_id = "";//房间号
                newOptions.region_id = regionID;//园区编号
                newOptions.area_id = "";//区域编号
                newOptions.ext1 = jishihuifang;//及时回放
                newOptions.ext2 = duolubofang;//多路播放
                newOptions.ext3 = shangdaqiang;//上大墙
                newOptions.ext3 = lishihuifang;//历史回放
                newOptions.id = data.id;//主键
                SetMarkerIcon(data.iconPath, newOptions);//替换图标
                alert("注册成功");
                LoadDeviceListTree();//重新加载树
                hideRegisterPopup()//隐藏弹窗,移除地图上注册点
                //复合设备本身
                if (newOptions.is_parts == -1) {
                    $("#compoundDevice").append("<option value='" + data.id + "'>" + device_name + "</option>");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.status + "错误请联系管理员！");
            }
        })
    } else if (UPDATEANDADDFLAG == "UPDATE") {
        $.ajax({
            url: "/Register/UpdateDevice2D",
            data: { deviceID: deviceID, device_name: device_name, device_code: device_code, device_type: device_type, subsystem_id: subsystem_id, device_status: device_status, cover_range: cover_range, camera_towards: camera_towards, visual_range: visual_range, is_inbuilding: is_inbuilding, lonLat: lonLat, lonLat25D: lonLat25D, isParts: isParts, regionID: regionID, jishihuifang: jishihuifang, duolubofang: duolubofang, shangdaqiang: shangdaqiang, lishihuifang: lishihuifang, industryId: IndustryId },
            type: "post",
            datatype: "json",
            async: true,
            success: function (data) {
                if (data.state == 1) {
                    alert(data.message);
                    return;
                }
                var newOptions = {};
                newOptions.device_code = device_code; //设备编号
                newOptions.is_parts = isParts; //复合设备
                newOptions.device_name = device_name; //设备名称
                newOptions.device_type = device_type; //设备类型
                newOptions.subsystem_id = subsystem_id; //子系统编号
                newOptions.longitude = lonLat.split(',')[1]; //经度
                newOptions.latitude = lonLat.split(',')[0]; // 纬度
                newOptions.register_time = ""; //注册时间
                newOptions.search_code = ""; //设备搜索缩写
                newOptions.local_longitude = lonLat25D.split(',')[1];//本地X轴（经度）
                newOptions.local_latitude = lonLat25D.split(',')[0];//本地Y轴（纬度）
                newOptions.device_status = device_status;//设备状态
                newOptions.update_status_time = "";//状态修改时间
                newOptions.cover_range = cover_range;//覆盖角度
                newOptions.camera_towards = camera_towards;//设备朝向
                newOptions.visual_range = visual_range;//覆盖半径
                newOptions.asset_code = "";//资产编号
                newOptions.org_id = "";//所属部门
                newOptions.manufactor = "";//厂家
                newOptions.asset_model = "";//型号
                newOptions.create_time = "";//出厂日期
                newOptions.guarantee_time = "";//保修期
                newOptions.asset_status = "";//资产状态
                newOptions.asset_ip = "";//ip地址
                newOptions.port = "";//端口
                newOptions.mac_code = "";//mac地址
                newOptions.serial_number = "";//序列号
                newOptions.manager_id = "";//负责人ID
                newOptions.is_inbuilding = is_inbuilding;//是否在楼内
                newOptions.room_id = "";//房间号
                newOptions.region_id = regionID;//园区编号
                newOptions.area_id = "";//区域编号
                newOptions.ext1 = jishihuifang;//及时回放
                newOptions.ext2 = duolubofang;//多路播放
                newOptions.ext3 = shangdaqiang;//上大墙
                newOptions.ext3 = lishihuifang;//历史回放
                newOptions.id = deviceID;
                updateConfirm(newOptions);
                alert("修改成功");
                //$("#deviceRegisterPopup").hide();
                $("#deviceRegisterPopup").dialog('close');
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.status + "错误请联系管理员！");
            }
        })
    }

}
//删除设备
function deleteDevice(code) {
    var result = false;
    $.ajax({
        url: "/Register/DeleteDeviceByCode",
        data: { code: code },
        type: "post",
        datatype: "json",
        async: false,
        success: function (data) {
            if (data.state == 1) {
                alert(data.message);
                return;
            }
            result = data;
            if (data) {
                alert("删除成功");
                //LoadDeviceListTree();
                getUnRegisterDeviceList();
            } else {
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status + "错误请联系管理员！");
        }
    })
    return result;
}
function getUnRegisterDeviceList() {
    switch (definedVideoPlatform) {
        case 1:
            //获取宇视摄像机
            for (var i = 1; i < 5; i++) {
                pageStart = 0;
                getUnRegisterDeviceListUnivew(1001, i);
            }
            //获取监视器
            getUnRegisterDeviceListUnivew(14, 0);
            break;
        case 2:
            break;
        case 3:
            break;
    }
    LoadDeviceListTree();
}

//更新设备列表
var pageStart = 0;
function getUnRegisterDeviceListUnivew(resType, resSubType) {
    //循环4个子资源类型（固定、云台）
    var pageSize = 200;
    var strxml = videoClassify.QueryOrgResList(resType, resSubType, pageStart, pageSize);
    if (strxml == null || strxml == "") {
        alert("查询资源失败")
        return;
    }
    var cameraListObj = videoClassify.LoadXML(strxml);
    if (!cameraListObj) {
        return;
    }
    //替换<括号（前台往后台传串字符安全问题）
    var vmdata = cameraListObj.documentElement.xml.replace(/</g, '&lt;');
    vmdata = vmdata.replace(/=/g, '&ld;');
    var regionId = $.cookie("mainControlRegionId");
    $.ajax({
        url: "/Register/UpdateUnRegisterDevice",
        data: { strXml: vmdata, serverIP: serverIP, regionId: regionId },
        type: "post",
        datatype: "json",
        async: true,
        success: function (data) {
            if (data.status == 1) {
                alert("更新宇视设备列表错误:"+data.msg);
                return;
            } else {
                var count = Number(data.msg);
                if (count == 200) {
                    pageStart += 200;
                    getUnRegisterDeviceListUnivew(resType, resSubType);
                } 
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("更新宇视设备列表出现"+XMLHttpRequest.status + "错误请联系管理员！");
        }
    });
}
