let https = require('https'),
    path = require('path'),
    fs = require('fs');
https.get('https://fgo.wiki/w/茨木童子(Lancer)',(res)=>{
    let chunk = '';
    res.on('data',_=>{
        chunk+=_;
    });
    res.on('end',()=>{
        let original = chunk.toString();
        let headers = original.match(/<th(.|\n)+?th>/g);
        let values = original.match(/<td(.|\n)+?td>/g);
        let results = [],results2=[];
        for(;headers.length>0&&values.length>0;){
            let headerValue = headers.shift();
            const hTemp = headerValue.replace(/<br\s*\/>/,'\n').replace(/<.+?>/g,'').trim();
            if(hTemp.length>0){
                results.push(hTemp);
            }
            let valueTemp = values.shift();
            let vTemp = '';
            if(/Quick.png/.test(valueTemp)){
                let q = valueTemp.match(/alt="Quick.png"/g).length;
                let b = valueTemp.match(/alt="Buster.png"/g).length;
                let a = valueTemp.match(/alt="Arts.png"/g).length;
                vTemp='Quick,'.repeat(q)+'Buster,'.repeat(b)+'Arts,'.repeat(a);
                vTemp = vTemp.split(',');
                vTemp.length=5;
            } else if(/数值/.test(headerValue)){
                vTemp = [{name:'title',values:[]},{name:'ATK',values:[]},{name:'有效ATK',values:[]},{name:'HP',values:[]}];
                vTemp[0] = headers.splice(0,5);
                vTemp[1] = values.splice(0,5);
                vTemp[2] = values.splice(0,5);
                vTemp[3] = values.splice(0,5);
            }else if(/NP获得率/.test(headerValue)){
                vTemp = [{name:'title',values:[]},{name:'NP',values:[]}];
                vTemp[0] = headers.splice(0,6);
                vTemp[1] = values.splice(0,6);
            } else {
                vTemp = valueTemp.replace(/<br\s*\/>/,'\n').replace(/<.+?>/g,'').trim();
            }
            if(vTemp.length>0){
                results2.push(vTemp);
            }
        }
        let temp = [];
        for(let i = 0;i<results.length&&i<results2.length;i++){
            temp.push([results[i],results2[i]]);
        }
        let writerStream = fs.createWriteStream(path.resolve(__dirname,'../data/database/test.json'),{flags:'w'});
        writerStream.write(JSON.stringify(temp,null,4),"UTF-8");
    })
});
