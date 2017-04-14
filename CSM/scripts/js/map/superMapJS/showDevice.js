﻿var markerLayerArray = [];
var currentClickMarker = null;

$(document).ready(function () {
    // setTimeout("showDevice()", "100000");
    //将工具栏的字标签设置为不冒泡，不设置的话，点击子标签，子标签的单击事件发生后，紧接着后执行一遍它的父标签的单击事件
    $("#leftFloat li ul li").click(function (event) {
        event.stopPropagation();
    })

});

//加载全部的设备
function showDevice() {
    for (var i = 0; i < AllDeviceInfo.length; i++) {
        var deviceObj = AllDeviceInfo[i];
        //只有下面三个属性提取了，才能创建marker
        var latitude = deviceObj.latitude;
        var longitude = deviceObj.longitude;
        var device_type = deviceObj.device_type;
        var normal_image = deviceObj.normal_image;
        var error_image = deviceObj.error_image;
        var device_status = deviceObj.device_status;
        var enable = deviceObj.enabled;
        var is_inbuilding = deviceObj.is_inbuilding;

        var id = deviceObj.id;
        var visual_range = deviceObj.visual_range;
        var cover_range = deviceObj.cover_range;
        var camera_towards = deviceObj.camera_towards;
        if (normal_image && is_inbuilding == -1 && enable == 1) {//-1为楼外的设备
            var position = lonLat2Mercator(Number(longitude), Number(latitude));

            //设置正常的图标
            var size = new SuperMap.Size(15.15, 23);
            var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 2)); //'../../Content/Map/LeaFletMap/Theme/3D_icon/register.png'
            var stateImg = null;
            if (device_status == 1) {
                stateImg = normal_image;
            }
            else {
                stateImg = error_image;
            }
            var icon = new SuperMap.Icon(stateImg, size, offset);
            //icon.imageDiv.text = deviceObj.device_name;
            //icon.imageDiv.title = deviceObj.device_name;


            var deviceMarker = new SuperMap.Marker(new SuperMap.LonLat(position.x, position.y), icon);

            //给marker赋属性
            deviceMarker.id = deviceObj.id;//主键
            deviceMarker.device_code = deviceObj.device_code; //设备编号
            deviceMarker.is_parts = deviceObj.is_parts; //复合设备
            deviceMarker.device_name = deviceObj.device_name; //设备名称
            deviceMarker.device_type = deviceObj.device_type; //设备类型
            deviceMarker.subsystem_id = deviceObj.subsystem_id; //子系统编号
            deviceMarker.longitude = position.x; //经度
            deviceMarker.latitude = position.y; // 纬度
            deviceMarker.register_time = deviceObj.register_time; //注册时间
            deviceMarker.search_code = deviceObj.search_code; //设备搜索缩写
            deviceMarker.local_longitude = supermap25Dmultiple - Number(deviceObj.local_longitude) * supermap25Dhigh;//本地X轴（经度）
            deviceMarker.local_latitude = Number(deviceObj.local_latitude) * supermap25Dhigh;//本地Y轴（纬度）
            deviceMarker.device_status = deviceObj.device_status;//设备状态
            deviceMarker.update_status_time = deviceObj.update_status_time;//状态修改时间
            deviceMarker.cover_range = deviceObj.cover_range;//覆盖角度
            deviceMarker.camera_towards = deviceObj.camera_towards;//设备朝向
            deviceMarker.visual_range = deviceObj.visual_range;//覆盖半径
            deviceMarker.asset_code = deviceObj.asset_code;//资产编号
            deviceMarker.org_id = deviceObj.org_id;//所属部门
            deviceMarker.manufactor = deviceObj.manufactor;//厂家
            deviceMarker.asset_model = deviceObj.asset_model;//型号
            deviceMarker.create_time = deviceObj.create_time;//出厂日期
            deviceMarker.guarantee_time = deviceObj.guarantee_time;//保修期
            deviceMarker.asset_status = deviceObj.asset_status;//资产状态
            deviceMarker.asset_ip = deviceObj.asset_ip;//ip地址
            deviceMarker.port = deviceObj.port;//端口
            deviceMarker.mac_code = deviceObj.mac_code;//mac地址
            deviceMarker.serial_number = deviceObj.serial_number;//序列号
            deviceMarker.manager_id = deviceObj.manager_id;//负责人ID
            deviceMarker.is_inbuilding = deviceObj.is_inbuilding;//是否在楼内
            deviceMarker.room_id = deviceObj.room_id;//房间号
            deviceMarker.region_id = deviceObj.region_id;//园区编号
            deviceMarker.area_id = deviceObj.area_id;//区域编号

            deviceMarker.normal_image = deviceObj.normal_image;
            deviceMarker.error_image = deviceObj.error_image;
            deviceMarker.flash_image = deviceObj.flash_image;
            deviceMarker.popup_image = deviceObj.popup_image;
            deviceMarker.defined_device_typeid = deviceObj.defined_device_typeid;
            deviceMarker.pid = deviceObj.pid;

            if (device_type == 1 || device_type == 2 || device_type == 3 || device_type == 4) {
                var semiCircle = createSemiCircle(position, visual_range, cover_range, camera_towards);
                if (semiCircle) {
                    deviceMarker.semiCircle = semiCircle;
                    //semiCircleLayer.addFeatures(deviceMarker.semiCircle);
                }
                else if (!semiCircle) {
                    deviceMarker.semiCircle = null;
                }

                deviceMarker.events.on({
                    "click": addVedioPopup,
                    "rightclick": showContextMenuPopup,
                    "mousemove": function () {
                        this.icon.imageDiv.title = this.device_name;
                        this.icon.imageDiv.text = this.device_name;
                    },
                    "scope": deviceMarker
                });
            }
            else if (device_type > 4) {
                deviceMarker.events.on({
                    "click": deviceMarkerClick,
                    "rightclick": showContextMenuPopup,
                    "mousemove": function () {
                        this.icon.imageDiv.title = this.device_name;
                        this.icon.imageDiv.text = this.device_name;
                    },
                    "scope": deviceMarker
                });
            }
            //deviceMarker.events.on({
            //    "rightclick": showContextMenuPopup,
            //    "scope": deviceMarker
            //});
            //deviceMarker.events.on({
            //    "mousemove": function () {
            //        this.icon.imageDiv.title = this.device_name;
            //        this.icon.imageDiv.text = this.device_name;
            //    },
            //    "scope": deviceMarker
            //});

            //csm.vectorMarker.addMarker(deviceMarker);
            var markerLayer = getDeviceFeatureGroup(device_type, deviceMarker.defined_device_typeid, deviceMarker.pid);
            markerLayer.addMarker(deviceMarker);
        }
    }
}
//设备工具栏的单击事件
function deviceToolClick2(id) {
    //获取页面地图容器的div：mapContainer的自定义类型currentMapType的值,1为2D，2为2.5D，3为楼内图
    var currentMapType = $("#mapContainer").attr("currentMapType");
    //if (currentMapType == 1 || currentMapType == 2) {//主图上的设备
    //    var myLayerGroup = deviceLayerGroup;//2D图的layerGroup，在本js中
    //}
    //if (currentMapType == 3) {//楼内图上的设备
    //    var myLayerGroup = floorDeviceLayerGroup;//楼内图layerGroup，在楼内图的js中
    //}
    var isLayerChange = false;//判断这次工具栏的点击是否有图层的显示和隐藏

    for (var i = 0; i < markerLayerArray.length; i++) {
        var layer = markerLayerArray[i];
        if (layer.userDefined != id && layer.parentID == id) {//点击设备为父设备
            if (layer.show == true) {
                csm.mapContainer.removeLayer(layer);
                layer.show = false;
                var unactiveUrl = $("#" + id).attr("unactive_image");
                $("#" + id).css({
                    "background-image": "url(" + unactiveUrl + ")"
                });
            }
            else if (layer.show == false) {
                csm.mapContainer.addLayer(layer);
                layer.show = true;
                var activeUrl = $("#" + id).attr("active_image");
                $("#" + id).css({
                    "background-image": "url(" + activeUrl + ")"
                });
            }
            isLayerChange = true;
        }
        if (layer.userDefined == id && layer.parentID == 0) {//父设备本身为子设备
            if (layer.show == true) {
                csm.mapContainer.removeLayer(layer);
                layer.show = false;
                var unactiveUrl = $("#" + id).attr("unactive_image");
                $("#" + id).css({
                    "background-image": "url(" + unactiveUrl + ")"
                });
            }
            else if (layer.show == false) {
                csm.mapContainer.addLayer(layer);
                featureGroup.show = true;
                var activeUrl = $("#" + id).attr("active_image");
                $("#" + id).css({
                    "background-image": "url(" + activeUrl + ")"
                });
            }
            isLayerChange = true;
        }
        if (layer.userDefined == id && layer.parentID > 0) {//点击子设备
            if (layer.show == true) {
                csm.mapContainer.removeLayer(layer);
                layer.show = false;
                var unactiveUrl = $("#" + id).attr("unactive_image");
                $("#" + id).css({
                    "background-image": "url(" + unactiveUrl + ")"
                });
            }
            else if (layer.show == false) {
                csm.mapContainer.addLayer(layer);
                layer.show = true;
                var activeUrl = $("#" + id).attr("active_image");
                $("#" + id).css({
                    "background-image": "url(" + activeUrl + ")"
                });
            }
            isLayerChange = true;
        }
    }

    //当地图上没有图层发生显隐性时候，工具栏的图标也发生变化
    if (isLayerChange == false) {
        var li_img = $("#" + id).css("background-image");
        if (li_img.indexOf('unactive_image') > 0) {
            var activeUrl = $("#" + id).attr("active_image");
            $("#" + id).css({
                "background-image": "url(" + activeUrl + ")"
            });
        }
        else if (li_img.indexOf('unactive_image') == -1) {
            var unactiveUrl = $("#" + id).attr("unactive_image");
            $("#" + id).css({
                "background-image": "url(" + unactiveUrl + ")"
            });
        }
    }

    //获取当前点击的pid，如果为父标签，则pid属性为0，如果为子标签pid属性大于0
    var pid = $("#" + id).attr("pid");
    if (pid > 0) {//子标签
        var unactiveNum = 0;//定义一个变量，记录未激活的图标子标签的个数
        $("#" + id).siblings().each(function () {//循环子标签的所有同级标签，不包含当前点击的这一个
            var children_img = $(this).css("background-image");//得到子标签同级标签的图标
            if (children_img.indexOf('unactive_image') > 0) {//如果同级标签的图标为未激活图标，则+1
                unactiveNum++;
            }
            else {
                return;
            }
        })
        if ($("#" + id).css("background-image").indexOf('unactive_image') > 0) {//获取当前点击的子标签的图标，如果未激活则+1
            unactiveNum++;
        }
        var childrenNum = $("#" + id).siblings().length;//获取点击子标签的同级标签的个数
        if (unactiveNum == childrenNum + 1) {//如果未激活图标的数目如果等于点击的子标签和它的同级标签的总数，说明子标签都是未激活图标
            var unactiveImg = $("#" + pid).attr("unactive_image");//得到子标签的父级标签的未激活图标属性
            $("#" + pid).css({
                "background-image": "url(" + unactiveImg + ")"
            });//将父级图标设为未激活
        }
        if (unactiveNum == 0) {//如果未激活图标数目为0，则说明都是激活图标
            var activeImg = $("#" + pid).attr("active_image");//得到子标签的父级标签的激活图标属性
            $("#" + pid).css({
                "background-image": "url(" + activeImg + ")"
            });//将父级图标设为激活图标
        }
    }
    else {//父标签：两种情况，1、没有子标签 2、有子标签
        var children = $("#" + id + " ul").children();//父级标签下的ul标签下的所有子标签
        if (children.length > 0) {//如果子标签数目大于0，有子标签
            var parent_img = $("#" + id).css("background-image");//获取父级的图标
            if (parent_img.indexOf('unactive_image') > 0) {//如果父级的图标为未激活图标
                $("#" + id + " >ul >li").each(function () {//循环父级标签下的ul标签下的所有li子标签
                    var unactiveImg = $(this).attr("unactive_image");//获取子标签的未激活图标属性
                    $(this).css({
                        "background-image": "url(" + unactiveImg + ")"
                    });//将子标签的图标换成未激活的图标
                });
            }
            if (parent_img.indexOf('unactive_image') == -1) {//如果父级的图标为激活图标
                $("#" + id + " >ul >li").each(function () {//循环父级标签下的ul标签下的所有li子标签
                    var activeImg = $(this).attr("active_image");//获取子标签的激活图标属性
                    $(this).css({
                        "background-image": "url(" + activeImg + ")"
                    });//将子标签的图标换成激活的图标
                });
            }
        }
        else {//没有子标签 
            return;
        }
    }
}
function deviceToolClick(id) {
    //获取页面地图容器的div：mapContainer的自定义类型currentMapType的值,1为2D，2为2.5D，3为楼内图
    var currentMapType = $("#mapContainer").attr("currentMapType");
    if (currentMapType == 1 || currentMapType == 2) {//主图上的设备
        var myLayerGroup = markerLayerArray;//2D图的layerGroup，在本js中
    }
    if (currentMapType == 3) {//楼内图上的设备
        var myLayerGroup = floorDeviceLayerArray;//楼内图layerGroup，在楼内图的js中
    }
    var isLayerChange = false;//判断这次工具栏的点击是否有图层的显示和隐藏
    var isShow = $("#" + id).attr("isShow");
    for (var i = 0; i < myLayerGroup.length; i++) {
        var layer = myLayerGroup[i];
        if ("device_" + layer.userDefined != id && "device_" + layer.parentID == id) {//点击设备为父设备
            if (isShow == 1 && layer.show == true) {
                csm.mapContainer.removeLayer(layer);
                layer.show = false;
                if ($("#semiCircleControl").attr("isShow") == 1) {
                    markerSemiCircleShowHide(layer);
                }
                $("#" + id).attr("isShow", "0");
                var unactiveUrl = $("#" + id).attr("unactive_image");
                $("#" + id).css({
                    "background-image": "url(" + unactiveUrl + ")"
                });
                isLayerChange = true;
            }
            else if (isShow == 0 && layer.show == false) {
                csm.mapContainer.addLayer(layer);
                layer.show = true;
                if ($("#semiCircleControl").attr("isShow") == 1) {
                    markerSemiCircleShowHide(layer);
                }
                $("#" + id).attr("isShow", "1");
                var activeUrl = $("#" + id).attr("active_image");
                $("#" + id).css({
                    "background-image": "url(" + activeUrl + ")"
                });
                isLayerChange = true;
            }

        }
        if ("device_" + layer.userDefined == id && layer.parentID == 0) {//父设备本身为子设备
            if (isShow == 1 && layer.show == true) {
                csm.mapContainer.removeLayer(layer);
                layer.show = false;
                markerSemiCircleShowHide(layer);
                $("#" + id).attr("isShow", 0);
                var unactiveUrl = $("#" + id).attr("unactive_image");
                $("#" + id).css({
                    "background-image": "url(" + unactiveUrl + ")"
                });
                isLayerChange = true;
            }
            else if (isShow == 0 && layer.show == false) {
                csm.mapContainer.addLayer(layer);
                layer.show = true;
                markerSemiCircleShowHide(layer);
                $("#" + id).attr("isShow", 1);
                var activeUrl = $("#" + id).attr("active_image");
                $("#" + id).css({
                    "background-image": "url(" + activeUrl + ")"
                });
                isLayerChange = true;
            }

        }
        if ("device_" + layer.userDefined == id && layer.parentID > 0) {//点击子设备
            if (isShow == 1 && layer.show == true) {
                csm.mapContainer.removeLayer(layer);
                layer.show = false;
                markerSemiCircleShowHide(layer);
                $("#" + id).attr("isShow", 0);
                var unactiveUrl = $("#" + id).attr("unactive_image");
                $("#" + id).css({
                    "background-image": "url(" + unactiveUrl + ")"
                });
                isLayerChange = true;;
            }
            else if (isShow == 0 && layer.show == false) {
                csm.mapContainer.addLayer(layer);
                layer.show = true;
                markerSemiCircleShowHide(layer);
                $("#" + id).attr("isShow", 1);
                var activeUrl = $("#" + id).attr("active_image");
                $("#" + id).css({
                    "background-image": "url(" + activeUrl + ")"
                });
                isLayerChange = true;;
            }

        }
        //marker图层在地图上发生过显示和隐藏，就要对marker的扇形进行显示和隐藏的操作
        //if (isLayerChange==true) {
        //    markerSemiCircleShowHide(layer);
        //}
    }

    //当地图上没有图层发生显隐性时候，工具栏的图标也发生变化
    if (isLayerChange == false) {
        var li_img = $("#" + id).css("background-image");
        if (li_img.indexOf('unactive_image') > 0) {
            var activeUrl = $("#" + id).attr("active_image");
            $("#" + id).css({
                "background-image": "url(" + activeUrl + ")"
            });
            $("#" + id).attr("isShow", 1);
        }
        else if (li_img.indexOf('unactive_image') == -1) {
            var unactiveUrl = $("#" + id).attr("unactive_image");
            $("#" + id).css({
                "background-image": "url(" + unactiveUrl + ")"
            });
            $("#" + id).attr("isShow", 0);
        }
    }

    //获取当前点击的pid，如果为父标签，则pid属性为0，如果为子标签pid属性大于0
    var pid = $("#" + id).attr("pid");
    if (pid.split("device_")[1] > 0) {//子标签
        var unactiveNum = 0;//定义一个变量，记录未激活的图标子标签的个数
        $("#" + id).siblings().each(function () {//循环子标签的所有同级标签，不包含当前点击的这一个
            var children_isShow = $(this).attr("isShow");
            if (children_isShow == 0) {
                unactiveNum++;
            }
            else {
                return;
            }
        })
        if ($("#" + id).attr("isShow") == 0) {//获取当前点击的子标签的图标，如果未激活则+1
            unactiveNum++;
        }
        var childrenNum = $("#" + id).siblings().length;//获取点击子标签的同级标签的个数
        if (unactiveNum == childrenNum + 1) {//如果未激活图标的数目如果等于点击的子标签和它的同级标签的总数，说明子标签都是未激活图标
            var unactiveImg = $("#" + pid).attr("unactive_image");//得到子标签的父级标签的未激活图标属性
            $("#" + pid).css({
                "background-image": "url(" + unactiveImg + ")"
            });//将父级图标设为未激活
            $("#" + pid).attr("isShow", 0);
        }
        if (unactiveNum == 0) {//如果未激活图标数目为0，则说明都是激活图标
            var activeImg = $("#" + pid).attr("active_image");//得到子标签的父级标签的激活图标属性
            $("#" + pid).css({
                "background-image": "url(" + activeImg + ")"
            });//将父级图标设为激活图标
            $("#" + pid).attr("isShow", 1);
        }
    }
    else {//父标签：两种情况，1、没有子标签 2、有子标签
        var children = $("#" + id + " ul").children();//父级标签下的ul标签下的所有子标签
        if (children.length > 0) {//如果子标签数目大于0，有子标签
            //var parent_img = $("#" + id).css("background-image");//获取父级的图标
            var parent_isShow = $("#" + id).attr("isShow");//获取父级的图标
            if (parent_isShow == 0) {//如果父级的图标为未激活图标
                $("#" + id + " >ul >li").each(function () {//循环父级标签下的ul标签下的所有li子标签
                    var unactiveImg = $(this).attr("unactive_image");//获取子标签的未激活图标属性
                    $(this).css({
                        "background-image": "url(" + unactiveImg + ")"
                    });//将子标签的图标换成未激活的图标
                    $(this).attr("isShow", 0);
                });
            }
            if (parent_isShow == 1) {//如果父级的图标为激活图标
                $("#" + id + " >ul >li").each(function () {//循环父级标签下的ul标签下的所有li子标签
                    var activeImg = $(this).attr("active_image");//获取子标签的激活图标属性
                    $(this).css({
                        "background-image": "url(" + activeImg + ")"
                    });//将子标签的图标换成激活的图标
                    $(this).attr("isShow", 1);
                });
            }
        }
        else {//没有子标签 
            return;
        }
    }
}
//判断deviceLayerGroup中是否存在对应设备类型的ID的featureGroup，如果存在则返回这个，没有则创建返回
function getDeviceFeatureGroup(deviceType, defined_device_typeid, pid) {
    var markerLayer = null;
    for (var i = 0; i < markerLayerArray.length; i++) {
        var markers = markerLayerArray[i];
        if (markers.deviceType == deviceType) {
            markerLayer = markers;
        }
    }
    //var markerLayers = csm.mapContainer.getLayersByName("markerLayer" + deviceType);
    //if (markerLayers.length == 0) {
    //    markerLayer = markerLayers[0];
    //}
    if (!markerLayer) {
        markerLayer = new SuperMap.Layer.Markers("markerLayer" + deviceType);
        markerLayer.deviceType = deviceType;
        markerLayer.userDefined = defined_device_typeid;//自定义类型ID
        markerLayer.parentID = pid;
        markerLayer.show = true;
        csm.mapContainer.addLayer(markerLayer);
        markerLayerArray.push(markerLayer);

    }
    return markerLayer;
}
//设备的单击事件
var simplePopup = null;
var framedCloudMarker;
function deviceMarkerClick(e) {

    if (Alarm.alarmState) {//如果正在告警不弹窗
        alert("请在确警后再进行此操作！");
        return;
    }
    closeInfoWin();//弹出之前先关闭其他设备或者区域的弹框
    closeVedioPopup();//关掉视频的弹框
    var marker = this;
    currentClickMarker = marker;
    $("#devicePopupClose").attr("style", "display:");
    var contentHTML = $("#devicePopup").html();

    // ' <div id="devicePopup" class="ball-frame building-frame" style="display:;">' +
    //'<p id="deviceNamePopup" class="building-title"><a class="building-link">详情>></a>' +
    //'<div class="building-content">' +
    //    '<div id="deviceInfoImg" class="building-img building-img2"></div>' +
    //    '<div class="building-tab building2-tab">' +
    //        '<table cellspacing="0">' +
    //            '<tbody>' +
    //                '<tr>' +
    //                   '<td>位&ensp;&ensp;&ensp;置：</td>' +
    //                    '<td class="blank-td" width="95"></td>' +
    //                    '<td>状&ensp;&ensp;&ensp;态： </td>' +
    //                   ' <td class="state-td">正常</td>' +
    //                '</tr>' +
    //                '<tr>' +
    //                   ' <td>编&ensp;&ensp;&ensp;号：</td>' +
    //                    '<td class="blank-td">SWXFS1</td>' +
    //                    '<td>安装时间：</td>' +
    //                    '<td class="blank-td">2017-01-11</td>' +
    //                '</tr>' +
    //                '<tr>' +
    //                    '<td> 子&ensp;系&ensp;统：</td>' +
    //                    '<td class="blank-td">消防</td>' +
    //                '</tr>' +
    //            '</tbody>' +
    //        '</table>' +
    //    '</div>' +
    //'</div>' +
    //'<ul class="alarm-btn">' +
    //    '<li class="liFirst">' +
    //        '<input type="button" value="报警记录">' +
    //        '<img src="~/style/base/images/public/map/dialogBtnimg1.png">' +
    //    '</li>' +
    //    '<li>' +
    //        '<input type="button" value="报警统计">' +
    //        '<img src="~/style/base/images/public/map/dialogBtnimg2.png">' +
    //    '</li>' +
    //    '<li onclick="manpower()">' +
    //        '<input type="button" value="人工上报">' +
    //        '<img src="~/style/base/images/public/map/dialogBtnimg4.png">' +
    //    '</li>' +
    //'</ul>';
    //'</div>';

    framedCloudMarker = new SuperMap.Popup.FramedCloud("chicken123", marker.getLonLat(), null, contentHTML, null, false, null, true);
    //framedCloudMarker.maxSize = SuperMap.Size(1000, 1000);
    framedCloudMarker.autoSize = true;
    simplePopup = framedCloudMarker;
    csm.mapContainer.addPopup(framedCloudMarker);
    $("#deviceNamePopup").html(marker.device_name);
    if (marker.popup_image != 0) {
        $("#deviceInfoImg").css({
            "background-image": "url(" + marker.popup_image + ")"
        });//将popup图标置换

    }
    else if (marker.popup_image == 0) {
        $("#deviceInfoImg").css({
            "background-image": "url(../images/map/deviceMapIcon/popup_image/default-device.jpg)"
        });//将popup图标置换
    }
}
function closeInfoWin() {
    if (simplePopup) {
        try {
            simplePopup.hide();
            simplePopup.destroy();
        }
        catch (e) { }
    }
}
//将墨卡托平面坐标转换为经纬度
function Mercator2latlng(x, y) {
    var lat, lng;
    lng = x / 20037508.3427892 * 180;
    lat = y / 20037508.3427892 * 180
    lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
    return [lat, lng];
}
//将经纬度坐标转换为墨卡托平面坐标
function lonLat2Mercator(lon, lat) {
    var lon = Number(lon);
    var lat = Number(lat);
    var mx, my;
    mx = lon * 20037508.3427892 / 180;
    my = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    my = my * 20037508.3427892 / 180;

    var point = new SuperMap.Geometry.Point(mx, my);
    return point;
}
//将设备工具栏的图标重新设置一遍设置为激活的图标，在楼内图和主图切换之间调用
function resetDeviceToolIcon() {
    $("#leftFloat >li").each(function () {//循环父级标签li标签
        var activeImg = $(this).attr("active_image");//获取父标签的激活图标属性
        $(this).css({
            "background-image": "url(" + activeImg + ")"
        });//将父标签的图标换成激活的图标
    });
    $(".sub-leftfloat >li").each(function () {////循环父级标签下的ul标签下的所有li子标签
        var activeImgChildren = $(this).attr("active_image");//获取子标签的激活图标属性
        $(this).css({
            "background-image": "url(" + activeImgChildren + ")"
        });//将父标签的图标换成激活的图标
    });

    //重置扇形的工具栏图标
    semiCircleLayer.removeAllFeatures();//清除扇形图层的全部的要素
    $("#semiCircleControl").attr("isShow", 0);
    var unActiveImg = $("#semiCircleControl").attr("unactive_image");//获取未激活图标属性
    $("#semiCircleControl").css({
        "background-image": "url(" + unActiveImg + ")"
    });
}

