﻿
var csm = {};
var operationControl = 0;//操作控制标记，用于表示操作类型，0：无操作 1：2D设备注册 2：2D设备修改 3：2.5D设备注册 4：2.5D设备修改 5：楼内图设备注册 6：楼内图设备修改
var selemarker = null;//选择的marker点位缓存
var gmarker = null;//需要修改的marker点位缓存
var dmarker = null;//需要删除的marker点位缓存
var infowin = null;//弹窗
var featureMove;//移动图层容器
csm.dragFeature;//mark移动事件
csm.mapContainer = null;//地图容器
csm.serverUrl = null;//地图服务地址
csm.baseMap = null;//地图的基础图层
csm.southwest = null;//西南角坐标（左下）
csm.northeast = null;//东北角坐标(右上)
csm.center = null;//地图中心
var markers, MoveVectorLayer, markerLayer;//图层

csm.baseMap25D = null;//2.5D的地图对象
csm.mapCenter25D = null;//2.5D的地图的中心
csm.southwest25D = null;
csm.northeast25D = null;
csm.serverUrl25D = null;
//csm.serverUrl25D = null;//2.5D URL"http://123.56.96.237:8090/iserver/services/map-ugcv5-wz25wz25/rest/maps/wz25@wz25";
//csm.serverUrl = null;//2D URL"http://123.56.96.237:8090/iserver/services/map-ugcv5-areaBeiYouareaBeiYou/rest/maps/areaBeiYou@areaBeiYou";
//楼内图服务地址
var urll = null;// "http://" + getServerUrl(Map2DConfigId) + "/iserver/services.json";//Server URL
var mapsdata = [];//楼内图服务地址
csm.baseMapBuilding = null;//楼内图
csm.markers = null, csm.MoveLayer = null;//声明楼内图marker图层和楼内图移动图层
csm.bselectFeature = null, csm.dragFeature = null;//声明楼内图选择和拖动事件
csm.serverBuildingUrl = null;//楼内图url
var center_floor;//楼层中心点位
var floorid = 0;//楼层id
var supermap25Dmultiple = Number(4243);//2.5D地图高度
var supermap25Dhigh = Number(4);//2.5D地图倍数


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


$(document).ready(function () {
    readMap2DConfig();
    readMap25DConfig();
    urll = getServerUrl(csm.serverUrl);


    InitMap();
    //addMap25D(); 
    LoadMap();
    getAllBuildingUrl();//获取所有地图服务
});

