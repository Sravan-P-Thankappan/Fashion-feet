

const Mongoclient = require('mongodb').MongoClient

const state = 
{
     db:null
}


const connect = function(done)
{
  const url = process.env.CONNECTION_URL // provide your connection url

  const dbname = 'shoppingcart'


  Mongoclient.connect(url,(err,data)=>
  {
    if(err) return done(err)
    
    state.db=data.db(dbname)
    
    done()
    
  })
  
}


const get = ()=>
{
  return state.db;
}

module.exports = {
    connect,get
} 