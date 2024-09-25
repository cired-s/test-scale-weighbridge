// 初始化 Leaflet 地圖，中心點設為台灣 (可以根據需求調整經緯度)
const map = L.map('map').setView([25.03236, 121.51813], 16);

// 設定地圖圖層，這裡使用 OpenStreetMap 圖層
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 創建兩個 LayerGroup：一個是磅秤資訊，另一個是地磅資訊
const scaleLayer = L.layerGroup().addTo(map);
const storeLayer = L.layerGroup().addTo(map);

// 從 scale-data.json 讀取磅秤資料並在地圖上顯示
fetch('scale-data.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            // 在磅秤圖層中標記每個磅秤的位置
            const scaleMarker = L.marker([item.latitude, item.longitude]).addTo(scaleLayer);

            // 為每個標記綁定 Popup，顯示磅秤資訊
            scaleMarker.bindPopup(`
                <b>${item.店名}</b><br>
                廠牌: ${item.廠牌}<br>
                型式: ${item.型式}<br>
                器號: ${item.器號}<br>
                Max (kg): ${item.Max (kg)}<br>
                e (g): ${item.e (g)}<br>
                檢查日期: ${item.檢查日期}<br>
                檢查合格與否: ${item.檢查合格與否}<br>
                檢定日期: ${item.檢定日期}<br>
                檢定合格單號: ${item.檢定合格單號}
            `);
        });
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// 添加地磅資訊到地磅圖層（可以是靜態資訊或來自另一個 API）
// 從 weighbrige-data.json 讀取磅秤資料並在地圖上顯示
fetch('weighbrige-data.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            // 在地磅圖層中標記每個地秤的位置
            const scaleMarker = L.marker([item.latitude, item.longitude]).addTo(scaleLayer);

            // 為每個標記綁定 Popup，顯示地磅資訊
            scaleMarker.bindPopup(`
                <b>${item.所有人}</b><br>
                地址: ${item.地址}<br>
                廠牌: ${item.廠牌}<br>
                型號: ${item.型號}<br>
                器號: ${item.器號}<br>
                Max (t): ${item.Max (t)}<br>
                e (kg): ${item.e (kg)}<br>
                檢定日期: ${item.檢定日期}<br>
                檢定合格單號: ${item.檢定合格單號}<br>
                案號: ${item.案號}
            `);
        });
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