function InitMap() {
    markers = new SuperMap.Layer.Markers("Markers"); //添加的markers图层
    markerLayer = new SuperMap.Layer.Markers("markerLayer"); //添加的markers图层
    //MoveVectorLayer = new SuperMap.Layer.Markers("MoveVectorLayer");
    MoveVectorLayer = new SuperMap.Layer.Vector("MoveVectorLayer"); //声明一个一个矢量图层MoveVectorLayer控件，来呈现设备注册的移动点位 
    //vectorPolygon = new SuperMap.Layer.Vector("Polygon");//超图放多边形的图层
    var callbacks = {////双击回调事件
        dblclick: function (currentFeature) {
            if (featureMove == null) {
                alert("获取标记位置失败！请检查超图配置！");
                return;
            }
            switch (operationControl) {
                case 1://2D设备注册
                    var xx = featureMove.geometry.x; // 获取对象的 坐标，图标  
                    var yy = featureMove.geometry.y;
                    tempx = xx;
                    tempy = yy;
                    var lonlat = Mercator2latlng(xx, yy);
                    var moveMarkerLatlng = lonlat.lat + "," + lonlat.lon;//当前的经纬度
                    $("#lonLat").val(moveMarkerLatlng);
                    showAddDeviceDialog();
                    $("#is_inbuilding").val(-1);
                    break;
                case 2://2D设备修改
                    //gmarkerToOldOptions();//打对应点位信息交互给oldOptions数据
                    // UPDATEANDADDFLAG = "UPDATE";
                    var xx = featureMove.geometry.x; // 获取对象的 坐标，图标  
                    var yy = featureMove.geometry.y;
                    tempx = xx;
                    tempy = yy;
                    var lonlat = Mercator2latlng(xx, yy);
                    gmarker.longitude = lonlat.lon;//旧的坐标
                    gmarker.latitude = lonlat.lat;//旧的坐标
                    if (gmarker.local_latitude == undefined || gmarker.local_longitude == undefined) {
                        gmarker.local_latitude = "";
                        gmarker.local_longitude = "";
                    }
                    //var moveMarkerLatlng = lonlat.lat + "," + lonlat.lon;//当前的经纬度
                    //$("#lonLat").val(moveMarkerLatlng);
                    // $("#is_inbuilding").val(-1);
                    showUpdateDeviceDialog(gmarker);
                    break;
                case 3://2.5D设备注册
                    if (!confirm("确定要将设备注册到该位置吗")) {
                        MoveVectorLayer.removeAllFeatures();//清除移动图层数据
                        return;
                    }
                    
                    var xx = featureMove.geometry.x; // 获取对象的 坐标，图标  
                    var yy = featureMove.geometry.y;
                    //x = Number(deviceObj.local_latitude) * supermap25Dhigh;
                    //y = supermap25Dmultiple - Number(deviceObj.local_longitude) * supermap25Dhigh;
                    tempx = Number(xx) / Number(supermap25Dhigh);
                    tempy = (Number(supermap25Dmultiple) - Number(yy)) / Number(supermap25Dhigh);
                    var issuccess = registerDevice25D(currentFeature.data.id, tempy, tempx);//leaflet和超图的坐标正好相反
                    if (issuccess == true) {
                        for (var i = 0; i < AllDeviceInfo.length; i++) {
                            if (AllDeviceInfo[i].id == currentFeature.data.id) {
                                var deviceObj = AllDeviceInfo[i];
                                var m = gpsTransMercator(deviceObj.longitude, deviceObj.latitude);
                                var  x = m.mx;
                                var  y = m.my;
                                var device_type = deviceObj.device_type;
                                var is_inbuilding = deviceObj.is_inbuilding;
                                if (is_inbuilding == -1) {//判断为楼外的设备
                                    //创建marker
                                    var icon = deviceObj.normal_image;
                                    var size = new SuperMap.Size(15.15, 23);
                                    var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 1.1));
                                    var eicon = new SuperMap.Icon(icon, size, offset);
                                    eicon.imageDiv.text = deviceObj.device_name;
                                    eicon.imageDiv.title = deviceObj.device_name;
                                    var deviceMarker = new SuperMap.Marker(new SuperMap.LonLat(Number(xx), Number(yy)), eicon);

                                    //给marker赋属性
                                    deviceMarker.id = deviceObj.id;//主键
                                    deviceMarker.device_code = deviceObj.device_code; //设备编号
                                    deviceMarker.is_parts = deviceObj.is_parts; //复合设备
                                    deviceMarker.device_name = deviceObj.device_name; //设备名称
                                    deviceMarker.device_type = deviceObj.device_type; //设备类型
                                    deviceMarker.subsystem_id = deviceObj.subsystem_id; //子系统编号
                                    deviceMarker.longitude = deviceObj.longitude; //经度
                                    deviceMarker.latitude = deviceObj.latitude; // 纬度
                                    deviceMarker.register_time = deviceObj.register_time; //注册时间
                                    deviceMarker.search_code = deviceObj.search_code; //设备搜索缩写
                                    deviceMarker.x = x;//墨卡托坐标x
                                    deviceMarker.y = y;//墨卡托坐标y
                                    deviceMarker.local_longitude = xx;//2.5DX轴
                                    deviceMarker.local_latitude = yy;//2.5DY轴
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
                                    deviceMarker.etx1 = deviceObj.ext1;//及时回放
                                    deviceMarker.etx2 = deviceObj.ext2;//多路播放
                                    deviceMarker.etx3 = deviceObj.ext3;//上大墙
                                    deviceMarker.etx4 = deviceObj.ext4;//历史回放
                                    deviceMarker.defined_device_typeid = deviceObj.defined_device_typeid;//自定义设备类型id
                                    deviceMarker.defined_device_name = deviceObj.defined_device_name;//自定义设备类型名称
                                    deviceMarker.active_image = deviceObj.active_image;//设备显示图标
                                    deviceMarker.unactive_image = deviceObj.unactive_image;//设备隐藏图标
                                    deviceMarker.normal_image = deviceObj.normal_image;//正常图标
                                    deviceMarker.error_image = deviceObj.error_image;//错误图标
                                    deviceMarker.flash_image = deviceObj.flash_image;//闪光图标
                                    deviceMarker.popup_image = deviceObj.popup_image;//设备弹出图片
                                    deviceMarker.pid = deviceObj.pid;//自定义设备类型pid
                                    //deviceMarker.bindTooltip(deviceMarker.device_name);
                                    //deviceMarker.iconName = normalImage[device_type]; //这个不是数据库里面的字段,是根据设备类型的id直接取出设备图标的完整路径，方便用
                                    //将marker添加到图层里面去
                                    //deviceMarkerFeatureGroup.addLayer(deviceMarker);
                                    //alert(deviceMarker.isDrawn());

                                    deviceMarker.events.on({
                                        "mousemove": function () {
                                            this.icon.imageDiv.title = deviceObj.device_name;
                                            this.icon.imageDiv.title = deviceObj.device_name;
                                        },
                                        "rightclick": deviceRightPopup,
                                        "scope": deviceMarker
                                    });
                                    markers.addMarker(deviceMarker);
                                }

                            }

                        }
                        
                    }
                    else {

                        alert("添加设备点位失败！错误方法为registerDevice25D()返回false，请检查此方法！");
                    }
                    MoveVectorLayer.removeAllFeatures();//清除移动图层数据
                    LoadDeviceListTree25D();
                    break;
                case 4://2.5D设备修改
                    var xx = featureMove.geometry.x; // 获取对象的 坐标，图标  
                    var yy = featureMove.geometry.y;
                    tempx = xx;
                    tempy = yy;
                    var lonlat = Mercator2latlng(xx, yy);
                    gmarker.local_latitude = Number(xx) / Number(supermap25Dhigh);
                    gmarker.local_longitude = (Number(supermap25Dmultiple) - Number(yy)) / Number(supermap25Dhigh);
                    //gmarker.longitude = lonlat.lon;//旧的坐标
                    //gmarker.latitude = lonlat.lat;//旧的坐标
                    if (gmarker.local_latitude == undefined || gmarker.local_longitude == undefined) {
                        gmarker.local_latitude = "";
                        gmarker.local_longitude = "";
                    }
                    //var moveMarkerLatlng = lonlat.lat + "," + lonlat.lon;//当前的经纬度
                    //$("#lonLat").val(moveMarkerLatlng);
                    // $("#is_inbuilding").val(-1);
                    showUpdateDeviceDialog(gmarker);
                    break;

                case 5://2D楼内图设备注册
                    var xx = featureMove.geometry.x; // 获取对象的 坐标，图标  
                    var yy = featureMove.geometry.y;
                    tempx = xx;
                    tempy = yy;
                    var lonlat = Mercator2latlng(xx, yy);
                    var moveMarkerLatlng = lonlat.lat + "," + lonlat.lon;//当前的经纬度
                    $("#lonLat").val(moveMarkerLatlng);
                    showAddDeviceDialog();
                    $("#is_inbuilding").val(floorid);
                    break;
                case 6://2D楼内图设备修改
                    var xx = featureMove.geometry.x; // 获取对象的 坐标，图标  
                    var yy = featureMove.geometry.y;
                    tempx = xx;
                    tempy = yy;
                    var lonlat = Mercator2latlng(xx, yy);
                    gmarker.longitude = lonlat.lon;//旧的坐标
                    gmarker.latitude = lonlat.lat;//旧的坐标
                    if (gmarker.local_latitude == undefined || gmarker.local_longitude == undefined) {
                        gmarker.local_latitude = "";
                        gmarker.local_longitude = "";
                    }
                    //var moveMarkerLatlng = lonlat.lat + "," + lonlat.lon;//当前的经纬度
                    //$("#lonLat").val(moveMarkerLatlng);
                    // $("#is_inbuilding").val(-1);
                    showUpdateDeviceDialog(gmarker);
                    break;
                default:
                    break;
            }

        }
    };

    csm.selectFeature = new SuperMap.Control.SelectFeature(MoveVectorLayer, {
        //onSelect: onFeatureSelected,
        callbacks: callbacks,
        hover: false
    });
    csm.dragFeature = new SuperMap.Control.DragFeature(MoveVectorLayer, {//拖动事件
        // "onDrag": clearRegisterPopup,
        //"onComplete": addDevicesClick
        // callbacks: callbacks
    });
    csm.mapContainer = new SuperMap.Map("mapContainer", {
        //eventListeners: {
        //    "movestart": function () {
        //        $("#myMenu").attr("style", "display:none;");
        //        //menu.style.visibility = "hidden";
        //    },
        //    "click": function () {
        //        $("#myMenu").attr("style", "display:none;");
        //        // menu.style.visibility="hidden";
        //    }
        //},
        controls: [
                new SuperMap.Control.PanZoomBar(), //地图平移缩放控件，提供对地图的平移和缩放的控制操作，默认位于地图左上角 
                new SuperMap.Control.ScaleLine(), //在地图添加比例尺，控件位置
                //new SuperMap.Control.LayerSwitcher(),//图层选择控件，默认在地图右上
                new SuperMap.Control.Navigation({//地图浏览控件，监听鼠标点击、平移、滚轮等事件来实现对地图的浏览操作。 
                    dragPanOptions: {
                        enableKinetic: true
                    }
                }), csm.dragFeature, csm.selectFeature],
        allOverlays: true
        //eventListeners: {
        //    //"movestart": function () {
        //    //    menu.style.visibility = "hidden";
        //    //},
        //    "click": function () {
        //        closeInfoWin();
        //        //menu.style.visibility = "hidden";
        //    }
        //}
    });
}


function LoadMap() {
    csm.baseMap = new SuperMap.Layer.TiledDynamicRESTLayer("district2D", csm.serverUrl, { transparent: true, cacheEnabled: true });
    //监听图层信息加载完成事件 
    csm.baseMap.events.on({ "layerInitialized": addMapLayer });

}
//在图层初始化完成后才能调用addLayer()接口添加到Map上
function addMapLayer() {
    //csm.mapContainer.addLayers([csm.baseMap]);
    csm.mapContainer.addLayers([csm.baseMap, markers, MoveVectorLayer, markerLayer]);
    csm.mapContainer.setCenter(csm.center, 0);
    ////放大级别2
    csm.mapContainer.zoomTo(2);
    //csm.baseMap25D = new SuperMap.Layer.TiledDynamicRESTLayer("district25D", csm.serverUrl25D, { transparent: true, cacheEnabled: true });
    //csm.baseMap25D.events.on({ "layerInitialized": addMapLayer25D });
    getAllDevice();
}

