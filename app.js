// 創建自定義圖示
const scaleIcon = L.divIcon({
    className: 'custom-icon scale-icon',
    html: 'S'
});

const weighbridgeIcon = L.divIcon({
    className: 'custom-icon weighbridge-icon',
    html: 'W'
});

const invalidIcon = L.divIcon({
    className: 'custom-icon invalid-icon',
    html: 'X'
});

// 從 scale-data.json 讀取磅秤資料並在地圖上顯示
fetch('scale-data.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            // 根據"檢查合格與否"設置圖示
            const markerIcon = item.檢查合格與否 === "N" ? invalidIcon : scaleIcon;

            // 在磅秤圖層中標記每個磅秤的位置
            const scaleMarker = L.marker([item.latitude, item.longitude], { icon: markerIcon }).addTo(scaleLayer);

            // 為每個標記綁定 Popup，顯示磅秤資訊
            scaleMarker.bindPopup(`
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
        });
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// 從 weighbridge-data.json 讀取地磅資料並在地圖上顯示
fetch('weighbridge-data.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            // 使用地磅的自定義圖示
            const storeMarker = L.marker([item.latitude, item.longitude], { icon: weighbridgeIcon }).addTo(storeLayer);

            // 為每個標記綁定 Popup，顯示地磅資訊
            storeMarker.bindPopup(`
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


