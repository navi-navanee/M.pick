function addToCart(proId){
    Swal.fire({
        text: "Item added to cart",
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ok'
      }).then((result)=>{
          if(result.isConfirmed){

              $.ajax({
                   url:'/addtocart?id='+proId,
                  method:'get',
                  success:(response)=>{
                      if(response.status){
                          let count=$('#cart-count').html()
                          count=parseInt(count)+1
                          $("#cart-count").html(count)
                          location.reload()
                      
          
                      }
                      
                  }
              })

          }
      })

    

}

function ChangeQuantity(cartId,proId,userId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            user:userId,
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity

        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert("Product removed from cart")
                location.reload()
            }else{
                console.log(response);
                document.getElementById(proId).innerHTML=quantity+count
                document.getElementById('total').innerHTML=response.total
                document.getElementById('total1').innerHTML=response.total
               
  
            }
           
        }
        
    })
}

function removeProduct(cartId,proId){
    $.ajax({
        url:'/remove-cart-product',
        data:{
            cart:cartId,
            product:proId
            
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                  }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload()
                      Swal.fire(
                        'Deleted!',
                        'Your file has been deleted.',
                        'success'
                      )
                    }
                  })
                
            }
        }
    })
}

function removeOrder(orderId,userId,total,paymentMethod,status){
    console.log("calleddd");
    $.ajax({
        url:'/cancel-order',
        data:{
            orderId:orderId,
            userId:userId,
            total:total,
            paymentMethod:paymentMethod,
            status:status           
        },
        method:'post',
        success:(response)=>{
            if(response.cancelOrder){
                alert('product removed from cart')
                location.reload()
            }
        }
    })
}

function addToWishList (proId){
    
    
    $.ajax({
        url:'/addtowishlist?id='+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                
                Swal.fire('Item added to wishlist')
                location.reload()

            }else{
                Swal.fire('Item alredy added')
            }

        }
    })

}


function removeWishlist(wishlistId,proId){
    
        
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You want to remove product from wishlist",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                  }).then((result) => {
                    if (result.isConfirmed) {
                        $.ajax({
                            url:'/remove-wishList-product',
                            data:{
                                wish:wishlistId,
                                product:proId
                            },
                            method:'post',
                            success:(response)=>{

                                location.reload()     
                            }
                    })
                }
            })
        }


        function removeWhish(proId){
            $.ajax({
                url:'/remove-whish/'+proId,
                method:'get',
                success:(response)=>{
                    console.log("whish removed")  
                    if(response){
                        location.reload()
                      }
                }
            })
        }


        

                  
                
