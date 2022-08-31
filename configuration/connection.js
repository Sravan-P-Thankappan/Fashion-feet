

const Mongoclient = require('mongodb').MongoClient

const state = 
{
     db:null
}


const connect = function(done)
{
  // const url = 'mongodb+srv://sravan:sravanpt@cluster0.u1q6ub7.mongodb.net/?retryWrites=true&w=majority'

  const url = 'mongodb+srv://sravan:sravanpt@cluster0.j0rljlh.mongodb.net/?retryWrites=true&w=majority'
 
  // const url = 'mongodb://localhost:27017'

  const dbname = 'fashionfeet'

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