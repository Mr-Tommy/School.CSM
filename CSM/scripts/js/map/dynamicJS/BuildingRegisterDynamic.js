﻿/// <reference path="../superMapJS/mapRegisterBuilding.js" />
/// <reference path="../superMapJS/mapRegisterBuilding.js" />
/// <reference path="../superMapJS/mapRegisterBuilding.js" />
switch (NowMapType) {
    case 1: //超图 
        //超图原生的js
        //document.write('<script src="http:///support.supermap.com.cn:8090/iserver/iClient/forJavaScript/libs/SuperMap.Include.js"><\/script>');//超图线上的脚本8.1版
        document.write('<script src="../scripts/js/map/mapRootJS/SuperMap-8.1.1-14426/libs/SuperMap.Include.js"><\/script>');//本地8.1的版本
        //document.write('<script src="../scripts/js/map/mapRootJS/SuperMap/libs/SuperMap.Include.js"><\/script>');//本地的版本
        //document.write('<link href="../style/base/css/src/bootstrap-multiselect.css" rel="stylesheet" \/>');
        document.write('<link href="../style/base/css/src/bootstrap-multiselect.css" rel="stylesheet" \/>');
        document.write('<script src="../scripts/js/frames/bootstrap-multiselect.js"><\/script>');
        document.write('<script src = "../scripts/js/map/superMapJS/mapRegisterBuilding.js" ><\/script>');//超图区域注册
        document.write('<script src = "../scripts/js/map/superMapJS/toPinYin.js" ><\/script>');//中文转换拼音公共方法
        break;
    case 2: //leaflet
        //leaflet原生的js和css样式
        document.write('<script src="../scripts/js/map/mapRootJS/Leaflet_1.0/leaflet.js"><\/script>');
        document.write('<link href="../scripts/js/map/mapRootJS/Leaflet_1.0/leaflet.css" rel="stylesheet" />');
        //leaflet右键菜单的插件
        document.write('<script src="../scripts/js/map/mapRootJS/LeafletContextMenu/leaflet.contextmenu.js"><\/script>');
        document.write('<link href="../scripts/js/map/mapRootJS/LeafletContextMenu/leaflet.contextmenu.css" rel="stylesheet" />');
        //业务相关的js
        document.write('<script src="../scripts/js/map/leafletMapJS/mapRegisterBuilding.js"><\/script>');
        document.write('<link href="../style/base/css/popup.css" rel="stylesheet" />');
        break;
    default:
        break;

}