//添加2.5D地图
function add25DBaseMap() {

    csm.baseMap25D = new SuperMap.Layer.TiledDynamicRESTLayer("district25D", csm.serverUrl25D, { transparent: true, cacheEnabled: true });

    //监听图层信息加载完成事件
    csm.baseMap25D.events.on({ "layerInitialized": addMapLayer25D });

}

//监听图层信息加载完成事件 
function addMapLayer25D() {
    csm.mapContainer.addLayers([csm.baseMap25D]);
    csm.mapContainer.setBaseLayer(csm.baseMap25D);
    csm.mapContainer.setCenter(csm.mapCenter25D, 2);
    csm.baseMap.setVisibility(false);
    csm.baseMap25D.setVisibility(true);
    //放大级别2
    csm.mapContainer.zoomTo(3);

    csm.mapContainer.setLayerIndex(csm.baseMap25D, 0);
    
    var maxExtent25D = csm.baseMap25D.getMaxExtent();//获取2.5D地图边界
    supermap25Dmultiple = Number(maxExtent25D.top);//获取高度


    getAllDevice();


    //csm.mapContainer.addLayers([csm.baseMap25D, markers, MoveVectorLayer, markerLayer]);
    //显示地图范围new SuperMap.LonLat(12952244.61, 4860210.88)
    //csm.mapContainer.setCenter(csm.center, 0);
    //csm.mapContainer.zoomTo(2);//放大级别2
    //csm.baseMap25D.setVisibility(false);
    //getAllDevice();
}


//初始加载
//$(function () {

//});

//删除移动图层点位
function RemoveMoveMarker() {

    MoveVectorLayer.removeAllFeatures();//清除移动图层数据

}


//左侧树双击后调用这个方法在地图上标注marker
function AddMoveMarker(id) {
    if (operationControl == 2 || operationControl == 4 || operationControl == 6) {
        markers.addMarker(gmarker);
    }
    if ($("#mapContainer").attr("currentMapType") == 1) {
        //hideRegisterPopup();
        $("#deviceRegisterPopup").hide();
        operationControl = 1;//2D设备注册控制标示
        MoveVectorLayer.removeAllFeatures();//清除移动图层数据
        //在屏幕中心点打点位
        var winWidth = window.screen.availWidth;  //window.screen.availWidth
        var winHeight = window.screen.availHeight; //window.screen.availHeight
        var offset = new SuperMap.Pixel(winWidth / 3, winHeight / 3);
        var lcxlcy = csm.mapContainer.getLonLatFromPixel(offset);
        var point = new SuperMap.Geometry.Point(lcxlcy.lon, lcxlcy.lat);
        var style = {
            externalGraphic: "../scripts/js/map/mapRootJS/SuperMap/theme/images/cluster2.png",
            graphicWidth: 41,
            graphicHeight: 46,
            graphicXOffset: -(41 / 2.4),
            graphicYOffset: -(46 / 1.1)
        };
        featureMove = new SuperMap.Feature.Vector();
        featureMove.geometry = point;
        featureMove.style = style;
        MoveVectorLayer.addFeatures(featureMove);
        csm.dragFeature.activate(); //拖拽控件
        csm.selectFeature.activate();//选择事件，双击
    }

    if ($("#mapContainer").attr("currentMapType") == 2) {
        $("#deviceRegisterPopup").hide();
        operationControl = 3;//2.5D设备注册控制标示
        MoveVectorLayer.removeAllFeatures();//清除移动图层数据
        //在屏幕中心点打点位
        var winWidth = window.screen.availWidth;  //window.screen.availWidth
        var winHeight = window.screen.availHeight; //window.screen.availHeight
        var offset = new SuperMap.Pixel(winWidth / 3, winHeight / 3);
        var lcxlcy = csm.mapContainer.getLonLatFromPixel(offset);
        var point = new SuperMap.Geometry.Point(lcxlcy.lon, lcxlcy.lat);
        var style = {
            externalGraphic: "../scripts/js/map/mapRootJS/SuperMap/theme/images/cluster2.png",
            graphicWidth: 41,
            graphicHeight: 46,
            graphicXOffset: -(41 / 2.4),
            graphicYOffset: -(46 / 1.1)
        };

        var data = {
            id:id

        }
        featureMove = new SuperMap.Feature.Vector();
        featureMove.geometry = point;
        featureMove.style = style;
        featureMove.data = data;
        MoveVectorLayer.addFeatures(featureMove);
        csm.dragFeature.activate(); //拖拽控件
        csm.selectFeature.activate();//选择事件，双击
    }

    if ($("#mapContainer").attr("currentMapType") == 3) {
        //var my_baselayer = csm.mapContainer.baseLayer;
        if (csm.mapContainer.baseLayer.name != "districtB") { alert("请先切换到楼内图再注册设备！"); return; }
        $("#deviceRegisterPopup").hide();
        operationControl = 5;//2D楼内图设备注册控制标示
        MoveVectorLayer.removeAllFeatures();//清除移动图层数据
        //在屏幕中心点打点位
        var winWidth = window.screen.availWidth;  //window.screen.availWidth
        var winHeight = window.screen.availHeight; //window.screen.availHeight
        var offset = new SuperMap.Pixel(winWidth / 3, winHeight / 3);
        var lcxlcy = csm.mapContainer.getLonLatFromPixel(offset);
        var point = new SuperMap.Geometry.Point(lcxlcy.lon, lcxlcy.lat);
        var style = {
            externalGraphic: "../scripts/js/map/mapRootJS/SuperMap/theme/images/cluster2.png",
            graphicWidth: 41,
            graphicHeight: 46,
            graphicXOffset: -(41 / 2.4),
            graphicYOffset: -(46 / 1.1)
        };
        featureMove = new SuperMap.Feature.Vector();
        featureMove.geometry = point;
        featureMove.style = style;
        MoveVectorLayer.addFeatures(featureMove);
        csm.dragFeature.activate(); //拖拽控件
        csm.selectFeature.activate();//选择事件，双击
    //    if (isClickFloor == false) {
    //        alert("请先双击要注册设备的楼内图！");
    //        return;
    //    }
    //    if (moveMarker) {
    //        moveMarker.setLatLng(csm.mapContainer.getCenter());
    //    }
    //    else {
    //        moveMarker = L.marker(csm.mapContainer.getCenter(), { draggable: true });
    //        moveMarker.addTo(csm.mapContainer);
    //        moveMarker.on('click', function (e) {
    //            var moveMarkerLatlng = this.getLatLng().lat + "," + this.getLatLng().lng;//当前marker的经纬度
    //            $("#lonLat").val(moveMarkerLatlng);
    //            showAddDeviceDialog();
    //        });
    //    }
    }
}


