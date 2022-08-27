
function addToCart(proId) {
    $.ajax({
        url: '/addcart/' + proId,

        method: 'get',

        success: (response) => {
            if (response.status) {
                //   location.reload()
                let count = $('#cartcount').html()
                count = parseInt(count) + 1
                $('#cartcount').html(count)

            }

        }
    })
}



function changeQuantity(cartId, proId, userId, count) {
    console.log(userId)
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    $.ajax({

        url: '/change-product-quantity',
        data: {

            cart: cartId,
            product: proId,
            count: count,
            user: userId,
            quantity: quantity
        },

        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product Removed")
                location.reload()
            }
            else {
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('totalvalue').innerHTML = response.total.total
                document.getElementById('subtotal').innerHTML = response.total.subtotal
                document.getElementById('discount').innerHTML = response.total.discount


            }

        }
    })
}



function removeCart(cartId, proId) {

    $.ajax
        ({
            url: '/remove-cart',
            data:
            {
                cart: cartId,
                product: proId
            },

            method: 'post',

            success: (response) => {

                if (response.removeProduct) {

                    alert('product removed')
                    location.reload()

                }
                else {
                    console.log("Hello")
                }
            }
        })
}


function addTowhishList(proId) {
    $.ajax({

        url: '/addtowhishlist/' + proId,
        method: 'get',

        success: (response) => {

            if (response.removed) {

                let count = $('#whishlistcount').html()
                console.log(count);
                count = parseInt(count) - 1
                $('#whishlistcount').html(count)

            } else {
                let count = $('#whishlistcount').html()
                console.log(count);
                count = parseInt(count) + 1
                $('#whishlistcount').html(count)
            }
        }

    })
}


$('#coupon-form').submit((e) => {

    e.preventDefault()

    $.ajax({
        url: '/verifycoupon',
        method: 'post',
        data: $('#coupon-form').serialize(),

        success: (response) => {

            if (response.noCoupon) {
                document.getElementById('coupenError').innerHTML = 'coupon dosent exist'
            }

            else if (response.couponExpired) {

                document.getElementById('coupenError').innerHTML = 'coupon expired'

            }
            else if (response.exist) {

                document.getElementById('coupenError').innerHTML = 'You have already used this coupon'

            }
            else 
            {
                document.getElementById('totalvalue').innerHTML = Math.ceil(response.total)
                document.getElementById('totalvalue2').value = Math.ceil(response.total)
                document.getElementById('coupon').innerHTML = Math.ceil(response.couponamount)
                document.getElementById('coupon2').value =Math.ceil( response.couponamount)
                document.getElementById('wallettotal').value=response.total
                console.log(document.getElementById('coupon2').value);


            }
        }

    })
})


$('#wallet-form').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/applywallet',
        method:'post',
        data:$('#wallet-form').serialize(),

        success:(response)=>{
            if(response.walletempty)
            {
                document.getElementById('walleterr').innerHTML='You Dont Have Enough Amount In Your Wallet'
            }
            else
            {

                document.getElementById('totalvalue').innerHTML = response.newTotal
                document.getElementById('totalvalue2').value = response.newTotal
                document.getElementById('wallet').innerHTML=response.deductedWalletAmount
                document.getElementById('wallet1').value=response.updatedWalletAmount
                document.getElementById('wallet2').value=response.deductedWalletAmount
                document.getElementById('coupontotal').value=response.newTotal

            }
        }
    })
})
