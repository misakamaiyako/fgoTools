let http = require('https'),
    fs = require('fs'),
    path = require('path');
let json  = require(path.resolve(__dirname,'../data/database/suit.json'));
function downLoadSuit(){
    const length = json.length;
    let downList = [];
    let errorList = [];
    for(let i =1;i<=length;i++){
        downList.push(
            new Promise(resolve => {
                http.get(`https://fgowiki.com/guide/equipdetail/${i}?p=pc`, function(response) {
                    let chunk = '';
                    response.on('data', (d) => {
                        chunk+=d;
                    });
                    response.on('end', () => {
                        resolve();
                        try{
                            let detail = chunk.toString().match(/\[\{(.|\n)+\}\]/)[0];
                            detail = JSON.parse(detail);
                            json[i-1].INTRO = detail[0].INTRO;
                            json[i-1].ILLUST = detail[0].ILLUST;
                        } catch (e) {
                            errorList.push({id:i})
                        }
                    });
                });
            })
        )
    }
    Promise.all(downList).then(()=>{
        let writerStream = fs.createWriteStream(path.resolve(__dirname,'../data/database/suit.json'),{flags :'r+'});
        writerStream.write(JSON.stringify(json,null,2),'UTF8');
        writerStream.end();
        let errorWriterStream = fs.createWriteStream(path.resolve(__dirname,`../data/database/UNcatchSuit.json`),{flags :'r+'});
        errorWriterStream .write(JSON.stringify(errorList,null,2),'UTF8');
        errorWriterStream .end();
    });
    return downList;
}
module.exports = downLoadSuit();

