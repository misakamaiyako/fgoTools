let http = require('https'),
    fs = require('fs');
for(let i =1;i<=901;i++){
    let id  = ('000'+i).slice(-3);
    http.get(`https://cdn.fgowiki.com/fgo/equip/${id}.jpg`, function(response) {
        if (response.statusCode === 200) {
            let file = fs.createWriteStream(`./data/img/suit/${id}.jpg`);
            response.pipe(file);
        }
    });
}
