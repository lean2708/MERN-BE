const productModel = require("../model/productModel");
const checkAdminPermission = require("../helpers/permission");



const productController = {

    // Create Product
    uploadProduct: async (req, res) => {
        try {

            const isAdmin = await checkAdminPermission(req.userId);
            if (!isAdmin) {
              throw new Error("Permission denied. Admin access only.");
            }

            const sessionUserId = req.userId;

            console.log("Upload Product request by user:", sessionUserId);

            const uploadProduct = new productModel(req.body);
            const saveProduct = await uploadProduct.save();

            console.log("Upload Product successfully — Product ID:", saveProduct._id, "uploaded by user:", sessionUserId);

            res.status(201).json({
                message: "Product upload successfully",
                error: false,
                success: true,
                data: saveProduct
            });

        } catch (err) {
            console.log("UploadProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    
    // Get All Products
    getAllProducts: async (req, res) => {
        try {
            console.log("Get All Product...");
            const allProduct = await productModel.find().sort({ createAt: -1 });
            console.log("Get All Product completed successfully.");

            res.json({
                message: "All Product",
                success: true,
                error: false,
                data: allProduct
            });

        } catch (err) {
            console.log("GetProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    
    // Update Product
    updateProduct: async (req, res) => {
        try {
            console.log("Update Product");

            if (!checkAdminPermission(req.userId)) {
                throw new Error("Permission denied");
            }

            const { _id, ...resBody } = req.body;
            const updateProduct = await productModel.findByIdAndUpdate(_id, resBody, { new: true });

            console.log("Update Product successfully — Product ID:", _id, ", updated by user:", req.userId);

            res.json({
                message: "Product update successfully",
                data: updateProduct,
                success: true,
                error: false
            });

        } catch (err) {
            console.log("UpdateProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    
    // Fetch products by category
    getCategoryWiseProduct: async (req, res) => {
        try {
            const { category } = req?.body || req?.query;
            console.log("Fetch products by category:", category);

            const product = await productModel.find({ category });
            console.log("getCategoryWiseProduct request completed successfully");

            res.json({
                data: product,
                message: "Product",
                success: true,
                error: false
            });

        } catch (err) {
            console.log("GetCategoryWiseProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    
    // Get one product per category
    getOneProductPerCategory: async (req, res) => {
        try {
            console.log("Fetch one product per category...");
            const productCategory = await productModel.distinct("category");
            console.log("category", productCategory);

            const productByCategory = [];
            for (const category of productCategory) {
                const product = await productModel.findOne({ category });
                if (product) {
                    productByCategory.push(product);
                }
            }

            console.log("getCategoryProduct request completed successfully");

            res.json({
                message: "category product",
                data: productByCategory,
                success: true,
                error: false
            });

        } catch (err) {
            console.log("GetCategoryProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    

    // Get Product Details by ProductId
    getProductDetails: async (req, res) => {
        try {
            const { productId } = req.body;
            console.log("Fetch Product Details By ProductId:", productId);

            const product = await productModel.findById(productId);
            console.log("Fetch Product Details completed successfully for ID:", productId);

            res.json({
                data: product,
                message: "Ok",
                success: true,
                error: false
            });

        } catch (err) {
            console.log("GetProductDetails Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    

    // Search Product
    searchProduct: async (req, res) => {
        try {
            const query = req.query.q;
            console.log("Searching products with keyword:", query);

            const regex = new RegExp(query, 'ig');
            const product = await productModel.find({
                "$or": [
                    { productName: regex },
                    { category: regex }
                ]
            });

            console.log("Search Product successfully. Found:", product.length, " results for keyword:", query);

            res.json({
                data: product,
                message: "Search Product",
                error: false,
                success: true
            });

        } catch (err) {
            console.log("SearchProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    

    // Filter Product by Categories
    filterProduct: async (req, res) => {
        try {
            console.log("Product filter...");
            const categoryList = req?.body?.category || [];
            
            const product = await productModel.find({
                category: {
                    "$in": categoryList
                }
            });

            console.log("Product filter completed successfully");

            res.json({
                data: product,
                message: "product filter",
                error: false,
                success: true
            });

        } catch (err) {
            console.log("FilterProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },



    
};



module.exports = productController;