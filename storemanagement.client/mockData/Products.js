
// === MOCK_PRODUCTS: Chỉ thông tin sản phẩm ===
export const MOCK_PRODUCTS = [
    {
        productId: 1,
        productName: "Coca Cola lon",
        category: { categoryId: 2, categoryName: "Bánh kẹo" },
        supplier: {
            supplierId: 1,
            supplierName: "Công ty ABC",
            phone: "0909123456",
            email: "abc@gmail.com",
            address: "Hà Nội",
        },
        barcode: "890000000001",
        price: 314838,
        unit: "hộp",
        createdAt: "2025-10-13T13:18:27",
        isActive: false,
    },
    {
        productId: 2,
        productName: "Pepsi lon",
        category: { categoryId: 1, categoryName: "Đồ uống" },
        supplier: {
            supplierId: 2,
            supplierName: "Công ty XYZ",
            phone: "0912123456",
            email: "xyz@gmail.com",
            address: "TP HCM",
        },
        barcode: "890000000002",
        price: 114807,
        unit: "cái",
        createdAt: "2025-10-13T13:18:27",
        isActive: true,
    },
    {
        productId: 3,
        productName: "Trà Xanh 0 độ",
        category: { categoryId: 3, categoryName: "Gia vị" },
        barcode: "890000000003",
        price: 415725,
        unit: "tuýp",
        createdAt: "2025-10-13T13:18:27",
        isActive: true,
    },
];

// === MOCK_INVENTORY: Bảng tồn kho riêng ===
export const MOCK_INVENTORY = [
    { inventory_id: 1, product_id: 1, quantity: 25, updated_at: "2025-11-17T10:00:00" },
    { inventory_id: 2, product_id: 2, quantity: 32, updated_at: "2025-11-17T11:00:00" },
    { inventory_id: 3, product_id: 3, quantity: 50, updated_at: "2025-11-17T12:00:00" },
];