const fs = require('fs'),
    path = require('path'),
    axios = require('axios');
const simplifyURL = require('../src/mixin.js').simplifyURL;
function downloadBase(){
    axios.get('https://fgo.wiki/w/'+encodeURI('英灵图鉴')).then(({data})=>{
        let raw_data = data.match(/id,.+,\d+/)[0].split("\\n");
        data = new Array(raw_data.length - 1);
        let titles = raw_data[0].split(',');
        for (let i = 0; i < raw_data.length - 1; i++){
            data[i] = {};
            let data_i = raw_data[i + 1].split(',');
            for(let j = 0; j < titles.length; j++){
                data[i][titles[j]] = data_i[j];
            }
        }
        let errorWriterStream = fs.createWriteStream(path.resolve(__dirname,`../data/database/servant.json`),{flags :'w'});
        errorWriterStream .write(JSON.stringify(data,null,2),'UTF8');
        errorWriterStream .end();
        // downloadImg(data);
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
module.exports = downloadBase;
downloadBase();

