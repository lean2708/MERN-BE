const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'product', 
        required: true
    },

    rating: {
        type: Number,
        required: [true, 'Điểm đánh giá là bắt buộc'],
        min: [1, 'Điểm đánh giá phải lớn hơn hoặc bằng 1'],
        max: [5, 'Điểm đánh giá phải nhỏ hơn hoặc bằng 5']
    },
    comment: {
        type: String,
        trim: true
    },

    reviewImages: {
        type: [String], 
        default: []
    }

}, {
    timestamps: true 
});

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const reviewModel = mongoose.model('review', reviewSchema);

module.exports = reviewModel;