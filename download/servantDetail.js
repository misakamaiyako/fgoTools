let path = require('path'),
    fs = require('fs'),
    axios = require('axios'),
    qp = require('../data/database/qp'),
    i=0;
fs.readFile('../data/database/servant.json',(err,data)=>{
    let list = JSON.parse(data);
    function getDetail(name,id){
        axios({
            url:`https://fgo.wiki/index.php?title=${encodeURI(name)}&action=edit`
        }).then(({data})=>{
            let original = data.toString();
            let values = original.match(/<textarea readonly="" accesskey="," id="wpTextbox1" cols="80" rows="25" style="" class="mw-editfont-monospace" lang="zh-CN" dir="ltr" name="wpTextbox1">(.|\n)+<\/textarea>/);
            if(values[0]){
                values = values[0].replace(/&lt;/g,'<');
                let info = {base:{},noble:{},skill:[],rankSkill:[],evolution:[],strengthen:[],stories:[],bondage:[]};
                function split(value) {
                    let a =value.match(/(?<={{)(.|\n)+(?=}})/)[0].split(/\n/).map(t=>{
                        if(/{{.+?\|.+?}}/.test(t)){
                            t = t.replace(/{{.+?\|/,'').replace(/}}/,'');
                        }
                        return t.split(/\|/)
                    });
                    let result = {base:{},effect:[]};
                    if(a[0][0]==='参阅'){
                        a.shift();
                        a[0][0]=a[0][0].replace(/{{/,'')
                    }
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
                        if(name){
                            if(t[3]===t[2]){
                                result.effect.push({
                                    name,
                                    effect:t[0]
                                })
                            } else {
                                result.effect.push({
                                    name,
                                    effect:t
                                })
                            }
                        }
                    });
                    return result;
                }
                function splitSkill(value){
                    if(/强化后=/.test(value)){
                        let checkpoint = value.match(/(?<=\|).+?(?=]])/)[0];
                        let condition = value.match(/(?<=''（).+?(?=）'')/)[0];
                        let a = value.split(/\n\|\-\|\n/);
                        let s = {
                            after: [],
                            before: [],
                            checkpoint,
                            condition
                        };
                        if(/强化前/.test(a[0])){
                            s.before = split(a[0].replace(/(.|\n).+?(?={{)/,''));
                            s.after = split(a[1].replace(/(.|\n).+?(?={{)/,''));
                        } else {
                            s.after = split(a[0].replace(/(.|\n).+?(?={{)/,''));
                            s.before = split(a[1].replace(/(.|\n).+?(?={{)/,''));
                        }
                        return s;
                    } else {
                        return split(value)
                    }
                }
                /**
                 * 基础属性
                 */
                try{
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
                }catch (e) {
                    console.log(name,'基础属性')
                }
                /**
                 * 宝具
                 */
                try{
                    let noble = values.match(/==宝具==(.|\n)+?==技能==/)[0];
                    if(/强化后=/.test(noble)){
                        let before = noble.match(/强化前=(.|\n)+?(\|-\||<\/tabber>)/)[0];
                        let after = noble.match(/强化后=(.|\n)+?(\|\-\||<\/tabber>)/)[0];
                        info.noble = {
                            before:split(before),
                            after:split(after)
                        }
                    } else {
                        info.noble = split(noble)
                    }
                }catch (e) {
                    console.log(name,'宝具')
                }
                /**
                 * 保有技能
                 */
                try{
                    // let skill = values.match(/===持有技能===(.|\n)+?职介技能==/)[0].replace('===持有技能===','').replace('===职阶技能===','');
                    let skill1 = values.match(/'''技能1.+'''(.|\n)+?'''技能2.+'''/)[0].replace(/'''技能1.+'''\n/,'').replace(/\n'''技能2.+'''/,'');
                    info.skill.push(splitSkill(skill1));
                    let skill2 = values.match(/'''技能2.+'''(.|\n)+?'''技能3.+'''/)[0].replace(/'''技能2.+'''\n/,'').replace(/\n'''技能3.+'''/,'');
                    info.skill.push(splitSkill(skill2));
                    let skill3 = values.match(/'''技能3.+'''(.|\n)+?===职阶技能===/)[0].replace(/'''技能3.+'''\n/,'').replace(/\n===职阶技能===/,'');
                    info.skill.push(splitSkill(skill3));
                }catch (e) {
                    console.log(name,'基础属性')
                }
                /**
                 * 职介技能
                 */
                try {
                    let rankSkill = values.match(/(?<=职阶技能===)(.|\n)+(?===素材需求)/)[0].trim().replace(/({{职阶技能\||}})/g,'').split('|');
                    for(let i=0;i<rankSkill.length;i+=4){
                        info.rankSkill.push({
                            icon:rankSkill[i],
                            name: rankSkill[i+1],
                            rank: rankSkill[i+2],
                            effect: rankSkill[i+3]
                        })
                    }

                }catch (e) {
                    console.log(name,'职介技能')
                }
                /**
                 * 灵基再临
                 */
                try {
                    let evolution = values.match(/(?<=灵基再临（从者进化）===)(.|\n)+?(?====技能强化===)/)[0].split(/\n\|/);
                    evolution.shift();
                    let iqpCost = ['NR','N','NR','R','SR','SSR'][evolution[0].match(/\d/)[0]];
                    evolution.shift();
                    evolution.pop();
                    evolution.forEach((t,index)=>{
                        let a = [];
                        t.match(/(?<=\|\B).+?(?=}})/g).forEach(g=>{
                            a.push({
                                item: g.split(/\|/)[0],
                                quantity: g.split(/\|/)[1]
                            })
                        });
                        a.push({
                            item:'QP',
                            quantity:qp.evolution[iqpCost][index]
                        });
                        info.evolution.push(a)
                    })
                }catch (e) {
                    console.log(name,'灵基再临')
                }
                /**
                 * 技能强化
                 */
                try {
                    let skill =  values.match(/(?<=技能强化===)(.|\n)+?(?===从者羁绊==)/)[0].split(/\n\|/);
                    skill.shift();
                    let iqpCost = ['NR','N','NR','R','SR','SSR'][skill[0].match(/\d/)[0]];
                    skill.shift();
                    skill.pop();
                    skill.forEach((t,index)=>{
                        let a = [];
                        t.match(/(?<=\|\B).+?(?=}})/g).forEach(g=>{
                            a.push({
                                item: g.split(/\|/)[0],
                                quantity: g.split(/\|/)[1]
                            })
                        });
                        a.push({
                            item:'QP',
                            quantity:qp.skill[iqpCost][index]
                        });
                        info.strengthen.push(a)
                    })
                }catch (e) {
                    console.log(name,'技能强化')
                }
                /**
                 * 羁绊故事
                 */
                try{
                    let stories = values.match(/(?<={{羁绊故事)(.|\n)+?(?=}})/)[0].split(/\n\|\n/);
                    stories.shift();
                    const length = stories.length;
                    if(length===6){
                        stories.push(1);
                        stories.push(1);
                    }
                    if(stories.length===8){
                        stories.push('角色详情');
                        stories.push('解锁条件：羁绊达到Lv.1后开放');
                        stories.push('解锁条件：羁绊达到Lv.2后开放');
                        stories.push('解锁条件：羁绊达到Lv.3后开放');
                        stories.push('解锁条件：羁绊达到Lv.4后开放');
                        stories.push('解锁条件：羁绊达到Lv.5后开放');
                    }
                    info.stories.push({
                        case:stories[8],
                        story:stories.shift().trim()
                    });
                    info.stories.push({
                        case:stories[8],
                        story:stories.shift().trim()
                    });
                    info.stories.push({
                        case:stories[8],
                        story:stories.shift().trim()
                    });
                    info.stories.push({
                        case:stories[8],
                        story:stories.shift().trim()
                    });
                    info.stories.push({
                        case:stories[8],
                        story:stories.shift().trim()
                    });
                    info.stories.push({
                        case:stories[8],
                        story:stories.shift().trim()
                    });
                    if(length!==6){
                        info.stories.push({
                            story:stories.shift().trim(),
                            case:stories.shift().trim()
                        });
                    }
                }catch (e) {
                    console.log(name,'羁绊故事')
                }
                /**
                 * 羁绊值
                 */
                try{
                    let bondage  = values.match(/(?<={羁绊点数)(.|\n)+?(?=}})/)[0].split(/\|/);
                    bondage.shift();
                    bondage.pop();
                    for (let i = 0; i < bondage.length; i++) {
                        bondage.push(Number(bondage.shift()))
                    }
                    info.bondage = bondage.concat([1090000,1230000,1360000,1500000,1640000])
                }catch (e) {
                    console.log(name,'羁绊值')
                }
                let errorWriterStream = fs.createWriteStream(path.resolve(__dirname,`../data/database/servantDetail/${id}.json`),{flags :'w'});
                errorWriterStream .write(JSON.stringify(info,null,2),'UTF8');
                errorWriterStream .end();
            }
            i++;
            i<list.length&&getDetail(list[i].name_link,list[i].id)
        });
    }
    getDetail(list[i].name_link,list[i].id)
});
