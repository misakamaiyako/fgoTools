const fs = require('fs'),
    path = require('path'),
    https = require('https');
const simplifyURL = require('../src/mixin.js').simplifyURL;
let base = new Promise(resolve=>{
    https.get('https://fgo.wiki/w/%E8%8B%B1%E7%81%B5%E5%9B%BE%E9%89%B4',function(res){
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
const imgArrow = ["avatar","card1","card2","card3","card4","card5","np_card","np_type","class_icon"];
let imgSet = new Set();
base.then(data=>{
    data.forEach(t=>{
        imgArrow.forEach(d=>{
            imgSet.add(t[d]);
            t[d] = simplifyURL('./data/img/tableImg/',t[d]);
        })
    });
    let writerStream = fs.createWriteStream(path.resolve(__dirname,'../data/database/servant.json'),{flags:'r+'});
    writerStream.pipe(new Buffer(JSON.stringify(data,null,2),'UTF-8'));
    imgSet.forEach(value=>{
        https.get(`https://fgo.wiki${value}`, function(response) {
            if (response.statusCode === 200) {
                let file = fs.createWriteStream(path.resolve(__dirname,'../data/img/tableImg/'+simplifyURL('',value)));
                response.pipe(file);
            }
        });
    })
});