//从数据库中读取所有的设备并添加到地图上
function getAllDevice() {

    for (var i = 0; i < AllDeviceInfo.length; i++) {
        var x ;
        var y;
        var isLoding = 0;//判断是否加载
        var deviceObj = AllDeviceInfo[i];
        switch (Number($("#mapContainer").attr("currentMapType"))) {
            case 1:
                if (deviceObj.longitude == null || deviceObj.latitude == null || deviceObj.longitude == undefined || deviceObj.latitude == undefined) {
                    isLoding = -1;//不加载
                    break;
                }
                var m = gpsTransMercator(deviceObj.longitude, deviceObj.latitude);
                x = m.mx;
                y = m.my;
                break;
            case 2:
                if (deviceObj.local_longitude == null || deviceObj.local_latitude == null || deviceObj.local_longitude == undefined || deviceObj.local_latitude == undefined)
                {
                    isLoding = -1;//不加载
                    break;
                }
                x = Number(deviceObj.local_latitude) * Number(supermap25Dhigh);
                y = Number(supermap25Dmultiple) - Number(deviceObj.local_longitude) *Number(supermap25Dhigh);
                break;
            case 3:
                if (deviceObj.longitude == null || deviceObj.latitude == null || deviceObj.longitude == undefined || deviceObj.latitude == undefined) {
                    isLoding = -1;//不加载
                    break;
                }
                var m = gpsTransMercator(deviceObj.longitude, deviceObj.latitude);
                x = m.mx;
                y = m.my;
                break;
            default:
                alert("地图类型错误，报错方法getAllDevice()请查看错误参数。");
                break;
        }
        if (isLoding == -1) { continue;}//判断是否加载
        var device_type = deviceObj.device_type;
        var is_inbuilding = deviceObj.is_inbuilding;
        if (is_inbuilding == -1) {//判断为楼外的设备
            //创建marker
            var icon = deviceObj.normal_image;
            var size = new SuperMap.Size(15.15, 23);
            var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 1.1));
            var eicon = new SuperMap.Icon(icon, size, offset);
            eicon.imageDiv.text = deviceObj.device_name;
            eicon.imageDiv.title = deviceObj.device_name;
            var deviceMarker = new SuperMap.Marker(new SuperMap.LonLat(Number(x), Number(y)), eicon);

            //给marker赋属性
            deviceMarker.id = deviceObj.id;//主键
            deviceMarker.device_code = deviceObj.device_code; //设备编号
            deviceMarker.is_parts = deviceObj.is_parts; //复合设备
            deviceMarker.device_name = deviceObj.device_name; //设备名称
            deviceMarker.device_type = deviceObj.device_type; //设备类型
            deviceMarker.subsystem_id = deviceObj.subsystem_id; //子系统编号
            deviceMarker.longitude = deviceObj.longitude; //经度
            deviceMarker.latitude = deviceObj.latitude; // 纬度
            deviceMarker.register_time = deviceObj.register_time; //注册时间
            deviceMarker.search_code = deviceObj.search_code; //设备搜索缩写
            deviceMarker.x = x;//墨卡托坐标x
            deviceMarker.y = y;//墨卡托坐标y
            deviceMarker.local_longitude = deviceObj.local_longitude;//本地X轴（经度）
            deviceMarker.local_latitude = deviceObj.local_latitude;//本地Y轴（纬度）
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
            deviceMarker.etx1 = deviceObj.ext1;//及时回放
            deviceMarker.etx2 = deviceObj.ext2;//多路播放
            deviceMarker.etx3 = deviceObj.ext3;//上大墙
            deviceMarker.etx4 = deviceObj.ext4;//历史回放
            deviceMarker.defined_device_typeid = deviceObj.defined_device_typeid;//自定义设备类型id
            deviceMarker.defined_device_name = deviceObj.defined_device_name;//自定义设备类型名称
            deviceMarker.active_image = deviceObj.active_image;//设备显示图标
            deviceMarker.unactive_image = deviceObj.unactive_image;//设备隐藏图标
            deviceMarker.normal_image = deviceObj.normal_image;//正常图标
            deviceMarker.error_image = deviceObj.error_image;//错误图标
            deviceMarker.flash_image = deviceObj.flash_image;//闪光图标
            deviceMarker.popup_image = deviceObj.popup_image;//设备弹出图片
            deviceMarker.pid = deviceObj.pid;//自定义设备类型pid

            deviceMarker.events.on({
                "mousemove": function () {
                    this.icon.imageDiv.title = deviceObj.device_name;
                    this.icon.imageDiv.title = deviceObj.device_name;
                },
                "rightclick": deviceRightPopup,
                "scope": deviceMarker
            });
            markers.addMarker(deviceMarker);



            ////测试
            //var icon = "../scripts/js/map/mapRootJS/SuperMap/theme/images/cluster4.png";
            //var size = new SuperMap.Size(12, 12);
            //var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 2));
            //var eicon = new SuperMap.Icon(icon, size, offset);
            //var deviceMarker1 = new SuperMap.Marker(new SuperMap.LonLat(Number(x), Number(y)), eicon);
            //markers.addMarker(deviceMarker1);
        }
    }
}


