var db = require('../configuration/connection')
var collection = require('../configuration/collection')
const objectId = require('mongodb').ObjectId

module.exports =
{
  adminLogin: (adminData) => {

    loginstatus = false
    let response = {}

    return new Promise(async (resolve, reject) => {

      let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })

      if (admin) {
        if (adminData.Password == admin.Password) {
          response.admin = admin
          response.status = true
          resolve(response)
        }
        else resolve({ status: false })
      }

      else {
        resolve({ status: false })
      }

    })
  },

  getAllOrders: () => {

    return new Promise(async (resolve, reject) => {

      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $lookup: {
            from: collection.USER_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },

        {
          $unwind: '$user'
        },

        {
          $project: {
            date: {
              $dateToString: {
                date: '$date',
                format: '%d-%m-%Y %H-%M-%S'
              }
            }, user: '$user.Name', totalAmount: 1, paymentMethod: 1, status: 1

          }
        },

        {
          $group: {
            _id: {
              _id: '$_id', paymentMethod: '$paymentMethod', user: '$user', status: '$status', totalAmount: '$totalAmount', date: '$date'
            }
          }
        },
        {
          $sort: { '_id.date': -1 }
        }

      ]).toArray()

      console.log('Admin Orderssssssss');
      console.log(orders);
      resolve(orders)
    })

  },



  getOrderDetails: (orderId) => {

    return new Promise( (resolve, reject) => {

      db.get().collection(collection.ORDER_COLLECTION).aggregate([

        {
          $match: { _id: objectId(orderId) }
        },
        {

          $lookup: {

            from: collection.USER_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }

        },

        {
          $unwind: '$products'
        },



        {
          $lookup:
          {
            from: collection.ADDRESS_COLLECTION,
            localField: 'deliveryDetails',
            foreignField: '_id',
            as: 'address'
          }
        },

        {
          $unwind: '$user'
        },

        {
          $unwind: '$address'
        },
        {
          $project: { address: 1, user: 1, item: '$products.item', quantity: '$products.quantity', status: 1, totalAmount: 1, couponoffer: 1, walletoffer: 1, discount: 1 }
        },

        {
          $project: {
            productdiscount: {
              $cond: {
                if: '$item.productoffer', then: '$item.productdiscount',
                else: {
                  $cond: { if: '$item.offer', then: '$item.categoryDiscount', else: 0 }
                }
              }
            }, address: 1, user: 1, item: 1, date: 1, status: 1, paymentMethod: 1, quantity: 1, discount: 1, couponoffer: 1, walletoffer: 1,
            actualPrice: { $multiply: ['$quantity', { $toInt: '$item.Price' }] },
            totaldiscount: {
              $cond: {
                if: '$item.productoffer', then: { $multiply: ['$quantity', '$item.productdiscount'] },
                else: {
                  $cond: { if: '$item.offer', then: { $multiply: ['$quantity', '$item.categoryDiscount'] }, else: 0 }
                }
              }
            }, totalAmount: 1

          }

        },
        {
          $project: {
            productdiscount: 1, address: 1, user: 1, item: 1, date: 1, status: 1, paymentMethod: 1, quantity: 1, discount: 1, couponoffer: 1, walletoffer: 1,
            actualPrice: 1, totaldiscount: 1,
            totalprice: { $subtract: ['$actualPrice', '$totaldiscount'] }, totalAmount: 1
          }

        }


      ]).toArray().then((orderdetails)=>{
        resolve(orderdetails)
      })
      .catch((error)=>{
            reject(error)
      })
    })
  },




  cancelOrder: (orderId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        {
          $set: {
            status: "Canceled",
            cancel: true,
          }

        }).then((response) => {

          console.log(response.status);

          resolve()
        })


    })

  },

  shippOrder: (orderId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        {
          $set: {
            status: "Shipped",
            shipp: true,
            cancel: null,


          }

        }).then((response) => {

          console.log(response.status);

          resolve()
        })


    })

  },

  deliverOrder: (orderId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        {
          $set: {
            status: "Delivered",
            delivered: true,
            cancel: true,
            return: true
          }

        }).then((response) => {

          console.log(response.status);

          resolve()
        })


    })

  },


  paymentMethod: () => {

    return new Promise(async (resolve, reject) => {

      let paymentMode = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{


        $group: {
          _id: '$paymentMethod',

          amount: { $sum: '$totalAmount' }
        }

      },
      {
        $sort: { _id: 1 }
      }

      ]).toArray()

      resolve(paymentMode)

    })
  },

  salesData: () => {

    return new Promise(async (resolve, reject) => {

      let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $unwind: '$products'
        },
        {
          $project: { products: '$products.item', quantity: '$products.quantity' }
        },
        {
          $group: { _id: { products: '$products.Name', Image: '$products.Image', Price: '$products.Price' }, Sold: { $sum: '$quantity' } }
        },
        {
          $sort: { Sold: -1 }
        }

      ]).toArray()

      resolve(data)

    })
  },

  salesMonthly: () => {

    return new Promise(async (resolve, reject) => {

      let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {

          $unwind: '$products'

        },

        {
          $project:
          {
            date: 1, totalAmount: 1, item: '$products.item', quantity: '$products.quantity'
          }
        },

        {
          $lookup:
          {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'products'
          }
        },

        {
          $unwind: '$products'
        },

        {
          $project:
          {
            totalAmount: 1, date: 1, quantity: 1, product: '$products.Name', Price: '$products.Price'
          }
        },

        {
          $group: {
            _id: { month: { $month: '$date' }, year: { $year: "$date" }, product: '$product', price: '$Price' },
            total: { $sum: { $multiply: [{ $toInt: "$products.Price" }, '$quantity'] } }, quantity: { $sum: '$quantity' }
          }
        }



      ]).toArray()


      resolve(data)
    })
  },


  salesDaily: () => {

    return new Promise(async (resolve, reject) => {

      let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $unwind: '$products'
        },

        {
          $project:
          {
            date: 1, totalAmount: 1, item: '$products.item', quantity: '$products.quantity',
          }
        },
        {
          $project: {
            date: 1, totalAmount: 1, item: 1, quantity: 1, discount: {
              $cond: {
                if: '$item.offer', then: '$item.categoryDiscount', else: {
                  $cond: { if: '$item.productoffer', then: '$item.productdiscount', else: 0 },

                }
              }
            }, mrp: {
              $cond: {
                if: '$item.offer', then: { $subtract: [{ $toInt: '$item.Price' }, '$item.categoryDiscount'] }, else: {
                  $cond: { if: '$item.productoffer', then: { $subtract: [{ $toInt: '$item.Price' }, '$item.productdiscount'] }, else: { $toInt: '$item.Price' } },

                }
              }

            }
          }
        },

        {
          $group: {
            _id: { day: { $dayOfMonth: '$date' }, month: { $month: '$date' }, year: { $year: '$date' }, product: '$item.Name', price: '$item.Price', discount: '$discount' },
            total: { $sum: { $multiply: [{ $toInt: "$item.Price" }, '$quantity'] } }, quantity: { $sum: '$quantity' }, totaldiscount: { $sum: '$discount' },
            sellingprice: { $sum: { $multiply: ['$mrp', '$quantity'] } }
          }
        },
        {
          $sort: { '_id.day': 1 }
        }

      ]).toArray()

      resolve(data)
    })
  },



  categorySale: () => {

    return new Promise(async (resolve, reject) => {

      let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $unwind: '$products'
        },
        {
          $project: { product: '$products.item', quantity: '$products.quantity' }
        },
        {
          $lookup: {
            from: collection.CATEGORY_COLLECTION,
            localField: 'product.Category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },

        {
          $group: { _id: { categories: '$category.Category' }, quantity: { $sum: '$quantity' } }
        },
        {
          $sort: { '_id.categories': 1 }
        }

      ]).toArray()
      console.log(data);
      resolve(data)

    })
  },


  totalOrder: () => {

    return new Promise(async (resolve, reject) => {

      let count = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{

        $unwind: '$products'
      },
      {
        $project: { products: 1 }
      },
      {
        $group: { _id: null, count: { $sum: '$products.quantity' } }
      }

      ]).toArray()

      resolve(count[0])
    })
  },

  totalUser: () => {

    return new Promise(async (resolve, reject) => {

      let count = await db.get().collection(collection.USER_COLLECTION).count()

      resolve(count)

    })
  },

  totalRvenue: () => {

    return new Promise(async (resolve, reject) => {

      let totalRvenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $group: { _id: null, total: { $sum: '$totalAmount' } }
        }
      ]).toArray()

      console.log('total revenueeeeeeeeeeeeee', totalRvenue[0]);
      resolve(totalRvenue[0])
    })

  },


  addCoupon: (data) => {

    data.users = []
    return new Promise((resolve, reject) => {

      db.get().collection(collection.COUPON_COLLECTION).insertOne(data)

      resolve()

    })

  },

  getCoupnDetails: () => {

    return new Promise((resolve, reject) => {

      let coupon = db.get().collection(collection.COUPON_COLLECTION).find().sort({ date: -1 }).toArray()

      resolve(coupon)

    })

  },

  addOffer: (data) => {

    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ Category: data.category })

      data.category = objectId(category._id)


      let offer = await db.get().collection(collection.OFFER_COLLECTION).findOne({ category: data.category })
      if (offer) {
        db.get().collection(collection.OFFER_COLLECTION).updateOne({ category: data.category },
          {
            $set: {
              offer: data.offer
            }
          })

        resolve()
      }

      else {


        db.get().collection(collection.OFFER_COLLECTION).insertOne(data)
        resolve()
      }

    })
  },


  getOfferdetails: () => {
    return new Promise(async (resolve, reject) => {

      let offer = await db.get().collection(collection.OFFER_COLLECTION).aggregate([

        {
          $lookup:
          {
            from: collection.CATEGORY_COLLECTION,
            localField: 'category',
            foreignField: '_id',
            as: 'Category'
          }
        },
        {
          $project: { Category: 1, offer: 1 }
        },
        {
          $unwind: '$Category'
        },

      ]).toArray()

      console.log('oferrrrrrrrrrrrrrrrrrrrr');
      console.log(offer);
      resolve(offer)

    })
  },

  applyOffer: (data) => {

    console.log('applyyyyyyyyy');
    console.log(data);
    return new Promise(async (resolve, reject) => {


      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: data.category }).toArray()
      console.log(products);

      if (products) {

        products.map((products) => {
          let newTotal = products.Price - products.Price * (data.offer / 100)

          console.log(newTotal);

          console.log("Discount Priceeeeeeeeeeeeee");

          discount = products.Price - newTotal

          db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: objectId(products._id) },

            {
              $set: {
                discountPrice: newTotal,
                offer: true,
                categoryDiscount: discount,
                productoffer: false,
                productofferpercentage: 0
              }
            })

          resolve()
        })

      }
    })

  },

  deleteOffer: (offerId, cId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.OFFER_COLLECTION).deleteOne({ _id: objectId(offerId) }).then(() => {
        db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ Category: objectId(cId) },
          {
            $set: {
              offer: false
            }
          })

        resolve()

      })

    })


  },

  addBanner: async (data) => {


    let Brand = await db.get().collection(collection.BRAND_COLLECTION).findOne({ Brand: data.Brand })

    data.Brand = objectId(Brand._id)

    return new Promise((resolve, reject) => {


      db.get().collection(collection.BANNER_COLLECTION).insertOne(data)

      resolve()
    })
  },

  getAllBanner: () => {

    return new Promise(async (resolve, reject) => {

      let banner = await db.get().collection(collection.BANNER_COLLECTION).aggregate([
        {
          $lookup:
          {
            from: collection.BRAND_COLLECTION,
            localField: 'Brand',
            foreignField: '_id',
            as: 'brand'
          }
        },
        {
          $unwind: '$brand'
        }
      ]).toArray()

      console.log('Bannerrrrrrrrrr');
      console.log(banner);

      resolve(banner)
    })
  }


}   
