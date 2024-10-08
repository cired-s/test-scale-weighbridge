// 初始化 Leaflet 地圖，中心點設為台灣 (可以根據需求調整經緯度)
const map = L.map('map').setView([25.03236, 121.51813], 10);

// 設定地圖圖層，這裡使用 OpenStreetMap 圖層
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 創建兩個 LayerGroup：一個是磅秤資訊，另一個是地磅資訊
const scaleLayer = L.layerGroup().addTo(map);
const storeLayer = L.layerGroup().addTo(map);

// 定義自定義的圖示
const greenIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-green.png',  // 這裡你需要提供一個綠色圖示的 URL預設為地秤圖
    iconSize: [25, 41], // 標記圖示的大小
    iconAnchor: [12, 41], // 標記的錨點位置
    popupAnchor: [1, -34], // 彈出視窗的錨點位置
});

const blueIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-blue.png',  // 這裡你需要提供一個藍色圖示的 URL預設為磅秤圖
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const redIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-red.png',  // 這裡你需要提供一個紅色圖示的 URL預設為不合格圖
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// 計算磅秤和地磅的數量
let scaleCount = 0;
let storeCount = 0;

// 自定義控制器來顯示磅秤和地磅數量
const infoControl = L.control({ position: 'bottomright' });

infoControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-control-info');
    div.innerHTML = `<b>磅秤數量:</b> ${scaleCount}<br><b>地秤數量:</b> ${storeCount}`;
    return div;
};

// 將控制器添加到地圖
infoControl.addTo(map);

// 更新數量顯示
function updateInfoControl() {
    const infoDiv = document.querySelector('.leaflet-control-info');
    if (infoDiv) {
        infoDiv.innerHTML = `<b>磅秤數量:</b> ${scaleCount}<br><b>地秤數量:</b> ${storeCount}`;
    }
}

// 初始化時更新控制欄框
updateInfoControl();

//
// 變量來控制是否啟動路徑規劃
let isRoutePlanningEnabled = false;

// 記錄選中的兩個位置
let selectedPoints = [];
let routeLayer = L.layerGroup().addTo(map);

// 添加一個按鍵來啟動路徑規劃功能
const routeButton = L.control({ position: 'topleft' });
routeButton.onAdd = function(map) {
    const div = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom route-button');
    div.innerHTML = '啟動路徑規劃';
    div.style.backgroundColor = '#fff';
    div.style.border = '2px solid #ccc';
    div.style.cursor = 'pointer';
    div.style.padding = '5px';
    div.style.fontSize = '12px';

    // 點擊按鍵來啟動或禁用路徑規劃
    div.onclick = function() {
        isRoutePlanningEnabled = !isRoutePlanningEnabled;
        div.innerHTML = isRoutePlanningEnabled ? '停用路徑規劃' : '啟動路徑規劃';
        div.style.backgroundColor = isRoutePlanningEnabled ? '#f00' : '#fff';  // 改變按鍵顏色提示狀態
    };
    return div;
};
routeButton.addTo(map);

// 計算路徑的函數
function calculateRoute(start, end) {
    const osrmUrl = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    console.log(`Requesting route from ${start} to ${end}`);

    fetch(osrmUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Route data:', data);

            // 檢查 API 請求結果是否有路徑資料
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0].geometry;
                routeLayer.clearLayers();  // 清除之前的路徑
                const routeGeoJson = L.geoJSON(route).addTo(routeLayer);
                map.fitBounds(routeGeoJson.getBounds());
            } else {
                console.error('No route found between points.');
            }
        })
        .catch(error => {
            console.error('Error fetching route:', error);
        });
}

// 點擊標記後觸發
function onMarkerClick(markerLatLng) {
    if (isRoutePlanningEnabled) {
        selectedPoints.push(markerLatLng);
        console.log('Selected points:', selectedPoints);

        if (selectedPoints.length === 2) {
            // 計算並繪製路徑
            calculateRoute(selectedPoints[0], selectedPoints[1]);
            selectedPoints = [];  // 重置選中點
        }
    }
}


//
// 從 scale-data.json 讀取磅秤資料並在地圖上顯示
fetch('scale-data.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {

           // 將 "檢查合格與否" 強制轉換為字串並進行 trim 操作
            const checkResult = String(item.檢查合格與否).trim().toUpperCase();
            
            // 如果檢查結果是 "N"，使用紅色圖標，否則使用藍色圖標
            const markerIcon = checkResult === "N" ? redIcon : blueIcon;
            
            // 在磅秤圖層中標記每個磅秤的位置
            const scaleMarker = L.marker([item.latitude, item.longitude], { icon: markerIcon }).addTo(scaleLayer);

            // 為每個標記綁定 Popup，顯示磅秤資訊
            scaleMarker.bindPopup(`
                <h2>市場磅秤</h2>  <!-- 添加"市場磅秤"標題 -->
                <b>${item.店名}</b><br>
                廠牌: ${item.廠牌}<br>
                型式: ${item.型式}<br>
                器號: ${item.器號}<br>
                Max (kg): ${item.Max_kg}<br>
                e (g): ${item.e_g}<br>
                檢查日期: ${item.檢查日期}<br>
                檢查合格與否: ${item.檢查合格與否}<br>
                檢定日期: ${item.檢定日期}<br>
                檢定合格單號: ${item.檢定合格單號}
            `);
            scaleMarker.on('click', function () {
                onMarkerClick(scaleMarker.getLatLng()); 
            });
            scaleCount++;  // 計數
        });
        // 更新控制器數量顯示
        updateInfoControl();
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// 從 weighbridge-data.json 讀取地磅資料並在地圖上顯示
fetch('weighbridge-data.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            // 使用綠色標記圖示
            const storeMarker = L.marker([item.latitude, item.longitude], { icon: greenIcon }).addTo(storeLayer);

            // 為每個標記綁定 Popup，顯示地磅資訊
            storeMarker.bindPopup(`
                <h2>固定地秤</h2>  <!-- 添加"固定地秤"標題 -->
                <b>${item.所有人}</b><br>
                地址: ${item.地址}<br>
                廠牌: ${item.廠牌}<br>
                型號: ${item.型號}<br>
                器號: ${item.器號}<br>
                Max (t): ${item.Max_t}<br>
                e (kg): ${item.e_kg}<br>
                檢定日期: ${item.檢定日期}<br>
                檢定合格單號: ${item.檢定合格單號}<br>
                案號: ${item.案號}
            `);
            storeMarker.on('click', function () {
                onMarkerClick(storeMarker.getLatLng());
            });storeCount++;  // 計數
        });
        // 更新控制器數量顯示
        updateInfoControl();
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// 添加圖層控制，讓用戶可以選擇顯示哪些圖層
const baseLayers = {};
const overlays = {
    "磅秤資訊": scaleLayer,
    "地磅資訊": storeLayer
};

L.control.layers(baseLayers, overlays).addTo(map);
