
// -------product validation----------
var pnameEr = document.getElementById('productnameer')
var pdescEr=  document.getElementById('productdescriptioner')
var pstoEr= document.getElementById('stocker')
var ppriEr= document.getElementById('priceer')
var subEr = document.getElementById('submitEr')

function validatePname()
{
    let product = document.getElementById('productname').value
    if(product.length==0)
    {
        pnameEr.innerHTML='Enter Product Name'
        return false;
    }

    if(product.length<3)
    {
        pnameEr.innerHTML='Enter Propper Name'
        return false;
    }
    pnameEr.innerHTML=''
    return true
}

function validatePdesc() {

   let description= document.getElementById('productdescription').value
   if(description.length==0)
   {
    pdescEr.innerHTML='Write Description'
    return false;
   }
   if(description.length<10)
   {
    pdescEr.innerHTML='Write Propper Description'
    return false;
   }
   pdescEr.innerHTML=''
   return true;

}

function validateStock(){
   
    let Stock = document.getElementById('stock').value
    if(Stock.length==0)
    {
        pstoEr.innerHTML='Add Stock'
        return false;
    }
    pstoEr.innerHTML=''
    return true;
}

function validatePrice(){
    let Price = document.getElementById('productprice').value

    if(Price.length==0)
    {
        ppriEr.innerHTML='Enter Price'
        return false;
    }
    ppriEr.innerHTML=''
    return true;
}

function validateProduct(){
    if(!validatePname()||validatePdesc()||validateStock()||validatePrice())
    {
        subEr.innerHTML='Empty field is not allowed'
        return false;
    }
}

// -----------------category validation---------------

var categoryEr = document.getElementById('categoryEr')

function validateCategoryName()
{
    let category = document.getElementById('category').value

    if(category.length==0)
    {
        categoryEr.innerHTML='Write Category'
        return false;
    }
    if(category.length<3)
    {
        categoryEr.innerHTML='Write Category'
        return false;
    }
    categoryEr.innerHTM=''

    return true;
}

function validateCategory(){
    if(!validateCategoryName())

    {
        subEr.innerHTML='Empty field not allowed'
        return false;
    }
}

// ----------subcategory validation---------------

 var subcategoryEr = document.getElementById('subcategoryEr')

function validateSubName()
{
     let subcategory = document.getElementById('subcategory').value
     if(subcategory.length<3)
     {
        subcategoryEr.innerHTML='Write Subcategory'
            return false;
     }
        
     subcategoryEr.innerHTML=''
     return true;

}

function validateSubCategory(){
    if(!validateSubName())
    {
        subEr.innerHTML='Empty field not allowed'
        return false;
    }
}

// --------brand validation-----------

var brandEr =document.getElementById('brandEr')

function validateBrandName(){

    let brand = document.getElementById('brand').value

    if(brand.length<=3)
    {
        brandEr.innerHTML = 'Write Brand'
        return false;
    }
    brandEr.innerHTML=''
    return true

}

function validateBrand(){
    if(!validateBrandName())
    {
        subEr.innerHTML='Empty field not allowed'
        return false;
    }
}

// ---------product offer validation-------------

var productofferEr = document.getElementById('pOfferEr')
function validateProductOfferPercentage()
{
    let productoffer = document.getElementById('productoffer').value
    if(productoffer.length==0)
    {
        productofferEr.innerHTML='Enter Offer'
        return false
    }
    productofferEr.innerHTML=''
    return true
}

function validateProductOffer()
{
    if(!validateProductOfferPercentage())
    {
        subEr.innerHTML='Empty field not allowed'
        return false;
    }
}

// ----------category offer validation-------------

var categoryofferEr = document.getElementById('categoryofferEr')

function validateCategoryPercentage()
{
    let categoryoffer = document.getElementById('categoryoffer').value

    if(categoryoffer.length==0)
    {
        categoryofferEr.innerHTML='Enter Offer'
        return false;
    }
    categoryofferEr.innerHTML=''
    return true;

}

function validateCategoryOffer()
{
    if(!validateCategoryPercentage())
    {
        subEr.innerHTML='Empty field not allowed'
        return false;
    }
}