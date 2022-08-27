
var db = require('../configuration/connection')

var collection = require('../configuration/collection')

const objectId = require('mongodb').ObjectId



module.exports = 

{
   addCategory : (category)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
            
                resolve(data.insertedId)
        })
    })
    
   },

   getAllCategory : ()=>{

     return new Promise((resolve,reject)=>{

        db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((category)=>{
           
            resolve(category)

        })  
    })

   },
      

   getCategoryDetails : (cId)=>{

           
    return new Promise((resolve,reject)=>{

        db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(cId)}).then((category)=>{
            resolve(category)

        }).catch(()=>{
            reject()
        })


    })
                      
   },


   updateCategory : (cId,categoryData)=>{


    return new Promise(async(resolve,reject)=>{

      await  db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(cId)},
        {$set:
            {
                Category : categoryData.Category,
                Image : categoryData.Image
               
                
            }

        })

        resolve()

    })

   },

 deleteCategory:(cId)=>{

    return new Promise((resolve,reject)=>{
     
        db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(cId)}).then(()=>{

        db.get().collection(collection.PRODUCT_COLLECTION).deleteMany({Category:objectId(cId)})

            resolve()

        })
         
    })
 },


   addSubCategory:(data)=>{

    return new Promise((resolve,reject)=>{

  db.get().collection(collection.SUBCATEGORY_COLLECTION).insertOne(data)

  resolve()
       
    })
},


getAllSubCategory:()=>{

    return new Promise(async(resolve,reject)=>{

    let subcategory =await db.get().collection(collection.SUBCATEGORY_COLLECTION).find().toArray()

    resolve(subcategory)
    })
},

addBrand:(brand)=>
{
    return new Promise((resolve,reject)=>{

        db.get().collection(collection.BRAND_COLLECTION).insertOne(brand)
        resolve()
    })
},

getAllBrand:()=>{
   

    return new Promise((resolve,reject)=>{

        let brand = db.get().collection(collection.BRAND_COLLECTION).find().toArray()
         resolve(brand)
    })
         
},


addColor:(color)=>{

    return new Promise((resolve,reject)=>{
           
        db.get().collection(collection.COLOR_COLLECTION).insertOne(color)
        resolve()

    })
},


getAllColor:()=>{


    return new Promise((resolve,reject)=>{


    let color= db.get().collection(collection.COLOR_COLLECTION).find().toArray()
     resolve(color)
    })
   
}
   
}