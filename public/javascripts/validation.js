
// ...........................admin side................

$(document).ready(function () {
    $('#adminLogin').validate({
        rules :{
            Email: {
                required: true,
                Email: true
            },
            Password: {
                minlength: 4,
                maxlength:8,
                required: true,
            }
        },
        messages :{
            Email: {
                required: "Enter your Email",
                Email: "Enter a valid Email"
            },
            Password: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters"
            }
        }
    })
    }) 

      // add product form

$(document).ready(function () {
    $('#addProductForm').validate({
        rules: {
            Name: {
                required: true,
                minlength: 5,
            },
            Price: {
                required: true,
                number: true,
            },
            Category: {         
                required: true,
            },
            Description: {         
                required: true,
            },
            image1: {
                required: true
            },
            image2: {
                required: true
            },
            image3: {
                required: true
            },
            image4: {
                required: true
            }
        },
        messages: {
            Name: {
                required: "Enter your Product Name",
                minlength: "Enter at least 5 characters"                
            },
            Price: {
                required: "Enter the Price ",
                number: "Enter a valid number",
            },           
            Category: {
                required: "Select the Category",
            },
            Description: {
                required: "Enter a Discription",
            },
        }
    })

})

//the category form validation

$(document).ready(function () {
    $('#addCategoryForm').validate({
        rules :{
            Category1: {
                required: true,
        
            },
        },
        messages :{
            Category1: {
                required: "Enter the Category Name",

            },
        }
    })
    })    


 //Offers
$(document).ready(function () {
    $('#productPage').validate({
        rules: {
            product: {
                required: true,
            },
         
            startDate: {
                required: true,
            },
            endDate: {
                required: true,
            },
            percentage: {
                required: true,
            },
        }
    })
})

// Bannner mangement


$(document).ready(function () {
    $('#bannerSection').validate({
        rules: {
            Name: {
                required: true,
            },
            link: {
                required: true,
            },
            image: {
                required: true,
            }

        }
    })
})
// category offer

$(document).ready(function () {
    $('#categoryOffer').validate({
        rules: {
            category: {
                required: true,
            },
         
            startDate: {
                required: true,
            },
            endDate: {
                required: true,
            },
            percentage: {
                required: true,
            },
        }
    })
})

//..................... user side.................



$(document).ready(function () {
    $('#user-signup').validate({
        rules: {
            Name: {
                required: true,
                minlength: 4,
                maxlength: 20
            },
            Email: {
                required: true,
                email: true
            },
            Phonenumber: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
           
            Password: {
                minlength: 4,
                maxlength:8,
                required: true,
            }
        },
        messages: {
            Name: {
                required: "Enter your name",
                minlength: "Enter at least 4 characters",
                maxlength: "Enter maximumm 20 caharacters"

            },
            Phonenumber: {
                required: "Enter your mobile number",
                number: "Enter a valid number",
                minlength: "Enter 10 numbers"
            },
            Email: {
                required: "Enter your Email",
                email: "Enter a valid Email"
            },
            Password: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters"
            }
        }
    })
})

$(document).ready(function () {
    $('#loginOtp').validate({
        rules :{
            number:{
                required:true,
                number:true,
                minlength:10,
                maxlength:10
            }

        },
        messages :{
            number :{
            required:"Enter a mobile number",
            number: "Enter a valid mobile number",
            minlength: "Enter 10 numbers",
            maxlength: "Enter without country code"
        }
    }
    })
    })

    $(document).ready(function () {
        $('#otpconform').validate({
            rules :{
                otp:{
                    required:true,
                    number:true,
                    minlength:4,
                    maxlength:4
                }
    
            },
            messages :{
                otp:{
                required:"Enter your otp number",
                number: "Enter a valid otp number",
                minlength: "Enter your 4 digit otp number"
                }
            }
        })
        })

   

 //Check out page of user

 $(document).ready(function () {
    $('#userChangePass').validate({
        rules: {
            password: {
                minlength: 4,
                required: true,
                maxlength: 8,
            },
            password1: {
                minlength: 4,
                required: true,
                maxlength: 8
            },
            password2: {
                minlength: 4,
                required: true,
                maxlength: 8
            },
        },
        messages: {
            password: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters",
                maxlength: "Password must be in 4-8 characters"
            },
            password1: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters",
                maxlength: "Password must be in 4-8 characters"
            },
            password2: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters",
                maxlength: "Password must be in 4-8 characters"
            },
        }
    })

})
 
