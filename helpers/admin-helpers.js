var db=require('../config/connection ')
// var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { promise, reject } = require('bcrypt/promises')
const async = require('hbs/lib/async')
const collections = require('../config/collections')
var objectId=require('mongodb').ObjectId
const moment=require('moment')
module.exports={
  doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let admin=await db.get().collection(collections.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if(admin){
               bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                   if(status){
                       console.log("login success");
                       response.admin=admin
                       response.status=true
                       resolve(response)
                   }else{
                       console.log("login failed");
                       resolve({status:false})
                   }

               })
            }else{
                console.log('login failed1');
                resolve({status:false})
            }
        })
    },
    blockusers:(id)=>{ 
        return new Promise((res,rej)=>{

            db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(id)},{
                $set:{
                    Status:false
                }
            }).then(()=>{
                res()
    
            })
        })

    },
    unblockusers:(id)=>{ 
        return new Promise((res,rej)=>{

            db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(id)},{
                $set:{
                    Status:true
                }
            }).then(()=>{
                res()
    
            })
        })

    },
    deleteusers:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).deleteOne({_id:objectId(id)}).then((data)=>{
                resolve(data)
            })

        })
    },

    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category=await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    addCategory:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne(id).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },
    deleteCategory:(proId)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collections.CATEGORY_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
               resolve(response)
           })
        })
    },

    getCategoryDetails:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).findOne({_id:objectId(catId)}).then((category)=>{
                resolve(category)
            })

        })
    },

    updateCategory:(catId,catDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{
                $set:{
                    Category1:catDetails.Name,
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    findProductsCat:(cat,data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).updateMany({Category:cat},{
                $set:{
                    Category:data
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    getallOrders:()=>{

        return new Promise(async(resolve,redirect)=>{
            let data=await db.get().collection(collections.ORDER_COLLECTION).find().sort({$natural:-1}).toArray()
            resolve(data)

        })
    },

    updatestatus:(id,status)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(id)},
            {
                $set:{
                    status:status,
                }
            }).then((response)=>{
                resolve(response)
            })
        })

    },
    dashboard:()=>{
        return new Promise(async(resolve,reject)=>{
            let today=new Date()
            let end= moment(today).format('YYYY/MM/DD')
            let start=moment(end).subtract(30,'days').format('YYYY/MM/DD')
            let orderSuccess= await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:{ $ne: 'canceled' }}).toArray()
            let orderPending= await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:'pending'}).toArray()
            let orderCancel= await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:'canceled'}).toArray()
            let allUser= await db.get().collection(collections.USER_COLLECTION).find().toArray()
            let products= await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            let orderTotal = await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:start,$lte:end}}).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderPendingLength = orderPending.length
            let orderCancelLength =  orderCancel.length
            let allUserLength = allUser.length
            let productsLength = products.length

            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total=0;
            let paypal=0;
            let razorpay=0;
            let COD=0;
            for(let i=0;i<orderSuccessLength;i++){
                total=total+orderSuccess[i].totalAmount;
                if(orderSuccess[i].paymentMethod=='PAYPAL'){
                    paypal++;
                }else if(orderSuccess[i].paymentMethod=='RAZORPAY'){
                    razorpay++;
                }else{
                    COD++;
                }
            }
            var data = {
               start: start,
               end: end,


               totalOrders: orderTotalLength,
               successOrders: orderSuccessLength,
               pendingOrder:orderPendingLength,
               cancelOrder:orderCancelLength,
               totalUser:allUserLength,
               totalProducts:productsLength,


               faildOrders: orderFailLength,
               totalSales: total,
               cod: COD,
               paypal: paypal,
               razorpay: razorpay,
            //    currentOrders: orderSuccess
           }
       resolve(data)
       })
    },
    salesreport:(details)=>{
        console.log("this is",details);
        return new Promise(async(resolve,reject)=>{
            // let today=new Date()
            let end= moment(details.EndDate).format('YYYY/MM/DD')
            let start=moment(details.StartDate).format('YYYY/MM/DD')
            console.log(end,start);
            let orderSuccess= await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:{ $ne: 'canceled' }}).toArray()
            let orderPending= await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:'pending'}).toArray()
            let orderCancel= await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:'canceled'}).toArray()
            let allUser= await db.get().collection(collections.USER_COLLECTION).find().toArray()
            let products= await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            let orderTotal = await db.get().collection(collections.ORDER_COLLECTION).find({date:{$gte:start,$lte:end}}).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderPendingLength = orderPending.length
            let orderCancelLength =  orderCancel.length
            let allUserLength = allUser.length
            let productsLength = products.length

            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total=0;
            let paypal=0;
            let razorpay=0;
            let COD=0;
            for(let i=0;i<orderSuccessLength;i++){
                total=total+orderSuccess[i].totalAmount;
                if(orderSuccess[i].paymentMethod=='PAYPAL'){
                    paypal++;
                }else if(orderSuccess[i].paymentMethod=='RAZORPAY'){
                    razorpay++;
                }else{
                    COD++;
                }
            }
            var data = {
               start: start,
               end: end,


               totalOrders: orderTotalLength,
               successOrders: orderSuccessLength,
               pendingOrder:orderPendingLength,
               cancelOrder:orderCancelLength,
               totalUser:allUserLength,
               totalProducts:productsLength,


               faildOrders: orderFailLength,
               totalSales: total,
               cod: COD,
               paypal: paypal,
               razorpay: razorpay,
            //    currentOrders: orderSuccess
           }
       resolve(data)
       })
    },
    getAllProduct:()=>{
        return new Promise((resolve,reject)=>{
            let product=db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },

    addProductOffer: (data) => {
        return new Promise(async(resolve,reject)=>{
           data.startDate=moment(data.startDate).format('YYYY/MM/DD')
           data.endDate=moment(data.endDate).format('YYYY/MM/DD')
           let response={}
           let exist= await db.get().collection(collections.PRODUCT_COLLECTION).findOne({Name:data.product,offer:{$exists:true}});
           if(exist){
               response.exist=true
               resolve(response)
           }else{
            db.get().collection(collections.PRODUCT_OFFERS).insertOne(data).then((response) => {
                resolve(response)
            }).catch((err)=>{
                rej(err)
            })
           }
        })
    
    },
    
getAllProductOffers:()=>{
    return new Promise((res,rej)=>{
       let productoff=db.get().collection(collections.PRODUCT_OFFERS).find().toArray()
       res(productoff)
    })
},
deleteProductOffer:(Id)=>{
    return new Promise(async(resolve,reject)=>{
        let productoff=await db.get().collection(collections.PRODUCT_OFFERS).findOne({_id:objectId(Id)})
        let proname=productoff.product;
        let Product=await db.get().collection(collections.PRODUCT_COLLECTION).findOne({Name:proname})
        db.get().collection(collections.PRODUCT_OFFERS).deleteOne({_id:objectId(Id)})
        db.get().collection(collections.PRODUCT_COLLECTION).updateOne({Name:proname},{
            $set:{
                Price:Product?.actualPrice
            },
            $unset:{
               actualPrice:"",
               offer:"",
               percentage:""
            }
        }).then(()=>{
            resolve()
        }).catch((err)=>{
            res(err)
        })
    })

    },

    startProductOffer: (todayDate) => {
        let proStartDate = moment(todayDate).format('YYYY/MM/DD')
        return new Promise(async (res, rej) => {
            let data = await db.get().collection(collections.PRODUCT_OFFERS).find({ startDate: { $lte: proStartDate } }).toArray();
            console.log("this is data", data);
            if (data) {
                await data.map(async (onedata) => {
                    let product = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ Name: onedata.product, offer: { $exists: false } })
                    console.log("this is product", product);
                    if (product) {
                        let actualPrice = product.Price
                        let newP = (((product.Price) * (onedata.percentage)) / 100)
                        let newPrice = actualPrice - newP;

                        newPrice = newPrice.toFixed()
                        console.log(actualPrice, newPrice, onedata.percentage);
                        console.log("hellow");
                        db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) }, {
                            $set: {
                                actualPrice: actualPrice,
                                Price: newPrice,
                                offer: true,
                                percentage: onedata.percentage
                            }
                        })
                        res()
                    } else {
                        res()
                    }

                })

            } else {
                res()
            }
        })
    },
    getAllCategoryOffers: () => {
        return new Promise((resolve,reject)=>{
            let categoryOffer=db.get().collection(collections.CATEGORY_OFFERS).find().toArray()
            resolve(categoryOffer)
        })
    },

    addCategoryOffer:(data)=>{
        console.log("this is ",data);
        data.endDate=moment(data.endDate).format('YYYY/MM/DD')
        data.startDate=moment(data.startDate).format('YYYY/MM/DD')
        return new Promise(async(resolve,reject)=>{
          let exist=await db.get().collection(collections.CATEGORY_OFFERS).findOne({category:data.category})
          console.log(exist)
          if(exist){
            resolve()
          }else{
      
            db.get().collection(collections.CATEGORY_OFFERS).insertOne(data).then((response)=>{
              resolve(response)
            })
          }
        })
      },

      deleteCategoryOffer:(id)=>{
        return new Promise(async(res,rej)=>{
            let categoryOffer= await db.get().collection(collections.CATEGORY_OFFERS).findOne({_id:objectId(id)})
            console.log("the offer is",categoryOffer);
            let catName=categoryOffer.category
            let product=await db.get().collection(collections.PRODUCT_COLLECTION).find({Category:catName},{offer:{$exists:true}}).toArray()
            if(product){
                db.get().collection(collections.CATEGORY_OFFERS).deleteOne({_id:objectId(id)}).then(async()=>{
                    await product.map((product)=>{

                        db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(product._id)},{
                            $set:{
                                Price: product.actualPrice
                            },
                            $unset:{
                                offer:"",
                                percentage:'',
                                actualPrice:''
                            }
                        }).then(()=>{
                            res()
                        })
                    })
                })
            }else{
                res()
            }

        })

    },

    startCategoryOffer:(date)=>{
        let catStartDate=moment(date.startDate).format('YYYY/MM/DD')
        console.log('this is a category offer.................... ',date);
        return new Promise(async(res,rej)=>{
            let data= await db.get().collection(collections.CATEGORY_OFFERS).find({startDate:{$lte:catStartDate}}).toArray();
            if (data.length > 0) {
                await data.map(async (onedata) => {
                    console.log("ondataaa",onedata);

                    let products = await db.get().collection(collections.PRODUCT_COLLECTION).find({Category:onedata.category, offer: { $exists: false } }).toArray();

                    await products.map(async (product) => {
                        console.log("profgghjb",product);
                        let actualPrice = product.Price
                        let newPrice = (((product.Price) * (onedata.percentage)) / 100)
                        newPrice = newPrice.toFixed()
                        console.log(actualPrice, newPrice, onedata.percentage);
                        db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id: objectId(product._id) },
                            {
                                $set: {
                                    actualPrice: actualPrice,
                                    Price:(actualPrice - newPrice),
                                    offer:true,
                                    percentage:onedata.percentage
                                }
                            })
                    })
                })
                res();
            }else{
                res()
            }

        })

    },
    addBanner:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.BANNER_COLLECTION).insertOne(id).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },
    getAllBanner:()=>{
        return new Promise((resolve,reject)=>{
          let banner=db.get().collection(collections.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },
    deleteBanner:(Id)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collections.BANNER_COLLECTION).deleteOne({_id:objectId(Id)}).then((response)=>{
               resolve(response)
           })
        })
    },


    // coupon segment

    addCoupon:(data)=>{
        console.log("the data..",data);
        return new Promise(async(res,rej)=>{
           let startDate=moment(data.startDate).format('YYYY-MM-DD') 
            let endDate =moment(data.endDate).format('YYYY-MM-DD')
            let dataobj = {
               Coupon: data.couponCode,
               Offer:parseInt(data.percentage),
               startDate:startDate,
               endDate:endDate,
               Users: []
           }
           db.get().collection(collections.COUPON_COLLECTION).insertOne(dataobj).then(()=>{
               res()
           }).catch((err)=>{
               res(err)
           })
    
        })
    },
    
    getAllCoupons:()=>{
        return new Promise((res,rej)=>{
            let coupon=db.get().collection(collections.COUPON_COLLECTION).find().toArray()
            res(coupon)
        })
        
    },
    deleteCoupon: (id) => {
        return new Promise((res,rej)=>{
            db.get().collection(collections.COUPON_COLLECTION).deleteOne({_id:objectId(id)}).then(()=>{
                res()
            })
        })
    
    },

    startCouponOffers:(date)=>{
        let couponStartDate = moment(date.startDate).format('YYYY-MM-DD')
       return new Promise(async(res,rej)=>{
           let data= await db.get().collection(collections.COUPON_COLLECTION).find({$and:[{startDate:{$lte:couponStartDate}},{endDate:{$gte:couponStartDate}}]}).toArray()
           console.log("this is the result ",data);
           if(data.length >0){
               await data.map((onedata)=>{
                   db.get().collection(collections.COUPON_COLLECTION).updateOne({_id:objectId(onedata._id)},{
                     $set:{
                       Available: true
                     }
                   }).then(()=>{
                       res()
                   })
               })
           }else{
               res()
           }
       })
    
    
    },
    getUserdetails: (Id) => {
        return new Promise(async (res, rej) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(Id) })
            if (user) {
                res(user)
            } else {
                console.log("else");
                res(false)
            }
        })
    },


}


