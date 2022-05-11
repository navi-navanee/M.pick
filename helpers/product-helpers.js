const collections = require('../config/collections')
var db=require('../config/connection ')
// var collection=require('../config/collections')
const async = require('hbs/lib/async')
const { reject } = require('bcrypt/promises')
const { get } = require('express/lib/response')
const { AutoEncryptionLoggerLevel } = require('mongodb')
var objectId=require('mongodb').ObjectId

module.exports={
    addProduct:(product,calllback)=>{
        // console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
            calllback(data.insertedId)
        })
    },
    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)

        })
    
    },
    // getAllProducts:(userId)=>{
    //     console.log("im user",userId);
    //     return new Promise(async (resolve, reject) => {
            
    //         let product = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([        
    //             {
    //                 $lookup:{
    //                     from:collections.WISHLIST_COLLECTION,
    //                     localField: '_Id',
    //                     foreignField:'user',
    //                     as: 'wishlist'
    //                 }
    //             },
    //             // {
    //             //     $project: {
    //             //         Name:1,Price:1,Category:1,Description:1,wishlist:{$arrayElemAt:['$wishlist',0]}
    //             //     },
    //             // },
                
    //         ]).toArray()
    //         console.log("BOss",product);
    //         // console.log("bokkk",product[0]?.wishlist);
    //         resolve(product)

    //     })
    
    // },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
               resolve(response)
           })
        })
    },

    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })

        })
    },
    getallCategory:()=>{
        return new Promise(async(resolve,reject)=>{
           let category=await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
           resolve(category)
        })

    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category,

                }
            }).then((response)=>{
                resolve()
            })
        })
    },
   productdetails:(id)=>{
      
       return new Promise(async(resolve,reject)=>{
           let product=await db.get().collection(collections.PRODUCT_COLLECTION).find({_id:objectId(id)}).toArray()
           resolve(product)
           console.log(product);
           })
   },
   sortedproducts:(id)=>{
       console.log(id);
       return new Promise(async(resolve,reject)=>{
           let product=await db.get().collection(collections.PRODUCT_COLLECTION).find({Category:id}).toArray()
           resolve(product)
       })
   },
   
   handleWishlist: (wishlist, products) => {
    return new Promise((resolve, reject) => {
        console.log("..................",wishlist)
      if (wishlist?.product) {
        wishlist = wishlist.product.map((product) => product.item.toString());
        products.forEach((product) => {
          if (wishlist.includes(product._id.toString())) {
            product.wish = true;
          }
        });
      }
      resolve(products);
      console.log("hushushus", products);
    });
  },

}    