//创建扇形
//CameraTowards:
//    东 = 1,
//    西,
//    南,
//    北,
//    东北,
//    西北,
//    东南,
//    西南
function createSemiCircle(position, visual_range, cover_range, camera_towards) {
    var starAngle = null;
    switch (camera_towards) {
        case 1://    东 = 1,
            starAngle = -(cover_range / 2);
            break;
        case 2://    西,
            starAngle = 90 + 90 - (cover_range / 2);
            break;
        case 3://    南,
            starAngle = 180 + 90 - (cover_range / 2);
            break;
        case 4://    北,
            starAngle = 90 - (cover_range / 2);
            break;
        case 5://    东北,
            starAngle = (90 - cover_range) / 2;
            break;
        case 6://    西北,
            starAngle = 90 + (90 - cover_range) / 2;
            break;
        case 7://    东南,
            starAngle = 270 + (90 - cover_range) / 2;
            break;
        case 8://    西南
            starAngle = 180 + (90 - cover_range) / 2;
            break;
        default:

    }
    if (position && visual_range && cover_range && camera_towards) {
        var semiCircle;
        if (cover_range == 360) {
            semiCircle = createCircle(position, visual_range, 256, 360, 360);
            var cuvreVector = new SuperMap.Feature.Vector(semiCircle);
            cuvreVector.style = {
                strokeColor: "#000000",
                fillColor: "#CCFAA8",
                strokeWidth: 0.1,
                fillOpacity: 0.5
            };
        }
        else {
            var sides = 50;
            semiCircle = SuperMap.Geometry.Polygon.createRegularPolygonCurve(position, visual_range, sides, cover_range, starAngle);//角度，偏转
            var cuvreVector = new SuperMap.Feature.Vector(semiCircle);
            cuvreVector.style = {
                strokeColor: "#000000",
                fillColor: "#104E8B",
                strokeWidth: 0.1,
                fillOpacity: 0.2
            };
        }

        return cuvreVector;
    }
    else {
        return null;
    }

    //semiCircleLayer.addFeatures(cuvreVector);
}
//扇形工具栏的单击事件
function semiCircleShowHide() {
    var currentMapType = $("#mapContainer").attr("currentMapType");
    if ($("#semiCircleControl").attr("isShow") == 1) {//扇形是显示的
        semiCircleLayer.removeAllFeatures();//清除扇形图层的全部的要素
        $("#semiCircleControl").attr("isShow", 0);
        var unActiveImg = $("#semiCircleControl").attr("unactive_image");//获取未激活图标属性
        $("#semiCircleControl").css({
            "background-image": "url(" + unActiveImg + ")"
        });
    }
    else if ($("#semiCircleControl").attr("isShow") == 0) {//扇形是隐藏的
        if (currentMapType == 1 || currentMapType == 2) {//主图上的设备
            var myLayerGroup = markerLayerArray;//2D图的layerGroup，在本js中
        }
        if (currentMapType == 3) {//楼内图上的设备
            var myLayerGroup = floorDeviceLayerArray;//楼内图layerGroup，在楼内图的js中
        }
        for (var i = 0; i < myLayerGroup.length; i++) {
            var layer = myLayerGroup[i];
            if (layer.deviceType == 1 || layer.deviceType == 2 || layer.deviceType == 3 || layer.deviceType == 4) {
                for (var j = 0; j < layer.markers.length; j++) {
                    if (layer.markers[j].semiCircle) {
                        semiCircleLayer.addFeatures(layer.markers[j].semiCircle);
                    }
                }
            }
        }
        //csm.mapContainer.addLayer(semiCircleLayer);
        $("#semiCircleControl").attr("isShow", 1);
        var activeImg = $("#semiCircleControl").attr("active_image");//获取激活图标属性
        $("#semiCircleControl").css({
            "background-image": "url(" + activeImg + ")"
        });
    }
}
function markerSemiCircleShowHide(layer) {
    var markers = layer.markers;
    if (layer.show == false) {
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            if (marker.semiCircle) {
                semiCircleLayer.removeFeatures(marker.semiCircle);
            }
        }
        return;
    }
    else if (layer.show == true) {
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            if (marker.semiCircle) {
                semiCircleLayer.addFeatures(marker.semiCircle);
            }
        }
        return;
    }

}

