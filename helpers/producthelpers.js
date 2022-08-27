var db = require('../configuration/connection')

var collection = require('../configuration/collection');

const objectId = require('mongodb').ObjectId


module.exports = 

{
    addProducts:async(productData)=> 
    {
         console.log("pro");
         
         console.log(productData);
         
       let  Category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({Category:productData.Category})

       let  Subcategory = await db.get().collection(collection.SUBCATEGORY_COLLECTION).findOne({Subcategory:productData.Subcategory})
         
       let Brand = await db.get().collection(collection.BRAND_COLLECTION).findOne({Brand:productData.Brand})

       let Color = await db.get().collection(collection.COLOR_COLLECTION).findOne({Color:productData.Color})

         
        productData.Category =objectId(Category._id) 
        
        productData.Subcategory = objectId(Subcategory._id)
        
        productData.Brand = objectId(Brand._id)    

        productData.Color = objectId(Color._id)
       

         return new Promise ((resolve,reject)=>{

            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data)=>{
                
               
                resolve()



            })

        })
        

    },


    getFeaturedProducts : ()=>{

        return new Promise ( async(resolve,reject)=>{

          
        let products=  await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
         
            {$lookup:
                {
                from: collection.BRAND_COLLECTION,
                localField:'Brand',
                foreignField:'_id',
                as:'brand'

                }

                
            },

            {
                $project : {Brand:"$brand.Brand",Name:1,Price:1,Image:1,offer:1,discountPrice:1,productoffer:1,productofferpercentage:1,
                productdiscountprice:1}
            },

            {
                $limit:4
            }
              
            

           ]).toArray()      
                
           resolve(products)  
        })
    },

     
    getAllProducts : ()=>{

        return new Promise ( async(resolve,reject)=>{

          
        let products=  await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
         
            {$lookup:
                {
                from: collection.BRAND_COLLECTION,
                localField:'Brand',
                foreignField:'_id',
                as:'brand'

                 }

                
            },

            {$lookup:
                {
                from: collection.CATEGORY_COLLECTION,
                localField:'Category',
                foreignField:'_id',
                as:'category'

                }

                
            },
            {$lookup:
                {
                from: collection.SUBCATEGORY_COLLECTION,
                localField:'Subcategory',
                foreignField:'_id',
                as:'subcategory'

                }

                
            },
            {$lookup:
                {
                from: collection.COLOR_COLLECTION,
                localField:'Color',
                foreignField:'_id',
                as:'color'

                }

                
            },

            {
                $project : {
                    Brand:"$brand.Brand",Category:'$category.Category',Color:'$color.Color',Name:1,Price:1,Image:1,Size:1,offer:1,discountPrice:1,
                    productoffer:1,productofferpercentage:1,
                    productdiscountprice:1
            }
           
        },

              
            

           ]).toArray()    
           
           if(products) resolve(products)  
           else reject(error)

                
        })  
    },
  


    getProductsDetails:(pId)=>{

        return new Promise ((resolve,reject)=>{

         db.get().collection(collection.PRODUCT_COLLECTION).aggregate([

            {
                $match:{_id:objectId(pId)}
            },

            {
                $lookup:
                {
                    from:collection.CATEGORY_COLLECTION,
                    localField:'Category',
                    foreignField:'_id',
                    as:'category'                
                }
            },

            {
                $lookup:
                {
                    from:collection.SUBCATEGORY_COLLECTION,
                    localField:'Subcategory',
                    foreignField:'_id',
                    as:'subcategory'
                }
            },

            {
                $lookup:
                {
                    from:collection.BRAND_COLLECTION,
                    localField:'Brand',
                    foreignField:'_id',
                    as:'brand'
                }
            },
 
            {
                $lookup:
                {
                    from:collection.COLOR_COLLECTION,
                    localField:'Color',
                    foreignField:'_id',
                    as:'color'
                }
            },

            {
                $project:{
                    Category:'$category.Category',Brand:'$brand.Brand',Subcategory:'$subcategory.Subcategory',Color:'$color.Color',Name:1,Price:1,Image:1,
                    Size:1,offer:1,discountPrice:1,productoffer:1,productofferpercentage:1,
                    productdiscountprice:1
                }
            }
        ]).toArray().then((product)=>{
            console.log(product[0])     
            resolve(product[0])
        }).catch((err)=>{
            reject(err)
        })
               
                
        })    
    },
    

