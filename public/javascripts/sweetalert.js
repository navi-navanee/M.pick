

  function blockuser(event) {
   event.preventDefault();
   var link = event.currentTarget.href;
   var name = event.currentTarget.name;
   Swal.fire({
       title: 'Are you sure?',
       text: "Do you want to Block " + name,
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#3085d6',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Yes'
   }).then((result) => {
       if (result.isConfirmed) {
           window.location = link;
       }
       else {
           return false;
       }
   })
}

function unblockuser(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to unblock " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location = link;
        }
        else {
            return false;
        }
    })
 }

 function dleateuser(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to dleate " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location = link;
        }
        else {
            return false;
        }
    })
 }
