const downLoadSuit = require('./download/suitBat');
Promise.all(downLoadSuit).then(()=>{
  console.log('download')
});
