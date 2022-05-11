
 function deleteaddress(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete ",
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
 
   