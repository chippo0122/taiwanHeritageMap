//variable
let Data = [];
let op = [];
let popupBuffer = [];
let xhr = new XMLHttpRequest();
let opsec = document.querySelector('.op-sec'); 

//initialize map
let mymap = L.map('mapid', {});
let myicon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
mymap.locate({
    setView: true,
    maxZoom: 18
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
}).addTo(mymap);
//add markCluster
let layer = L.markerClusterGroup().addTo(mymap);


//initialize data 
xhr.open('get', 'helpers/1.1.json');
xhr.send(null);
xhr.onload = function(){
    Data = JSON.parse(xhr.responseText);
    op = Data;
    initData(Data);
};

//user control
document.querySelector('#countySelect').addEventListener('change', search);
document.querySelector('.btn-send').addEventListener('click', btnSearch);
document.querySelector('.toggle-btn').addEventListener('click', dropToggle);
document.querySelector('.search-choice').addEventListener('click', searchSwitch);
opsec.addEventListener('click', clickTarget);


//initialize Web
function init() {
    writeTime();
    delJumbo();
};

function delJumbo(){
    setTimeout(function(){
        document.querySelector('.loading-jumbotron').classList.add('d-none');
    }, 3000);
}

init();

//data deal
function initData(data){
    let str = '';
    delMarkers();
    for(let i=0; i<data.length; i++){
        str +=`<li class="card" data-num="${i}">
        <h2 class="fs-3 item-title text-old">${data[i].caseName}</h2>
        <p>
            <i class="fas fa-landmark text-danger"></i>
            登錄種類別:${data[i].assetsTypes[0].name}
        </p>
        <p>
            <i class="fas fa-map-marker-alt text-danger"></i>
            地址:${data[i].belongCity + data[i].belongAddress}
        </p>
        </li>`;
        //load locate pin
        if( typeof(data[i].longitude) == 'number' ||  typeof(data[i].latitude) == 'number'){
            popupBuffer.push(writeMap(data, data[i].latitude, data[i].longitude, i));
        };
    }
    opsec.innerHTML = str===''? `<p class="text-light text-center fs-4">查無資料</p>` : str;
}


function btnSearch(e){
    search(e,'btn');
    document.querySelector('#searchName').value = '';
}

function search(e, btn){
    let val = e.target.value;
    let type = e.target.dataset.type;
    if(btn == 'btn'){
        val = document.querySelector('#searchName').value !== '' ? document.querySelector('#searchName').value : document.querySelector('#searchTypeInput').value;
        type = document.querySelector('#searchName').value !== '' ? 'searchName' : 'searchType';
    }
    function dataFilter(val, type){
        op = [];
        popupBuffer = [];
        switch (type) {
            case 'searchCounty':
                if(val === '0'){
                    op = Data;
                } else {
                    for(let i=0; i<Data.length; i++){
                        if(Data[i].govInstitutionName.search(val) !== -1){
                            op.push(Data[i]);
                        }
                    }
                }
                break;
            case 'searchType':
                if(val === '0'){
                    op = Data;
                } else {
                    for(let i=0; i<Data.length; i++){
                        if(Data[i].assetsTypes[0].name.search(val) !== -1){
                            op.push(Data[i]);
                        }
                    }
                }
                break;
            case 'searchName':
                for(let i=0; i<Data.length; i++){
                    if(Data[i].caseName.search(val) !== -1){
                        op.push(Data[i]);
                    }
                }
                break;
        }
    }
    dataFilter(val, type);
    initData(op);
    moveTarget(0);
}

//map deal
function writeMap(data, lng, lat, i){
    return layer.addLayer(L.marker([lng, lat], {icon : myicon}).bindPopup(
        `<div class="card border-0">
            <img class="card-img-top" src="${data[i].representImage || 'https://cdn.iconscout.com/icon/free/png-256/no-image-1771002-1505134.png'}">
            <h5 class="text-old">${data[i].caseName}</h5>
            <div class="d-flex justify-content-between">
                <p>
                    <i class="fas fa-landmark text-danger"></i> ${data[i].assetsTypes[0].name}
                </p>
                <p>
                    <i class="fas fa-book-open text-yolk"></i> ${data[i].assetsClassifyName}
                </p>
            </div>
            <div class="info-responsive">
            <p class="mt-3">
                <i class="fas fa-info-circle text-sky fs-4"></i> ${data[i].pastHistory}
            </p>
            </div>
            <p class="mt-3">
                <i class="fas fa-map-marker-alt text-success"></i>${data[i].belongAddress}
            </p>
        </div>`,{
            maxWidth: 280
        }
    ));
};

function delMarkers(){
    layer.clearLayers();
}

//controling
function dropToggle(e) {
    if (e.target.dataset.drop == 'drop') {
        if (e.target.dataset.status == '0') {
            document.querySelector('.control').classList.add('drop');
            e.target.dataset.status = '1';
        } else {
            document.querySelector('.control').classList.remove('drop');
            e.target.dataset.status = '0';
        }
    }
}

function searchSwitch(e){
    if(e.target.value === 'signName'){
        document.querySelector('.sign-name-radio').classList.remove('d-none');
        document.querySelector('.type-radio').classList.add('d-none');
    } else if (e.target.value === 'type'){
        document.querySelector('.type-radio').classList.remove('d-none');
        document.querySelector('.sign-name-radio').classList.add('d-none');
    }
}

function clickTarget(e){
    let target = e.target.nodeName;
    let num = 0;
    if(target === 'LI' || target === 'P' || target === 'H2'){
        num = e.target.dataset.num || e.target.parentElement.dataset.num;
    }
    moveTarget(Number(num));
}

function moveTarget(num){//click to move to the target which user clicked
    for(let i=0; i<op.length; i++){
        if(num == i){
            let pos = [op[i].latitude, op[i].longitude];
            mymap.setView(pos, 18, {
                animate: true,
                duration: 1
            });
        }
    }
}

//time
function getTime() {
    let time = new Date();
    let op = {
        date: [time.getFullYear(), timeCheck(time.getMonth() + 1), timeCheck(time.getDate())],
        time: [timeCheck(time.getHours()), timeCheck(time.getMinutes()), timeCheck(time.getSeconds())]
    }
    function timeCheck(num) {
        return num < 10 ? '0' + num : num;
    }
    return op.date.join('/') + ' ' + op.time.join(':');
}

function writeTime() {
    setTimeout(function () {
        document.querySelector('.time-set').textContent = getTime();
        writeTime();
    }, 500);
};