//右键菜单的对象
var contextMenuPopup = null;
var contextMarker = null;//右键点击的marker
//地图上设备图标的右键弹窗
function showContextMenuPopup() {
    closeContextMenuPopup();//关闭前面的窗口
    //组织需要嵌入的HTML字符串表达 
    contextMarker = this;
    var contentHTML = '<div class="ball-frame rightball">';
    contentHTML += ' <div><button class="btn btn-default" onclick="quickViewPlan();">快速查看预案</button></div>';
    contentHTML += '<div><button class="btn btn-default"  onclick="fastRegistrationPlan();">快速注册预案</button></div>';
    contentHTML += '<div><button class="btn btn-default"  onclick="batchConfigurationPlan();">批量配置预案</button></div>';
    contentHTML += '<div><button class="btn btn-default"  onclick="openAnalogAlarmBox();">模拟告警</button></div></div>';

    var lonLat = contextMarker.getLonLat();//csm.mapContainer.getCenter();
    var popwin = new SuperMap.Popup.Anchored("chicken",
    lonLat,
    new SuperMap.Size(120, 100),
    contentHTML,
    null,
    false,
    null);
    contextMenuPopup = popwin;
    //if (popwin) csm.mapContainer.removePopup(popwin);
    csm.mapContainer.addPopup(popwin);
    $(".smPopupContent").css("height", "90px!important");

}
//创建EventUtil对象监听右键事件，关闭右键菜单用
var EventUtil = {
    addHandler: function (element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        }
    },
    getEvent: function (event) {
        return event ? event : window.event;
    },
    //取消事件的默认行为
    preventDefault: function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    stopPropagation: function (event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }
};
EventUtil.addHandler(window, "load", function (event) {
    EventUtil.addHandler(document, "click", function (event) {
        closeContextMenuPopup();
    });
});
//关闭右键菜单
function closeContextMenuPopup() {
    if (contextMenuPopup) {
        try {
            contextMenuPopup.hide();
            contextMenuPopup.destroy();
        }
        catch (e) { }
    }

}
//设置图标，state1为正常，其他为问题
function setImg(state, deviceCode) {
    if (currentClickMarker && currentClickMarker.device_code == deviceCode) {
        if (state == 1) {
            currentClickMarker.setUrl(currentClickMarker.normal_image);
        }
        else {
            currentClickMarker.setUrl(currentClickMarker.error_image);
        }
        currentClickMarker.device_status = state;
    }

}
//快速查看预案2017/3/17 乔会会
function quickViewPlan() {
    var device = contextMarker;
    //当前用户是否拥有这个园区的权限
    var regionidList = $("input[name=mainControlRegion]");
    var result = false;
    for (var i = 0; i < regionidList.length; i++) {
        if (regionidList[i].value == device.region_id) {
            result = true;
        }
    }
    if (result == true) {
        $.ajax({
            url: "/Plan/ViewRelatedPlans",
            type: "post",
            data: "&deviceId=" + device.id,
            datatype: 'json',
            async: false,
            success: function (data) {
                if (data.status == 0) {
                    if (data.msg.length > 0) {
                        if (confirm("以获取与该设备有关的" + data.msg.length + "条预案，你是否要跳转页面查看详情！")) {
                            window.location.href = "/Plan/Index?deviceId=" + device.id;
                        }
                    }
                    else {
                        alert("没有查到与该设备有关的预案");
                    }
                }
                else {
                    alert("快速查看预案出现" + data.msg + "错误请联系管理员！");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("快速查看预案出现" + XMLHttpRequest.status + "错误请联系管理员！");
            }
        });

    }
    else {
        alert("你没有该设备所在园区的权限所以无法查看预案!");
    }

}

//快速注册预案2017/3/17 乔会会
function fastRegistrationPlan() {
    var device = contextMarker;
    var regionidList = $("input[name=mainControlRegion]");
    var result = false;
    var regionId = 0;
    for (var i = 0; i < regionidList.length; i++) {
        if (regionidList[i].value == device.region_id) {
            result = true;
        }
    }
    if (result == true) {
        if ($.cookie("mainControlRegionId")) {
            regionId = $.cookie("mainControlRegionId")
        }
        if (regionId == device.region_id) {
            if (confirm("你是否要跳转到设备预案注册页面，注册与改设备有关的预案")) {
                window.location.href = "/Plan/DeviceCreate?deviceId=" + device.id + "&deviceType=" + device.device_type + "&regionId=" + device.region_id;
            }
        }
        else {
            alert("请先切换主控园区在点击该设备注册预案");
        }
    }
    else {
        alert("你没有该设备所在园区的权限所以无法查看预案!");
    }
}

//打开模拟告警弹窗 乔
function openAnalogAlarmBox() {
    var device = contextMarker;
    $('#analogAlarm').dialog({ title: '模拟告警', modal: true });
    var deviceName = device.device_name + "地图模拟告警";
    $("#alarmNameInput").val(deviceName);
    $("#alarmCodeInput").val(device.device_code)
    $("#deviceAlarmText").val("");
    $("#analogAlarm").dialog('open');
    $("#mapDeviceAlarmBtn").unbind("click"); //解除绑定
    $("#mapDeviceAlarmBtn").bind("click", simulate.mapDeviceAlarm);//绑定事件
    $("#cancelmapDeviceAlarmBtn").unbind("click"); //解除绑定
    $("#cancelmapDeviceAlarmBtn").bind("click", simulate.cancalanalogAlarm);//绑定事件
    $("#aboutAlarmDiv").unbind("click"); //解除绑定
    $("#aboutAlarmDiv").bind("click", simulate.cancalanalogAlarm);//绑定事件
}

//批量配置预案 乔
function batchConfigurationPlan() {
    var device = contextMarker;
    var regionidList = $("input[name=mainControlRegion]");
    var result = false;
    var regionId = 0;
    for (var i = 0; i < regionidList.length; i++) {
        if (regionidList[i].value == device.region_id) {
            result = true;
        }
    }
    if (result == true) {
        if ($.cookie("mainControlRegionId")) {
            regionId = $.cookie("mainControlRegionId")
        }
        if (regionId == device.region_id) {
            var deviceType = getDeviceTypeName(device.device_type);
            if (confirm("你已选择" + deviceType + "类设备是否要跳转到设备预案批量注册页面，注册该类设备预案")) {
                window.location.href = "/Plan/DeviceBatchCreate?deviceId=" + device.id + "&deviceType=" + device.device_type + "&regionId=" + device.region_id + "&inbuildingId=" + device.is_inbuilding;
            }
        }
        else {
            alert("请先切换主控园区在点击该设备注册预案");
        }
    }
    else {
        alert("你没有该设备所在园区的权限所以无法查看预案!");
    }

}

//根据设备类型id获取设备类型名称
function getDeviceTypeName(Id) {
    var deviceType = "";
    $.ajax({
        url: "/Map/DeviceTypeName",
        type: "post",
        data: "Id=" + Id,
        datatype: "json",
        async: false,
        success: function (data) {
            if (data.status == 0) {
                deviceType = data.msg;
            }
            else {
                alert("获取设备类型名称出现" + XMLHttpRequest.status + "错误请联系管理员！");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("获取设备类型名称出现" + XMLHttpRequest.status + "错误请联系管理员！");
        }
    });
    return deviceType;
}


