const fs = require('fs'),
    path = require('path'),
    https = require('https');
const simplifyURL = require('../src/mixin.js').simplifyURL;
function downloadBase(){
    let base = new Promise(resolve=>{
        https.get('https://fgo.wiki/w/英灵图鉴',function(res){
            let chunk = '';
            res.on('data',_=>{
                chunk+=_;
            });
            res.on('end',()=>{
                let original = chunk.toString().match(/id,.+,\d+/)[0];
                let raw_data = original.split("\\n");
                let data = new Array(raw_data.length - 1);
                let titles = raw_data[0].split(',');
                for (let i = 0; i < raw_data.length - 1; i++){
                    data[i] = {};
                    let data_i = raw_data[i + 1].split(',');
                    for(let j = 0; j < titles.length; j++){
                        data[i][titles[j]] = data_i[j];
                    }
                }
                resolve(data)
            })
        });
    });
    base.then(data=>{
        downloadImg(data);
        downloadDetail(data);
    })
}
function downloadImg(data){
    const imgArrow = ["avatar","card1","card2","card3","card4","card5","np_card","class_icon"];
    let imgSet = new Set();
    data.forEach(t=>{
        imgArrow.forEach(d=>{
            imgSet.add(encodeURI(t[d]));
            t[d] = simplifyURL('./data/img/tableImg/',t[d]);
        })
    });
    let writerStream = fs.createWriteStream(path.resolve(__dirname,'../data/database/servant.json'),{flags:'w'});
    writerStream.write(Buffer.from(JSON.stringify(data,null,2)),"UTF-8");
    imgSet.forEach(value=>{
        https.get('https://fgo.wiki'+value , function(response) {
            if (response.statusCode === 200) {
                if(simplifyURL('',decodeURI(value)).length>0){
                    let file = fs.createWriteStream(path.resolve(__dirname,'../data/img/tableImg/'+simplifyURL('',decodeURI(value))));
                    response.pipe(file);
                } else {
                    console.log('noNameFile:%s',value)
                }
            }
        });
    })
}
function downloadDetail(data){
    // for(let i = 1;i<=data.length;i++){
    //     https.get(`https://fgowiki.com/guide/petdetail/${i}`,res => {
    //         if(res.statusCode===200){
    //             let chunk = '';
    //             res.on('data',_=>{
    //                 chunk+=_;
    //             });
    //             res.on('end',()=>{
    //                 let detail = chunk.toString().match(/\[{"\u0049D(.|\n)+}]/)[0];
    //                 let myRoom = chunk.toString().match(/\[\{"\u0049D(.|\n)+}]/)[1];
    //                 let writerStream = fs.createWriteStream(path.resolve(__dirname,`../data/database/servantDetail/${i}.json`),{flags :'w'});
    //                 writerStream.write(JSON.stringify(detail,null,2),'UTF8');
    //                 writerStream.end();
    //                 let writerStream2 = fs.createWriteStream(path.resolve(__dirname,`../data/database/servantDetail/${i}-myRoom.json`),{flags :'w'});
    //                 writerStream2.write(JSON.stringify(myRoom,null,2),'UTF8');
    //                 writerStream2.end();
    //             })
    //         } else {
    //             console.log('error',i)
    //         }
    //     })
    // }
}
module.exports = downloadBase;
downloadBase();