//add new address in user profle section

$(document).ready(function () {

    $("#addNewAddress-form").validate({

        rules: {
            name: {
                required: true,
            },
            address: {
                required: true
            },
            town: {
                required: true
            },
            pincode: {
                required: true,
                number: true,
                minlength: 6,
                maxlength: 6
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            name: {
                required: "Enter your name",
            },
            address:{
                required: "Enter your House address",

            },
            town:{
                required: "Enter your Town name",

            },
            pincode: {
                required: "Enter a PIN",
                minlength: "PIN must be in 6 characters",
            },
            phone :{
                required:"Enter a mobile number",
                number: "Enter a valid mobile number",
                minlength: "Enter 10 numbers",
                maxlength: "Enter without country code"
            },
            email: {
                required: "Enter your Email",
                email: "Enter a valid Email"
            }
        }
    })

})
$(document).ready(function () {

    $("#editNewAddress-form").validate({

        rules: {
            name: {
                required: true,
            },
            address: {
                required: true
            },
            town: {
                required: true
            },
            pincode: {
                required: true,
                number: true,
                minlength: 6,
                maxlength: 6
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            name: {
                required: "Enter your name",
            },
            address:{
                required: "Enter your House address",

            },
            town:{
                required: "Enter your Town name",

            },
            pincode: {
                required: "Enter a PIN",
                minlength: "PIN must be in 6 characters",
            },
            phone :{
                required:"Enter a mobile number",
                number: "Enter a valid mobile number",
                minlength: "Enter 10 numbers",
                maxlength: "Enter without country code"
            },
            email: {
                required: "Enter your Email",
                email: "Enter a valid Email"
            }
        }
    })

})
$(document).ready(function () {

    $("#checkout-form").validate({

        rules: {
            name: {
                required: true,
            },
            address: {
                required: true
            },
            town: {
                required: true
            },
            pincode: {
                required: true,
                number: true,
                minlength: 6,
                maxlength: 6
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            name: {
                required: "Enter your name",
            },
            address:{
                required: "Enter your House address",

            },
            town:{
                required: "Enter your Town name",

            },
            pincode: {
                required: "Enter a PIN",
                minlength: "PIN must be in 6 characters",
            },
            phone :{
                required:"Enter a mobile number",
                number: "Enter a valid mobile number",
                minlength: "Enter 10 numbers",
                maxlength: "Enter without country code"
            },
            email: {
                required: "Enter your Email",
                email: "Enter a valid Email"
            }
        }
    })

})

// $(document).ready(function () {
//     $('#contact-form').validate({
//         rules :{
//             name:{
//                 required: true,
//                 minlength: 5,
//                 maxlength: 20
//             },
//             email: {
//                 required: true,
//                 email: true
//             },
//             subject: {
//                 required: true,
//             },
//             phone: {
//                 required: true,
//                 number: true,
//                 minlength: 10,
//                 maxlength: 10,
//             },
//             message:{
//                 required: true,        
//             }
//         },
//         messages :{
//             name:{
//                 required: "Enter your name",
//                 minlength: "Enter at least 4 characters",
//                 maxlength: "Enter maximumm 20 caharacters"
//             },
//             email: {
//                 required: "Enter your Email",
//                 email: "Enter a valid Email"
//             },
//             subject: {
//                 required: "Enter Your Subject Here",
//             },
//             phone:{
//                 required:"Enter a mobile number",
//                 number: "Enter a valid mobile number",
//                 minlength: "Enter 10 numbers",
//                 maxlength: "Enter without country code"
//             },
//             message:{
//                 required:"Enter Your Messege Here",
//             }
//         }
//     })
//     }) 


   