//设置marker图标，在注册成功之后，加载新注册的点位
function SetMarkerIcon(iconName, options) {
    var latlngStr = $("#lonLat").val().split(',');//获取隐藏域上坐标的值，是双击moveMarker传上去的
    var latlng = [latlngStr[0], latlngStr[1]];
    var lat = latlngStr[0];
    var lon = latlngStr[1];
    var m = gpsTransMercator(lon, lat);
    var x = m.mx;
    var y = m.my;
    var icon = iconName;
    var size = new SuperMap.Size(15.15, 23);
    var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 1.1));
    var eicon = new SuperMap.Icon(icon, size, offset);
    eicon.imageDiv.text = options.device_name;
    eicon.imageDiv.title = options.device_name;
    var deviceMarker = new SuperMap.Marker(new SuperMap.LonLat(Number(x), Number(y)), eicon);

    deviceMarker.events.on({
        "mousemove": function () {
            this.icon.imageDiv.title = options.device_name;
            this.icon.imageDiv.text = options.device_name;
        },
        "rightclick": deviceRightPopup,
        "scope": deviceMarker
    });
    deviceMarker.id = options.id;//主键
    deviceMarker.device_code = options.device_code; //设备编号
    deviceMarker.is_parts = options.is_parts; //复合设备
    deviceMarker.device_name = options.device_name; //设备名称
    deviceMarker.device_type = options.device_type; //设备类型
    deviceMarker.subsystem_id = options.subsystem_id; //子系统编号
    deviceMarker.longitude = options.longitude; //经度
    deviceMarker.latitude = options.latitude; // 纬度
    deviceMarker.register_time = options.register_time; //注册时间
    deviceMarker.search_code = options.search_code; //设备搜索缩写
    deviceMarker.local_longitude = options.local_longitude;//本地X轴（经度）
    deviceMarker.local_latitude = options.local_latitude;//本地Y轴（纬度）
    deviceMarker.device_status = options.device_status;//设备状态
    deviceMarker.update_status_time = options.update_status_time;//状态修改时间
    deviceMarker.cover_range = options.cover_range;//覆盖角度
    deviceMarker.camera_towards = options.camera_towards;//设备朝向
    deviceMarker.visual_range = options.visual_range;//覆盖半径
    deviceMarker.asset_code = options.asset_code;//资产编号
    deviceMarker.org_id = options.org_id;//所属部门
    deviceMarker.manufactor = options.manufactor;//厂家
    deviceMarker.asset_model = options.asset_model;//型号
    deviceMarker.create_time = options.create_time;//出厂日期
    deviceMarker.guarantee_time = options.guarantee_time;//保修期
    deviceMarker.asset_status = options.asset_status;//资产状态
    deviceMarker.asset_ip = options.asset_ip;//ip地址
    deviceMarker.port = options.port;//端口
    deviceMarker.mac_code = options.mac_code;//mac地址
    deviceMarker.serial_number = options.serial_number;//序列号
    deviceMarker.manager_id = options.manager_id;//负责人ID
    deviceMarker.is_inbuilding = options.is_inbuilding;//是否在楼内
    deviceMarker.room_id = options.room_id;//房间号
    deviceMarker.region_id = options.region_id;//园区编号
    deviceMarker.area_id = options.area_id;//区域编号
    deviceMarker.ext1 = options.ext1;//及时回放
    deviceMarker.ext2 = options.ext2;//多路播放
    deviceMarker.ext3 = options.ext3;//上大墙
    deviceMarker.ext4 = options.ext4;//历史回放
    deviceMarker.normal_image = iconName;//添加marker成功后，传过来的icon的地址，在修改时候取消修改，可恢复到修改前的,这个不是数据库里面的字段
    if ($("#mapContainer").attr("currentMapType") == 3) {//如果注册的是楼内图，就放在楼内图的featureGroup中去
        markers.addMarker(deviceMarker);
        //deviceMarker.addTo(floorDeviceLayerGroup);
    }
    else if ($("#mapContainer").attr("currentMapType") == 1) {//二维/2.5D就放到对应的featureLayer中去
        markers.addMarker(deviceMarker);
    }
}
//地图上设备右键的修改事件
function UpdateMarker() {
    if (MoveVectorLayer.features.length == 0) {
        switch (Number($("#mapContainer").attr("currentMapType"))) {
            case 1:
                operationControl = 2;//2D设备修改
                break;
            case 2:
                operationControl = 4;//2.5D设备修改
                break;
            case 3:
                operationControl = 6;//2D楼内设备修改
                break;
            default:
                break;
        }

        closeInfoWin();
        $("#deviceRegisterPopup").hide();
        MoveVectorLayer.removeAllFeatures();//清除移动图层数据
        gmarker = selemarker;//修改时间点位
        //在原设备上打点位
        var p = gmarker.getLonLat();//地图上弹窗显示的位置
        //var offset = new SuperMap.Pixel(p.lon / 3, p.lat / 3);
        //var lcxlcy = csm.mapContainer.getLonLatFromPixel(offset);
        //var point = new SuperMap.Geometry.Point(lcxlcy.lon, lcxlcy.lat);
        var point = new SuperMap.Geometry.Point(p.lon, p.lat);//(lcxlcy.lon, lcxlcy.lat);
        //var dx = 10 * Math.random();
        //var dy = 10 * Math.random();
        //point.move(dx, dy);
        //var point = new SuperMap.Geometry.Point(mapcenterarr[0], mapcenterarr[1]);
        var style = {
            externalGraphic: "../scripts/js/map/mapRootJS/SuperMap/theme/images/cluster2.png",
            graphicWidth: 41,
            graphicHeight: 46,
            graphicXOffset: -(41/2.4),
            graphicYOffset: -(46/1.1)
        };
        featureMove = new SuperMap.Feature.Vector();
        featureMove.geometry = point;
        featureMove.style = style;
        MoveVectorLayer.addFeatures(featureMove);
        csm.dragFeature.activate(); //拖拽控件
        csm.selectFeature.activate();//选择事件，双击
        markers.removeMarker(gmarker);//清除marker图标
    }
    else {
        //hideRegisterPopup();
        closeInfoWin();
        if (operationControl == 2 || operationControl == 4 || operationControl == 6) {
            markers.addMarker(gmarker);
        }
        switch (Number($("#mapContainer").attr("currentMapType"))) {
            case 1:
                operationControl = 2;//2D设备修改
                break;
            case 2:
                operationControl = 4;//2.5D设备修改
                break;
            case 3:
                operationControl = 6;//2D楼内图设备修改
                break;
            default:
                break;
        }
        $("#deviceRegisterPopup").hide();
        MoveVectorLayer.removeAllFeatures();//清除移动图层数据
        gmarker = selemarker;//修改时间点位
        //在原设备上打点位
        var p = gmarker.getLonLat();//地图上弹窗显示的位置
        var point = new SuperMap.Geometry.Point(p.lon, p.lat);//(lcxlcy.lon, lcxlcy.lat);
        //var dx = 10 * Math.random();
        //var dy = 10 * Math.random();
        //point.move(dx, dy);
        //var point = new SuperMap.Geometry.Point(mapcenterarr[0], mapcenterarr[1]);
        var style = {
            externalGraphic: "../scripts/js/map/mapRootJS/SuperMap/theme/images/cluster2.png",
            graphicWidth: 41,
            graphicHeight: 46,
            graphicXOffset: -(41 / 2.4),
            graphicYOffset: -(46 / 1.1)
        };
        featureMove = new SuperMap.Feature.Vector();
        featureMove.geometry = point;
        featureMove.style = style;
        MoveVectorLayer.addFeatures(featureMove);
        csm.dragFeature.activate(); //拖拽控件
        csm.selectFeature.activate();//选择事件，双击

        //CURRENT_UPDATE_MARKER = e.relatedTarget;
        //CURRENT_UPDATE_MARKER.dragging.enable();
        //CURRENT_UPDATE_MARKER.setIcon(L.icon({ iconUrl: "../scripts/js/map/mapRootJS/Leaflet_1.0/images/marker-icon.png", iconSize: [15.15, 23] }))

        //CURRENT_UPDATE_MARKER.on('dblclick', function (e) {
        //    if ($("#mapContainer").attr("currentMapType") == 2) {//2.5维
        //        oldOptions.local_longitude = e.latlng.lng;
        //        oldOptions.local_latitude = e.latlng.lat;
        //    }
        //    else {//2维或者楼内图
        //        oldOptions.longitude = e.latlng.lng;
        //        oldOptions.latitude = e.latlng.lat;
        //    }

        markers.removeMarker(gmarker);//清除marker图标
    }
}

//关闭2D设备修改窗口
function cancelUpdate() {
    MoveVectorLayer.removeAllFeatures();//清除移动图层数据
    markers.addMarker(gmarker);

}

