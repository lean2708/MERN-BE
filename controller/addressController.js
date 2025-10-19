const addressModel = require("../model/address");


const createAddress = async (req, res) => {
    try {
        // Lấy _id từ token (đã được giải mã bởi middleware)
        const userId = req.userId; 
        const { phone, addressDetail, isDefault } = req.body;

        if (!phone || !addressDetail) {
            return res.status(400).json({ message: "Vui lòng cung cấp SĐT và địa chỉ chi tiết." });
        }

        const newAddress = new addressModel({
            user: userId,
            phone,
            addressDetail,
            isDefault: isDefault || false
        });

        // Gọi .save() sẽ kích hoạt hook pre('save') trong model của bạn
        const savedAddress = await newAddress.save();

        res.status(201).json({
            message: "Tạo địa chỉ thành công",
            address: savedAddress
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};


const getUserAddresses = async (req, res) => {
    try {
        const userId = req.userId; 

        // Sắp xếp để địa chỉ "mặc định" (isDefault: true) luôn ở trên cùng
        const addresses = await addressModel.find({ user: userId })
                                            .sort({ isDefault: -1, updatedAt: -1 });

        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};



const updateAddress = async (req, res) => {
    try {
        const userId = req.userId; 
        const addressId = req.params.id;
        const { phone, addressDetail, isDefault } = req.body;

        // 1. Tìm địa chỉ bằng ID
        const address = await addressModel.findById(addressId);

        if (!address) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ." });
        }

        // 2. Kiểm tra chính chủ
        if (address.user.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền sửa địa chỉ này." });
        }

        // 3. Cập nhật các trường
        address.phone = phone || address.phone;
        address.addressDetail = addressDetail || address.addressDetail;
        
        // Chỉ cập nhật isDefault nếu nó được truyền lên (kể cả là true hay false)
        if (isDefault !== undefined) {
            address.isDefault = isDefault;
        }

        // 4. Gọi .save() để kích hoạt hook pre('save')
        // Đây là bước quan trọng để logic isDefault của bạn hoạt động
        const updatedAddress = await address.save();

        res.status(200).json({
            message: "Cập nhật địa chỉ thành công",
            address: updatedAddress
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};


const deleteAddress = async (req, res) => {
    try {
        const userId = req.userId; 
        const addressId = req.params.id;

        // Xóa địa chỉ nếu nó tồn tại VÀ thuộc về đúng người dùng
        const deletedAddress = await addressModel.findOneAndDelete({
            _id: addressId,
            user: userId
        });

        if (!deletedAddress) {
            // Bao gồm 2 trường hợp: 
            // 1. ID địa chỉ không tồn tại
            // 2. Địa chỉ tồn tại nhưng không phải của user này
            return res.status(404).json({ message: "Không tìm thấy địa chỉ hoặc bạn không có quyền xóa." });
        }

        res.status(200).json({ message: "Xóa địa chỉ thành công." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};



module.exports = {
    createAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress
};