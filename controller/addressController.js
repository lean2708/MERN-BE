const addressModel = require("../model/address");


const createAddress = async (req, res) => {
    try {
        const userId = req.userId; 
        const { phone, addressDetail, isDefault } = req.body;

        if (!phone || !addressDetail) {
            return res.status(400).json({ message: "Provide phone and address detail." });
        }

        const newAddress = new addressModel({
            user: userId,
            phone,
            addressDetail,
            isDefault: isDefault || false
        });

        const savedAddress = await newAddress.save();

        res.status(201).json({
            data : savedAddress, 
            success : true,
            error : false,
            message : "Address created successfully!"
        });

    } catch (err) {
        console.log("Create Address Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};


const getUserAddresses = async (req, res) => {
    try {
        const userId = req.userId; 

        // Sắp xếp để địa chỉ "mặc định" (isDefault: true) luôn ở trên cùng
        const addresses = await addressModel.find({ user: userId })
                                            .sort({ isDefault: -1, updatedAt: -1 });

        res.status(200).json({
            data : addresses, 
            success : true,
            error : false,
            message : "Get list address successfully!"
        });

    } catch (err) {
        console.log("Get Address Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};



const updateAddress = async (req, res) => {
    try {
        const userId = req.userId; 
        const addressId = req.params.id;
        const { phone, addressDetail, isDefault } = req.body;

        const address = await addressModel.findById(addressId);

        if (!address) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ." });
        }

        // check address user
        if (address.user.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền sửa địa chỉ này." });
        }

        address.phone = phone || address.phone;
        address.addressDetail = addressDetail || address.addressDetail;
        
        // Chỉ cập nhật isDefault 
        if (isDefault !== undefined) {
            address.isDefault = isDefault;
        }

        const updatedAddress = await address.save();

        res.status(200).json({
            data : updatedAddress, 
            success : true,
            error : false,
            message : "Update address successfully!"
        });

    } catch (err) {
        console.log("Update Address Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};


const deleteAddress = async (req, res) => {
    try {
        const userId = req.userId; 
        const addressId = req.params.id;

        const deletedAddress = await addressModel.findOneAndDelete({
            _id: addressId,
            user: userId
        });

        if (!deletedAddress) {
            throw new Error("Address not exists");
        }

        res.status(200).json({
            success : true,
            error : false,
            message : "Delete address successfully!"
        });
        
    } catch (err) {
        console.log("Delete Address Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};



module.exports = {
    createAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress
};