//当更新弹窗确认时候的地图事件
function updateConfirm(newOptions) {
    var x = "";
    var y = "";
    switch (Number($("#mapContainer").attr("currentMapType"))) {
        case 1://2D 
            var m = gpsTransMercator(newOptions.longitude, newOptions.latitude);
            x = m.mx;
            y = m.my;
            break;
        case 2://2.5D
            if (newOptions.local_longitude == null || newOptions.local_latitude == null) {
                alert("修改2.5D地图设备信息错误，报错方法为：updateConfirm(),其中local_longitude或是local_latitude值为空！");
                is_Loading = -1;
                break;
            }
            x = Number(newOptions.local_latitude) * Number(supermap25Dhigh);
            y = Number(supermap25Dmultiple) - Number(newOptions.local_longitude) * Number(supermap25Dhigh);
            break;
        case 3://2D楼内
            var m = gpsTransMercator(newOptions.longitude, newOptions.latitude);
            x = m.mx;
            y = m.my;
            break;
        default:
            break;
    }

    var device_type = newOptions.device_type;
    var is_inbuilding = newOptions.is_inbuilding;
    //if (is_inbuilding == is_Loading) {//判断为楼外的设备
        //创建marker
        var icon = gmarker.normal_image;
        var size = new SuperMap.Size(15.15, 23);
        var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 1.1));
        var eicon = new SuperMap.Icon(icon, size, offset);
        eicon.imageDiv.text = newOptions.device_name;
        eicon.imageDiv.title = newOptions.device_name;
        var deviceMarker = new SuperMap.Marker(new SuperMap.LonLat(Number(x), Number(y)), eicon);

        deviceMarker.events.on({
            "mousemove": function () {
                this.icon.imageDiv.title = newOptions.device_name;
                this.icon.imageDiv.text = newOptions.device_name;
            },
            "rightclick": deviceRightPopup,
            "scope": deviceMarker
        });
        //给marker赋属性
        //更新地图上当前修改的marker的属性
        deviceMarker.id = newOptions.id;//主键
        deviceMarker.device_code = newOptions.device_code; //设备编号
        deviceMarker.is_parts = newOptions.is_parts; //复合设备
        deviceMarker.device_name = newOptions.device_name; //设备名称
        deviceMarker.device_type = newOptions.device_type; //设备类型
        deviceMarker.subsystem_id = newOptions.subsystem_id; //子系统编号
        deviceMarker.longitude = newOptions.longitude; //经度
        deviceMarker.latitude = newOptions.latitude; // 纬度
        deviceMarker.register_time = newOptions.register_time; //注册时间
        deviceMarker.search_code = newOptions.search_code; //设备搜索缩写
        deviceMarker.local_longitude = newOptions.local_longitude;//本地X轴（经度）
        deviceMarker.local_latitude = newOptions.local_latitude;//本地Y轴（纬度）
        deviceMarker.device_status = newOptions.device_status;//设备状态
        deviceMarker.update_status_time = newOptions.update_status_time;//状态修改时间
        deviceMarker.cover_range = newOptions.cover_range;//覆盖角度
        deviceMarker.camera_towards = newOptions.camera_towards;//设备朝向
        deviceMarker.visual_range = newOptions.visual_range;//覆盖半径
        deviceMarker.asset_code = newOptions.asset_code;//资产编号
        deviceMarker.org_id = newOptions.org_id;//所属部门
        deviceMarker.manufactor = newOptions.manufactor;//厂家
        deviceMarker.asset_model = newOptions.asset_model;//型号
        deviceMarker.create_time = newOptions.create_time;//出厂日期
        deviceMarker.guarantee_time = newOptions.guarantee_time;//保修期
        deviceMarker.asset_status = newOptions.asset_status;//资产状态
        deviceMarker.asset_ip = newOptions.asset_ip;//ip地址
        deviceMarker.port = newOptions.port;//端口
        deviceMarker.mac_code = newOptions.mac_code;//mac地址
        deviceMarker.serial_number = newOptions.serial_number;//序列号
        deviceMarker.manager_id = newOptions.manager_id;//负责人ID
        deviceMarker.is_inbuilding = newOptions.is_inbuilding;//是否在楼内
        deviceMarker.room_id = newOptions.room_id;//房间号
        deviceMarker.region_id = newOptions.region_id;//园区编号
        deviceMarker.area_id = newOptions.area_id;//区域编号
        deviceMarker.ext1 = newOptions.ext1;//及时回放
        deviceMarker.ext2 = newOptions.ext2;//多路播放
        deviceMarker.ext3 = newOptions.ext3;//上大墙
        deviceMarker.ext4 = newOptions.ext4;//历史回放
        deviceMarker.normal_image = gmarker.normal_image//这个不是数据库里面的字段,是根据设备类型的id直接取出设备图标的完整路径，方便用
        //deviceMarker.bindTooltip(deviceMarker.device_name);
        //deviceMarker.iconName = normalImage[device_type]; //这个不是数据库里面的字段,是根据设备类型的id直接取出设备图标的完整路径，方便用
        //将marker添加到图层里面去
        //deviceMarkerFeatureGroup.addLayer(deviceMarker);
        //alert(deviceMarker.isDrawn());
        markers.addMarker(deviceMarker);
    //}
    MoveVectorLayer.removeAllFeatures();//清除移动图层数据

    ////设置不可拖拽
    //deviceMarker.dragging.disable();
    ////将修改的marker的图标由水滴恢复之前图标
    //deviceMarker.setIcon(L.icon({ iconUrl: deviceMarker.normal_image, iconSize: [15.15, 23] }));
    ////万一更改名字了，也重新更新名字
    //deviceMarker.setTooltipContent(deviceMarker.device_name);
    ////注销掉双击事件
    //deviceMarker.off('dblclick');
    //deviceMarker = null;
}

//地图上设备右键的删除事件
function DeleteMarker() {
    closeInfoWin();
    if (!confirm("确定要将此设备删除吗？")) {
        //MoveVectorLayer.removeAllFeatures();//清除移动图层数据
        return;
    }
    //$("#deviceRegisterPopup").hide();
    dmarker = selemarker;
    var isDelete = deleteDevice(dmarker.device_code);//清除设备信息方法在registerDevice中
    if (isDelete == true) {//判断是否清除成功
        //if ($("#mapContainer").attr("currentMapType") == 3) {//判断是否为楼内图
        //    markers.removeMarker(dmarker);//清除marker图标
        //    dmarker = null;
        //    // floorDeviceLayerGroup.removeLayer(currentMarker);
        //}
        //else {
            markers.removeMarker(dmarker);//清除marker图标
            dmarker = null;
        //}
    }
    else {
        return;
    }
}

//地图上设备图标的右键弹窗
function deviceRightPopup() {
    closeInfoWin();//关闭前面的窗口
    //组织需要嵌入的HTML字符串表达 
    selemarker = this;
    var contentHTML = '<div class="ball-frame rightball">';
    contentHTML += ' <div><button class="btn btn-default" onclick="UpdateMarker();">修改</button></div>';
    contentHTML += '<div><button class="btn btn-default"  onclick="DeleteMarker();">删除</button></div></div>';
    var lonLat = selemarker.getLonLat();//csm.mapContainer.getCenter();
    var popwin = new SuperMap.Popup.Anchored("chicken",
    lonLat,
    new SuperMap.Size(120, 50),
    contentHTML,
    null,
    false,
    null);
    infowin = popwin;
    //if (popwin) csm.mapContainer.removePopup(popwin);
    csm.mapContainer.addPopup(popwin);

}


