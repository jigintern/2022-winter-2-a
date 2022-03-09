export const createmap =() =>{
    
        const map = L.map('mapcontainer',{zoomControl:false});
        map.setView([35.40, 136], 5);
        L.control.scale({maxWidth:200,position:'bottomright',imperial:false}).addTo(map);
        L.control.zoom({position:'bottomleft'}).addTo(map);
     
        //オープンストリートマップのタイル
        const osm = L.tileLayer('http://tile.openstreetmap.jp/{z}/{x}/{y}.png',
          {  attribution: "<a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors" });
        //baseMapsオブジェクトのプロパティに3つのタイルを設定
        
        //layersコントロールにbaseMapsオブジェクトを設定して地図に追加
        //コントロール内にプロパティ名が表示される
        
        osm.addTo(map);
  
        function onLocationFound(e) {
            L.marker(e.latlng).addTo(mymap).bindPopup("現在地").openPopup();
        }
   
        function onLocationError(e) {
            alert("現在地を取得できませんでした。" + e.message);
        }
   
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
   
        map.locate({setView: true, maxZoom: 16, timeout: 20000});
  
      

}