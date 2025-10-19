const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    },
    phone: {
        type: String,
        required: [true, 'Số điện thoại là bắt buộc']
    },
    addressDetail: {
        type: String,
        required: [true, 'Địa chỉ chi tiết là bắt buộc']
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true 
});


addressSchema.pre('save', async function (next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, isDefault: true },
            { isDefault: false }
        );
    }
    next();
});

const addressModel = mongoose.model('address', addressSchema);
module.exports = addressModel;