//2/2.5维切换时，切换树
function RegiterSwitchMap(switchMapType) {
    isClickFloor = false;
    MoveVectorLayer.removeAllFeatures();//清除移动图层数据
    switch (switchMapType) {
        case 1://2Dnew SuperMap.LonLat(12952244.61, 4860210.88)

            markers.clearMarkers();
            csm.mapContainer.setBaseLayer(csm.baseMap);
            csm.mapContainer.setCenter(csm.center, 2);
            csm.baseMap.setVisibility(true);
            if (csm.baseMap25D != null) { csm.baseMap25D.setVisibility(false); }
            //csm.baseMap25D.setVisibility(false);
            csm.mapContainer.zoomTo(3);
            $("#mapContainer").attr("currentMapType", 1);
            $(".mainMapSwicth").css({ "background-image": "url(../style/base/images/public/map/3wei-hover.png)" });
            $("#mapContainer").attr("currentMapType", 1);
            $("#doubleTree").hide(); //隐藏树的切换按钮
            $(".custom").hide();//隐藏楼内图的树的div
            $(".control").show();//显示设备的树的div
            LoadDeviceListTree();//加载设备的树
            getAllDevice();//获取所有设备
            
            break;
        case 2://25Dnew SuperMap.LonLat(3000.0, 2121.5)
            if (!Map25DConfig) {
                alert("未配置2.5D地图参数，请配置后再访问！");
                return;
            }
            markers.clearMarkers();
            add25DBaseMap();
            //csm.mapContainer.setBaseLayer(csm.baseMap25D);
            //csm.mapContainer.setCenter(csm.mapCenter25D, 3);
            //csm.baseMap.setVisibility(false);
            //csm.baseMap25D.setVisibility(true);
            $("#mapContainer").attr("currentMapType", 2);
            $(".mainMapSwicth").css({ "background-image": "url(../style/base/images/public/map/2wei-hover.png)" });
            $("#doubleTree").hide(); //隐藏树的切换按钮
            $(".custom").hide();//隐藏楼内图的树的div
            $(".control").show();//显示设备的树的div
            LoadDeviceListTree25D();//加载25D设备注册的树
            //getAllDevice();//获取所有设备
            break;
        case 3://楼内图

            markers.clearMarkers();
            $("#doubleTree").show();//显示树的切换按钮
            $(".custom").show();//显示楼内图的树的div
            $(".control").hide();//隐藏设备的树的div
            LoadDeviceListTree();//加载设备的树
            loadBuildingTree();//加载楼内图的树
            $("#mapContainer").attr("currentMapType", 3);
            $(".mainMapSwicth").css({ "background-image": "url(../style/base/images/public/map/louneitu.png)" });
            //getAllDevice();//获取所有设备
            break;
        default:
            break;

    }
}

//楼内图设备注册树的双击事件
function treeNodeDblClick(floorinfo) {
    markers.clearMarkers();
    var bl = false;
    for (var i = 0; i < mapsdata.length; i++) {
        if (mapsdata[i].additions != null && mapsdata[i].additions != undefined && mapsdata[i].additions.length > 0) {
            if (mapsdata[i].additions[0] == floorinfo.floor_src_2d)//floorinfo.building_id + "@" +
            {
                csm.serverBuildingUrl = mapsdata[i].url + "/maps/" + mapsdata[i].additions[0];
                bl = true;
            }
        }
    }

    if (!bl) {
        alert("没有找到服务名为：" + floorinfo.floor_src_2d + ",楼编号为：" + floorinfo.building_id + "的楼层地图服务，请检查楼层配置是否正常！");
        return;
    }
    //把左下右上坐标转换为中心点位
    var centerxy = swAndneToCenter(floorinfo.point1, floorinfo.point2);
    //创建楼层中心点位坐标
    center_floor = new SuperMap.LonLat(centerxy.x, centerxy.y);

    floorid = floorinfo.id;//楼层id
    //加载楼地图
    addMapBuilding();


}

//添加楼内图图层
function addMapBuilding() {
    if (csm.baseMapBuilding != null && csm.baseMapBuilding != undefined) {
        csm.mapContainer.removeLayer(csm.baseMapBuilding);
    }
    //if (csm.markers != null && csm.markers != undefined) {
    //    csm.mapContainer.removeLayer(csm.markers);
    //}
    //if (csm.MoveLayer != null && csm.MoveLayer != undefined) {
    //    csm.mapContainer.removeLayer(csm.MoveLayer);
    //}
    //csm.markers = new SuperMap.Layer.Markers("BuildingMarkers"); //添加的markers图层
    //csm.MoveLayer = new SuperMap.Layer.Vector("BuildingMoveLayer"); //声明一个一个矢量图层MoveVectorLayer控件，来呈现设备注册的移动点位 
    ////选择事件回调
    //var bcallbacks = {////双击回调事件
    //    dblclick: function (currentFeature) {
    //        if (featureMove == null) {
    //            alert("获取标记位置失败！请检查超图配置！");
    //            return;
    //        }
    //    }
    //};
    ////选择事件
    //csm.bselectFeature = new SuperMap.Control.SelectFeature(csm.MoveLayer, {
    //    callbacks: bcallbacks,
    //    hover: false
    //});
    ////拖动事件
    //csm.dragFeature = new SuperMap.Control.DragFeature(MoveVectorLayer, {//拖动事件
    //    // "onDrag": clearRegisterPopup,
    //    //"onComplete": addDevicesClick
    //});
    //csm.mapContainer.addControl([csm.dragFeature, csm.bselectFeature]);

    csm.baseMapBuilding = new SuperMap.Layer.TiledDynamicRESTLayer("districtB", csm.serverBuildingUrl, { transparent: true, cacheEnabled: true });
    //监听图层信息加载完成事件
    csm.baseMapBuilding.events.on({ "layerInitialized": addMapLayerBuilding });

}
//楼内图添加事件 ,csm.markers, csm.MoveLayer
function addMapLayerBuilding() {
    csm.mapContainer.addLayers([csm.baseMapBuilding]);
    csm.mapContainer.setBaseLayer(csm.baseMapBuilding);
    csm.mapContainer.setCenter(center_floor, 3);//new SuperMap.LonLat(12983451.14, 4855707.47), 3);
    csm.baseMap.setVisibility(false);
    if (csm.baseMap25D!=null){ csm.baseMap25D.setVisibility(false);}   
    csm.baseMapBuilding.setVisibility(true);
    //放大级别2
    csm.mapContainer.zoomTo(1);
    csm.mapContainer.setLayerIndex(csm.baseMapBuilding, 0);
    addFloorDevice();
}