updateProducts:async(pId,productData)=>{
    
  
       let  Category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({Category:productData.Category})

       let  Subcategory = await db.get().collection(collection.SUBCATEGORY_COLLECTION).findOne({Subcategory:productData.Subcategory})
         
       let Brand = await db.get().collection(collection.BRAND_COLLECTION).findOne({Brand:productData.Brand})

       let Color = await db.get().collection(collection.COLOR_COLLECTION).findOne({Color:productData.Color})

         
        productData.Category =objectId(Category._id) 
        
        productData.Subcategory = objectId(Subcategory._id)
        
        productData.Brand = objectId(Brand._id)    

        productData.Color = objectId(Color._id)


    return new Promise(async(resolve,reject)=>{

     await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(pId)},
      {
     $set: {
        Name:        productData.Name,

        Description: productData.Description,

        Category   : productData.Category,

        Subcategory :productData.Subcategory,

        Brand :      productData.Brand,

        Color  :     productData.Color,

        Size   :     productData.Size,

        Stock:     productData.Stock,

        Price  :     productData.Price,
        
        Image: productData.Image


     }
      })
                
      resolve()

    })
},


deleteProduct : (pId)=>{

   return new Promise ((resolve,reject)=>{

     db.get().collection(collection.PRODUCT_COLLECTION).remove({_id:objectId(pId)},1)

     resolve()
   })

  
},


getCategorywiseProducts:(cId)=>{
   
    return new Promise((resolve,reject)=>{
     
      db.get().collection(collection.PRODUCT_COLLECTION).aggregate([

        {
            $match:{Category:objectId(cId)}
        },
        
        {
            $lookup:
            {
                from:collection.BRAND_COLLECTION,

                localField:'Brand',
                foreignField:'_id',
                as:'brand'

            }
        },

        {
            $lookup:
            {
                from:collection.CATEGORY_COLLECTION,
                localField:'Category',
                foreignField:'_id',
                as:'category'
            }
        },

        {
            $project:{Name:1,Price:1,Image:1,Brand:'$brand.Brand',Category:'$category.Category',offer:1,discountPrice:1,productoffer:1,productofferpercentage:1,
            productdiscountprice:1}
        }

      ]).toArray().then((products)=>{

          resolve(products)
      }).catch((err)=>{
        reject(err)
      })
       
      
     

    })

},

getBrandwiseProducts:(bId)=>{
     
    return new Promise((resolve,reject)=>{
         
       db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match: {
                    Brand:objectId(bId)
                }
            },
            
            {
                $lookup:
                {
                    from:collection.BRAND_COLLECTION,
    
                    localField:'Brand',
                    foreignField:'_id',
                    as:'brand'
    
                }
            },
    
            {
                $lookup:
                {
                    from:collection.CATEGORY_COLLECTION,
                    localField:'Category',
                    foreignField:'_id',
                    as:'category'
                }
            },
    
            {
                $project:{Name:1,Price:1,Image:1,Brand:'$brand.Brand',Category:'$category.Category',offer:1,discountPrice:1,productoffer:1,productofferpercentage:1,
                productdiscountprice:1}
            }

         ]).toArray().then((products)=>{
            resolve(products)
         })
         .catch((err)=>{
            reject(err)
         })
         


    })
},

getSubcategorywiseProducts:(sId)=>{

    return new Promise((resolve,reject)=>{

        db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match: {Subcategory:objectId(sId)}
            },

            {
                $lookup:
                {
                    from:collection.BRAND_COLLECTION,
    
                    localField:'Brand',
                    foreignField:'_id',
                    as:'brand'
    
                }
            },

            {
                $lookup:
                {
                    from:collection.CATEGORY_COLLECTION,
                    localField:'Category',
                    foreignField:'_id',
                    as:'category'
                }
            },
             
            {
                $project:{Name:1,Price:1,Image:1,Brand:'$brand.Brand',Category:'$category.Category',offer:1,discountPrice:1,productoffer:1,productofferpercentage:1,
                productdiscountprice:1}
            }
         ]).toArray().then((products)=>{
             
            resolve(products)
        
        }).catch((err)=>{
            
            reject(err)
         })

      
    })
},

updateProductOffer:(data)=>
{

    return new Promise(async (resolve,reject)=>{
        let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({Name:data.product})
        console.log(product);
        let offer = product.Price- product.Price*(data.offer/100)
        let discount=product.Price*(data.offer/100)

        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({Name:product.Name},
            {
                $set:{
                    offer:false,
                    productdiscountprice:offer,
                    productoffer:true,
                    productofferpercentage:data.offer,
                    productdiscount:discount

                }
            })

            resolve()
    })
}
            
}  


      

   



