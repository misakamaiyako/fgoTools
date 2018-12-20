let https = require('https'),
    path = require('path'),
    fs = require('fs'),
    axios = require('axios');
axios({
    url:`https://fgo.wiki/index.php?title=${encodeURI('恩奇都')}&action=edit`
}).then(({data})=>{
    let original = data.toString();
    let values = original.match(/<textarea readonly="" accesskey="," id="wpTextbox1" cols="80" rows="25" style="" class="mw-editfont-monospace" lang="zh-CN" dir="ltr" name="wpTextbox1">(.|\n)+<\/textarea>/);
    if(values[0]){
        values = values[0].replace(/&lt;/g,'<');
        let info = {base:{},noble:{},skill:{}};
        function split(value) {
            let a =value.match(/{{(.|\n)+?}}/)[0].replace(/({{|}})/g,'').split(/\n/).map(t=>{
                return t.split(/\|/)
            });
            let result = {base:{},effect:[]};
            if(a[0][0]==='宝具'){
                result.base = {
                    type:a[0][1],
                    color:a[0][2],
                    rank:a[0][3],
                    effectType:a[0][4],
                    JP:a[0][5],
                    EN:a[0][6],
                    CN:a[0][7]
                }
            } else if (a[0][0]==='持有技能'){
                result.base = {
                    icon:a[0][1],
                    name:a[0][2],
                    coolDown:a[0][3]
                }
            } else {
                console.log(a[0][0])
            }
            a.shift();
            a.forEach(t=>{
                t.shift();
                let name = t.shift();
                if(t[3]==t[2]){
                    result.effect.push({
                        name,
                        effect:a[0]
                    })
                } else {
                    result.effect.push({
                        name,
                        effect:t
                    })
                }
            });
            return result;
        }
        /**
         * 基础属性
         */
        {
            const base = values.match(/{{基础数值(.|\n)+?\|立绘tabber=/)[0].match(/\|.+?\n/g);
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
            let noble = values.match(/==宝具==(.|\n)+?==技能==/)[0];
            if(/强化后=/.test(noble)){
                let before = noble.match(/强化前=(.|\n)+?(\|-\||<\/tabber>)/)[0];
                let after = noble.match(/强化后=(.|\n)+?(\|\-\||<\/tabber>)/)[0];
                info.noble = {
                    before:split(before),
                    after:split(after)
                }
            }
        }
        /**
         * 技能
         */
        {
            // let skill = values.match(/===持有技能===(.|\n)+?职介技能==/)[0].replace('===持有技能===','').replace('===职阶技能===','');
            let skill1 = values.match(/'''技能1.+'''(.|\n)+?'''技能2.+'''/)[0].replace(/'''技能1.+'''\n/,'').replace(/\n'''技能2.+'''/,'');
            if(/强化任务/.test(skill1)){

            }
        }
        // console.log(JSON.stringify(info,null,4));
    }
});
