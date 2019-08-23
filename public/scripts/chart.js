window.onload = ()=>{
    console.log("chart imported");
    console.log("Here you go big boy");

    var data = JSON.parse(document.getElementById('data').innerText);
    for(let i = 0;i<data.length;++i){
        console.log(data[i]);
    }

    var canvas = document.getElementById('chart');





}