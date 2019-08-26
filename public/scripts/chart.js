window.onload = ()=>{

    var qs = JSON.parse(document.getElementById('data').innerText);
    var charts=[];//this is unused, but it's here for posterity
    for(var i=0;i<qs.length;i++) charts.push(new Chart(document.getElementById("chart"+i).getContext("2d"),{
            type:'bar',
            data:{
                labels:(why=>{
                    var becauseICan=[];
                    why.answers.forEach(e => {
                        becauseICan.push(e.a)
                    });
                    return becauseICan;
                })(qs[i]),
                datasets:[{
                    label:qs[i].question,
                    data:qs[i].answers.map(a=>a.count),
                    backgroundColor:[
                        'rgba(128,128,128,.2)',
                        'rgba(255,0,255,.2)',
                        'rgba(255,0,0,.2)',
                        'rgba(0,0,255,.2)',
                    ],
                    borderColor:[
                        'rgba(128,128,128,1)',
                        'rgba(255,0,255,1)',
                        'rgba(255,0,0,1)',
                        'rgba(0,0,255,1)',
                    ],
                    borderWidth:1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }

        }));
    

}