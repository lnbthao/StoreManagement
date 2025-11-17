import axios from "axios";
import { useState, useEffect } from "react";
import {
    ArrowClockwise,
    DatabaseUp,
    Eye,
    Funnel,
    PencilSquare,
    PlusCircleFill,
    Trash3,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { toVNNumber, toVNPrice } from "../util";
import { MOCK_PRODUCTS } from "../../mockData/Products";
import ProductViewModal from "./ProductViewModal";
import ProductFilterModal from "./ProductFilterModal";
import InventoryModal from "./InventoryModal";

export default function ProductManagement() {
    const navTo = useNavigate();
    const [productList, setProductList] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Thêm trạng thái lỗi
    const [openView, setOpenView] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openFilter, setOpenFilter] = useState(false);
    const [openInventory, setOpenInventory] = useState(false);
    const [inventoryProduct, setInventoryProduct] = useState(null);

    // Hàm tải dữ liệu an toàn
    const loadFromApi = async (query = "") => {
        try {
            const url = query
                ? `/api/product/search?q=${encodeURIComponent(query)}`
                : `/api/product`;
            const res = await axios.get(url);
            return Array.isArray(res.data) ? res.data : [];
        } catch (err) {
            console.warn("API lỗi, dùng MOCK_PRODUCTS", err);
            return Array.isArray(MOCK_PRODUCTS) ? MOCK_PRODUCTS : [];
        }
    };

    // Load lần đầu
    useEffect(() => {
        (async () => {
            document.title = "Sản phẩm | Quản lý kho hàng";
            setLoading(true);
            setError(null);
            try {
                const data = await loadFromApi();
                setProductList(data);
            } catch (err) {
                setError("Không tải được dữ liệu");
                setProductList([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Tìm kiếm (debounce)
    useEffect(() => {
        const timer = setTimeout(async () => {
            setLoading(true);
            const data = await loadFromApi(search.trim());
            setProductList(data);
            setLoading(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // Chỉ thay 2 hàm này thôi – copy đè vào file hiện tại của bạn là xong
    // ======================================================================

    // 1. XÓA / KHÔI PHỤC THẬT QUA API
    const handleActive = async (p) => {
        const action = p.isActive ? "xóa" : "khôi phục";
        if (!confirm(`Bạn có chắc muốn ${action} sản phẩm "${p.productName}" không?`)) return;

        try {
            const endpoint = p.isActive
                ? `/api/product/${p.productId}/delete`
                : `/api/product/${p.productId}/restore`;

            await axios.put(endpoint);

            // Cập nhật UI ngay lập tức
            setProductList(prev =>
                prev.map(item =>
                    item.productId === p.productId
                        ? { ...item, isActive: !item.isActive }
                        : item
                )
            );

            alert(`Đã ${action} thành công!`);
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || "Không thể thực hiện"));
        }
    };

    // 2. NHẬP KHO THẬT QUA API
    const handleOpenInventory = (p) => {
        setInventoryProduct(p);
        setOpenInventory(true);
    };

    const handleInventoryUpdate = async (quantity) => {
        if (!inventoryProduct || !quantity || quantity <= 0) {
            alert("Vui lòng nhập số lượng hợp lệ!");
            return;
        }

        try {
            // GỬI ĐÚNG TÊN TRƯỜNG MÀ BACKEND .NET ĐANG CHỜ
            const res = await axios.post("/api/product/import-inventory", {
                ProductId: inventoryProduct.productId,   // P và Id in hoa
                Quantity: Number(quantity)               // Q in hoa
            });

            // Cập nhật tồn kho realtime trên bảng
            setProductList(prev =>
                prev.map(p =>
                    p.productId === inventoryProduct.productId
                        ? { ...p, quantity: res.data.newStock }
                        : p
                )
            );

            alert(`Nhập kho thành công! Tồn kho mới: ${res.data.newStock}`);

            // Đóng modal
            setOpenInventory(false);
            setInventoryProduct(null);

        } catch (err) {
            console.error("Lỗi nhập kho:", err);
            const msg = err.response?.data?.message
                || err.response?.data
                || err.message
                || "Lỗi không xác định";
            alert("Nhập kho thất bại: " + msg);
        }
    };

    // === RENDER ===
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-3">Đang tải danh sách sản phẩm...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger text-center">
                <strong>Lỗi:</strong> {error}
                <br />
                <small>Đang dùng dữ liệu mẫu (MOCK)</small>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-center text-uppercase mb-3 fs-2">Quản lý sản phẩm</h1>

            <div className="d-flex flex-column flex-md-row gap-3 mb-3">
                <button
                    className="btn btn-success d-flex align-items-center gap-1"
                    onClick={() => navTo("/admin/product/add")}
                >
                    <PlusCircleFill /> Thêm sản phẩm
                </button>

                <input
                    type="search"
                    placeholder="Tìm tên hoặc barcode..."
                    className="form-control flex-grow-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => setOpenFilter(true)}
                >
                    <Funnel size={22} /> Lọc
                </button>
            </div>

            {/* Bảng */}
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-light">
                        <tr className="text-center">
                            <th>Barcode</th>
                            <th>Tên sản phẩm</th>
                            <th>Loại</th>
                            <th>Tồn kho</th>
                            <th>Giá</th>
                            <th>Đơn vị</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productList.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-muted py-4">
                                    Không có sản phẩm nào!
                                </td>
                            </tr>
                        ) : (
                            productList.map((p) => (
                                <tr key={p.productId}>
                                    <td className="text-center">{p.barcode || "—"}</td>
                                    <td>{p.productName || "Không tên"}</td>
                                    <td className="text-center">
                                        {p.category?.categoryName || p.categoryName || "—"}
                                    </td>
                                    <td className="text-center">
                                        {p.isActive &&
                                            (p.inventory?.quantity ?? p.stock ?? p.quantity ?? 0) > 0 ? (
                                            toVNNumber(
                                                p.inventory?.quantity ??
                                                p.stock ??
                                                p.quantity ??
                                                0
                                            )
                                        ) : (
                                            <span className="text-danger">Ngừng bán</span>
                                        )}
                                    </td>

                                    <td className="text-end">{toVNPrice(p.price ?? 0)}</td>
                                    <td className="text-center">{p.unit || "—"}</td>
                                    <td className="text-center">
                                        {p.isActive ? (
                                            <>
                                                <button className="btn p-0 me-2" onClick={() => { setSelectedProduct(p); setOpenView(true); }} title="Xem">
                                                    <Eye size={20} color="teal" />
                                                </button>
                                                <button className="btn p-0 me-2" onClick={() => navTo(`/admin/product/edit/${p.productId}`)} title="Sửa">
                                                    <PencilSquare size={20} color="blue" />
                                                </button>
                                                <button className="btn p-0 me-2" onClick={() => handleOpenInventory(p)} title="Nhập kho">
                                                    <DatabaseUp size={20} color="green" />
                                                </button>
                                                <button className="btn p-0" onClick={() => handleActive(p)} title="Xóa">
                                                    <Trash3 size={20} color="crimson" />
                                                </button>
                                            </>
                                        ) : (
                                            <button className="btn p-0" onClick={() => handleActive(p)} title="Khôi phục">
                                                <ArrowClockwise size={20} color="green" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedProduct && (
                <ProductViewModal
                    open={openView}
                    product={selectedProduct}
                    onClose={() => {
                        setOpenView(false);
                        setSelectedProduct(null);
                    }}
                />
            )}

            <ProductFilterModal
                open={openFilter}
                onClose={() => setOpenFilter(false)}
            />

            <InventoryModal
                open={openInventory}
                product={inventoryProduct}
                onClose={() => {
                    setOpenInventory(false);
                    setInventoryProduct(null);
                }}
                onSubmit={(newStock) => {
                    // Cập nhật tồn kho realtime
                    setProductList(prev =>
                        prev.map(p =>
                            p.productId === inventoryProduct.productId
                                ? { ...p, quantity: newStock }
                                : p
                        )
                    );
                }}
            />
        </>
    );
}