const productModel = require("../../models/productModel")


const searchProduct = async (req,res) =>{
    try {
        const query = req.query.q

        console.log("Searching products with keyword:", query)

        // tao regex tim tat ca khong phan biet hoa thuong
        const regex = new RegExp(query,'ig')

        // tim product co name hoac category nhu regex
        const product = await productModel.find({
            "$or" : [
                {
                    productName : regex
                },
                {
                    category : regex
                }
            ]
        })

        console.log("Search Product successfully. Found:", product.length, " results for keyword:", query)


        res.json({
            data : product,
            message : "Search Product",
            error : false,
            success : true
        })

    } catch (err) {
        console.log("SearchProduct Controller ERROR:", err.message)

        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = searchProduct