//根据楼内图的id添加楼层对应的设备
function addFloorDevice() {

    var AllDeviceInfoNew = null;
    $.ajax({
        url: "/Config/GetAllDeviceInfo",
        type: "post", //这里是http类型
        data: {"regionID": regionID},
        dataType: "json", //传回来的数据类型
        async: false,
        success: function (data) {
            if (data.status == 1) {
                alert("获取已注册设备错误："+data.msg);
                return;
            } else {
                AllDeviceInfoNew = data.msg;
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("获取地图上已注册设备出现" + XMLHttpRequest.status + "错误请联系管理员！");
        }
    });


    for (var i = 0; i < AllDeviceInfoNew.length; i++) {
        var deviceObj = AllDeviceInfoNew[i];
        //只有下面三个属性提取了，才能创建marker
       // var latitude = deviceObj.latitude;
       // var longitude = deviceObj.longitude;
        // var device_type = deviceObj.device_type;normal_image && 
        var isLoding = 0;//判断是否加载
        var normal_image = deviceObj.normal_image;
        var is_inbuilding = deviceObj.is_inbuilding;
        if (is_inbuilding == floorid) {

            if (deviceObj.longitude == null || deviceObj.latitude == null || deviceObj.longitude == undefined || deviceObj.latitude == undefined) {
                isLoding = -1;//不加载
                break;
            }
            var m = gpsTransMercator(deviceObj.longitude, deviceObj.latitude);
            x = m.mx;
            y = m.my;
            var x;
            var y;
            
            //var deviceObj = AllDeviceInfo[i];
            //var device_type = deviceObj.device_type;
            //var is_inbuilding = deviceObj.is_inbuilding;
            if (isLoding >= 0) {
                //创建marker
                var icon = deviceObj.normal_image;
                var size = new SuperMap.Size(15.15, 23);
                var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 1.1));
                var eicon = new SuperMap.Icon(icon, size, offset);
                eicon.imageDiv.text = deviceObj.device_name;
                eicon.imageDiv.title = deviceObj.device_name;
                var deviceMarker = new SuperMap.Marker(new SuperMap.LonLat(Number(x), Number(y)), eicon);

                deviceMarker.events.on({
                    "mousemove": function () {
                        this.icon.imageDiv.title = deviceObj.device_name;
                        this.icon.imageDiv.text = deviceObj.device_name;
                    },
                    "rightclick": deviceRightPopup,
                    "scope": deviceMarker
                });
                //给marker赋属性
                deviceMarker.id = deviceObj.id;//主键
                deviceMarker.device_code = deviceObj.device_code; //设备编号
                deviceMarker.is_parts = deviceObj.is_parts; //复合设备
                deviceMarker.device_name = deviceObj.device_name; //设备名称
                deviceMarker.device_type = deviceObj.device_type; //设备类型
                deviceMarker.subsystem_id = deviceObj.subsystem_id; //子系统编号
                deviceMarker.longitude = deviceObj.longitude; //经度
                deviceMarker.latitude = deviceObj.latitude; // 纬度
                deviceMarker.register_time = deviceObj.register_time; //注册时间
                deviceMarker.search_code = deviceObj.search_code; //设备搜索缩写
                deviceMarker.x = x;//墨卡托坐标x
                deviceMarker.y = y;//墨卡托坐标y
                deviceMarker.local_longitude = deviceObj.local_longitude;//本地X轴（经度）
                deviceMarker.local_latitude = deviceObj.local_latitude;//本地Y轴（纬度）
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
                deviceMarker.etx1 = deviceObj.ext1;//及时回放
                deviceMarker.etx2 = deviceObj.ext2;//多路播放
                deviceMarker.etx3 = deviceObj.ext3;//上大墙
                deviceMarker.etx4 = deviceObj.ext4;//历史回放
                deviceMarker.defined_device_typeid = deviceObj.defined_device_typeid;//自定义设备类型id
                deviceMarker.defined_device_name = deviceObj.defined_device_name;//自定义设备类型名称
                deviceMarker.active_image = deviceObj.active_image;//设备显示图标
                deviceMarker.unactive_image = deviceObj.unactive_image;//设备隐藏图标
                deviceMarker.normal_image = deviceObj.normal_image;//正常图标
                deviceMarker.error_image = deviceObj.error_image;//错误图标
                deviceMarker.flash_image = deviceObj.flash_image;//闪光图标
                deviceMarker.popup_image = deviceObj.popup_image;//设备弹出图片
                deviceMarker.pid = deviceObj.pid;//自定义设备类型pid
                markers.addMarker(deviceMarker);
            }

        }
    }
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
        closeInfoWin();
    });
});

//关闭右键菜单
function closeInfoWin() {
    if (infowin) {
        try {
            infowin.hide();
            infowin.destroy();
        }
        catch (e) { }
    }

}

//读取地图的配置，加载地图
function getMapConfig() {
    var configData = null;
    $.ajax({
        url: "/Map/getMapConfig",
        type: "post",
        datatype: "json",
        async: false,
        success: function (data) {
            configData = data;
        }
    });
    return configData;
}
//获取地图类型
function getCurrentMapType() {
    var mapType = null;
    $.ajax({
        url: "/Map/getMapType",
        type: "post",
        datatype: "json",
        async: false,
        success: function (data) {
            mapType = data;
        }
    });
    return mapType;
}
//读取地图配置
function readConfig() {
    var configList = getMapConfig();
    var currentMapType = getCurrentMapType();
    var center;
    var bound;
    var mapurl;
    for (var i = 0; i < configList.length; i++) {
        if (configList[i].map_engine == currentMapType && configList[i].map_type == 1) {
            bound = configList[i].map_bounds;
            center = configList[i].map_center;
            mapurl = configList[i].map_src;
            break;
        }
    }
    if (bound) {
        csm.southwest = bound.split('|')[0];
        csm.northeast = bound.split('|')[1];
    }
    if (center) {
        csm.center = center;
    }
    if (mapurl) {
        csm.serverUrl = mapurl;
    }
    csm.southwest = [csm.southwest.split(',')[0], csm.southwest.split(',')[1]];
    csm.northeast = [csm.northeast.split(',')[0], csm.northeast.split(',')[1]];
    csm.center = [center.split(',')[0], center.split(',')[1]];
}


//将经纬度坐标转换为墨卡托平面坐标
function gpsTransMercator(lon, lat) {
    var mx, my;
    lon = Number(lon);
    lat = Number(lat);
    mx = lon * 20037508.3427892 / 180;
    my = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    my = my * 20037508.3427892 / 180;
    //mx = Math.abs(mx);
    //my = Math.abs(my);
    var m = { "mx": mx, "my": my };
    return m;
}
//将墨卡托平面坐标转换为经纬度
function Mercator2latlng(x, y) {
    var lat, lon;
    x = Number(x);
    y = Number(y);
    lon = x / 20037508.3427892 * 180;
    lat = y / 20037508.3427892 * 180;
    lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
    var lonlat = { "lon": lon, "lat": lat };
    return lonlat;
}

//获取超图发布的所有rest服务
function getAllBuildingUrl() {
    var a = "";
    $.get(urll, function (data) {

        for (var i = 0; i < data.length; i++) {
            if (data == null) {
                alert("getBuildingUrl()方法请求超图服务失败！请检查超图服务是否正常开启！");
            }
            if (data[i].interfaceType == "com.supermap.services.rest.RestServlet") {
                var datanew = data[i];
                mapsdata.push(datanew);
            }
        }
    });
}

//左下右上坐标转换为中心点坐标
function swAndneToCenter(southwest, northeast) {
    var center_x = (Number(northeast.split(',')[0]) - Number(southwest.split(',')[0])) / 2 + Number(southwest.split(',')[0]);
    var center_y = (Number(northeast.split(',')[1]) - Number(southwest.split(',')[1])) / 2 + Number(southwest.split(',')[1]);
    var center = { "x": center_x, "y": center_y };
    return center;
}
//读取2D配置
function readMap2DConfig() {

    var bound = Map2DConfig.map_bounds;
    var center = Map2DConfig.map_center;
    var mapurl = Map2DConfig.map_src;
    if (bound) {
        csm.southwest = bound.split('|')[0];
        csm.northeast = bound.split('|')[1];
    }
    if (center) {
        csm.center = new SuperMap.LonLat(center.split(',')[0], center.split(',')[1]);
    }
    if (mapurl) {
        csm.serverUrl = mapurl;
    }
}

//读取2.5D配置
function readMap25DConfig() {
    if (!Map25DConfig) {
        $(".erwei2").hide();
        return;
    }
    else {
        $(".erwei2").show();
        var bound = Map25DConfig.map_bounds;
        var center = Map25DConfig.map_center;
        var mapurl = Map25DConfig.map_src;
        if (bound) {
            csm.southwest25D = bound.split('|')[0];
            csm.northeast25D = bound.split('|')[1];
        }
        if (center) {
            csm.mapCenter25D = new SuperMap.LonLat(center.split(',')[0], center.split(',')[1]);
        }
        if (mapurl) {
            csm.serverUrl25D = mapurl;
        }
    }
}