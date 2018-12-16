let https = require('https'),
    path = require('path'),
    fs = require('fs'),
    axios = require('axios');
axios({
    url:'https://fgo.wiki/index.php?title=%E8%8C%A8%E6%9C%A8%E7%AB%A5%E5%AD%90(Lancer)&action=edit'
}).then(({data})=>{
    let original = data.toString();
    const values = original.match(/<textarea readonly="" accesskey="," id="wpTextbox1" cols="80" rows="25" style="" class="mw-editfont-monospace" lang="zh-CN" dir="ltr" name="wpTextbox1">(.|\n)+<\/textarea>/);
    if(values[0]){
        let info = {base:{},noble:{}};
        /**
         * 基础属性
         */
        {
            const base = values[0].match(/{{基础数值(.|\n)+?\|立绘tabber=/)[0].match(/\|.+?\n/g);
            base.forEach(t=>{
                let key = t.match(/\|.+?=/)[0].replace(/([|=])/g,'');
                const value = t.split('=')[1].trim();
                if(key.indexOf('张卡')>-1){
                    key = '卡'
                } else if (key.indexOf('特性')>-1){
                    key = '特性'
                } else if (key.indexOf('属性')>-1){
                    key = '属性'
                }
                if(info.base[key]){
                    if(!Array.isArray(info.base[key])){
                        info.base[key] = [info.base[key]];
                    }
                    info.base[key].push(value)
                } else {
                    info.base[key] = value
                }
            });
        }
        /**
         * 宝具
         */
        {
            let noble = values[0].match(/==宝具==(.|\n)+?==技能==/)[0].split('\n');
            noble.pop();
            noble.pop();
            noble.shift();
            noble.shift();
            let nobleBase = noble.shift().split(/\|/);
            nobleBase.shift();
            [info.noble.type,info.noble.color,info.noble.rank,info.noble.atkType,info.noble.JP,info.noble.IT,info.noble.CN] = nobleBase;
            info.noble.type = nobleBase[0].split(/=/).pop();
            info.noble.effect = [];
            noble.forEach(t=>{
                let a = t.split('|');
                a.shift();
                let i ={type:a.shift(),effect:[]};
                if(a[2]===a[3]){
                    i.effect = [a[0]]
                } else {
                    i.effect = a;
                }
                info.noble.effect.push(i)
            });
        }
        console.log(JSON.stringify(info,null,4));

    }
});
// https.get('https://fgo.wiki/index.php?title=茨木童子(Lancer)&action=edit',(res)=>{
//     let chunk = '';
//     res.on('data',_=>{
//         chunk+=_;
//     });
//     res.on('end',()=>{
//         let original = chunk.toString();
//         const values = original.match(/<textarea readonly="" accesskey="," id="wpTextbox1" cols="80" rows="25" style="" class="mw-editfont-monospace" lang="zh-CN" dir="ltr" name="wpTextbox1">(.|\n)+<\/textarea>/);
//         if(values[0]){
//
//         }
//         let writerStream = fs.createWriteStream(path.resolve(__dirname,'../data/database/test.json'),{flags:'w'});
//         writerStream.write(JSON.stringify(temp,null,4),"UTF-8");
//     })
// });
