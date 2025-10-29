const orderModel = require("../model/order");
const productModel = require("../model/productModel");
const reviewModel = require("../model/reviewModel");



const reviewController = {


    updateProductAverageRating: async (productId) => {
        try {
            console.log(`Updating average rating for product ${productId}...`);

            const reviews = await reviewModel.find({ product: productId }).select('rating');

            let totalRating = 0;
            const numberOfReviews = reviews.length;

            if (numberOfReviews > 0) {
                // Tính tổng điểm đánh giá
                totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            }

            // Tính điểm trung bình và làm tròn
            let averageRating = 0;
            if (numberOfReviews > 0) {
                const rawAverage = totalRating / numberOfReviews;
                // Làm tròn đến 2 chữ số thập phân
                averageRating = parseFloat(rawAverage.toFixed(2));
            }

            await productModel.findByIdAndUpdate(
                productId,
                {
                    averageRating,
                    numberOfReviews
                },
                { new: true }
            );

            console.log(`Product ${productId} updated: Rating=${averageRating}, Reviews=${numberOfReviews}`);

        } catch (error) {
            console.error(`Failed to update average rating for product ${productId}:`, error.message);
        }
    },

    addReview: async (req, res) => {
        try {
            const { product, rating, comment, reviewImages } = req.body;
            const userId = req.userId; 

            console.log("Create Review request by user:", userId);

            if (!product || !rating) {
                throw new Error("Product ID and rating are required.");
            }

            // check lich su mua hang
            const hasPurchased = await orderModel.findOne({
                user: userId,
                'orderItems.product': product,
                orderStatus: { $in: ['DELIVERED'] } 
            });

            if (!hasPurchased) {
                throw new Error("Permission denied. You can only review products that you have purchased and received.");
            }
            
            const reviewData = {
                rating: rating,
                comment: comment,
                reviewImages: reviewImages || [] 
            };
            
            const existingReview = await reviewModel.findOne({ user: userId, product: product });
            let savedReview;

            if (existingReview) {
                // Nếu đã tồn tại, cập nhật
                savedReview = await reviewModel.findByIdAndUpdate(
                    existingReview._id, 
                    reviewData, 
                    { new: true }
                );
                console.log(`Review updated for user ${userId} on product ${product}`);
            } else {
                // Tạo đánh giá mới
                const newReview = new reviewModel({
                    user: userId,
                    product: product,
                    ...reviewData
                });
                savedReview = await newReview.save();
                console.log(`New review created by user ${userId} for product ${product}`);
            }
            
            // Cập nhật Rating trên Product Model
            await reviewController.updateProductAverageRating(product);

            console.log("Create Review successfully — User-ID:", userId);

            res.status(201).json({
                message: "Review added/updated successfully",
                error: false,
                success: true,
                data: savedReview
            });

        } catch (err) {
      console.error("AddReview Controller ERROR:", {
        message: err.message,
        stack: err.stack
      });
      
      res.status(400).json({
        message: err.message,
        error: true,
        success: false
      });
    }},



    updateReview: async (req, res) => {
        try {
            const reviewId = req.params.id; 
            const userId = req.userId;
            
            const { rating, comment, reviewImages } = req.body;

            log.console.log("Update Review request by user:", userId, "for review:", reviewId);

            
            const review = await reviewModel.findById(reviewId);

            if (!review) {
               throw new Error("Review not found.");
            }

            if (review.user.toString() !== userId.toString()) {
                throw new Error("Permission denied. You can only update your own review.");
            }

            // Create Payload
            const updatePayload = {
                rating: rating,
                comment: comment,
                reviewImages: reviewImages || [] 
            };
            
            // Update Review
            const updatedReview = await reviewModel.findByIdAndUpdate(
                reviewId, 
                updatePayload, 
                { new: true, runValidators: true } 
            );

            await reviewController.updateProductAverageRating(review.product);

            console.log("Update Review successfully — Review ID:", reviewId);

            res.json({
                message: "Review updated successfully",
                success: true,
                error: false,
                data: updatedReview
            });

        } catch (err) {
            console.error("UpdateReview Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({ 
                message: err.message || "Could not update review.",
                error: true,
                success: false
            });
        }
    },




    deleteReview: async (req, res) => {
        try {
            const reviewId = req.params.id;
            const userId = req.userId; 

            console.log("Delete Review request by user:", userId, "for review:", reviewId);

            const review = await reviewModel.findById(reviewId);

            if (!review) {
                throw new Error("Review not found.");
            }

            if (review.user.toString() !== userId.toString()) {
                throw new Error("Permission denied. You can only delete your own reviews.");
            }

            const productId = review.product; 
            
            await reviewModel.findByIdAndDelete(reviewId);

            await reviewController.updateProductAverageRating(productId);

            console.log("Delete Review successfully — Review ID:", reviewId);

            res.json({
                message: "Review deleted successfully",
                success: true,
                error: false
            });

        } catch (err) {
            console.error("DeleteReview Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(500).json({
                message: err.message || "Could not delete review.",
                error: true,
                success: false
            });
        }
    },



    getProductReviews: async (req, res) => {
        try {
            const { productId } = req.params; 

            // Fetch reviews for the product
            const reviews = await reviewModel.find({ product: productId })
                                            .populate('user', 'name profilePic') 
                                            .sort({ createdAt: -1 });

            res.json({
                message: "Product reviews fetched successfully",
                data: reviews,
                success: true,
                error: false,
                reviewCount: reviews.length
            });

        } catch (err) {
            console.error("GetProductReviews Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(500).json({
                message: err.message || "An unexpected error occurred while fetching reviews.",
                error: true,
                success: false
            });
        }
    }



};


module.exports = reviewController;