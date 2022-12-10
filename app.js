const express = require('express') ;
const app = express() ;

const {createClient} = require('redis');
const axios = require('axios');
const client = createClient({
  legacyMode: true,
  url:'redis://redis-12158.c299.asia-northeast1-1.gce.cloud.redislabs.com:12158'
});

app.use(express.json());
const DEFAUTL_EXPIRSE = 100
app.get('/images',async (req,res)=>{
  const {albumId} = req.query;
  try{
    const photots = await getDataCatch(`photos?albumId=${albumId}`,async()=>{
      const data = await axios.get(`https://jsonplaceholder.typicode.com/photos`, { params: { albumId } }).then(res => res.data);
      return data
    });
    res.json({ photots })
  }catch(err){
    res.json({err});
  }  
})

function getDataCatch(key,cb){
  return new Promise(async(resolve, reject) => {
    const data = await client.get(key);
    if(data!==null) resolve(JSON.parse(data));
    const fetchdata = await cb();
    client.setEx(key, DEFAUTL_EXPIRSE, JSON.stringify(fetchdata));
    resolve(fetchdata);
  })
}
app.listen(3000,async()=>{
   await client.connect();
  console.log('server run on port 3000')
})