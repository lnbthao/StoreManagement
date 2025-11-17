// src/product/ProductViewModal.jsx
import { Modal, Button } from "react-bootstrap";
import { toVNPrice, toVNNumber } from "../util";

export default function ProductViewModal({ open, product, onClose }) {
    if (!product) return null;
    console.log("Ảnh gốc của sản phẩm:", product.imageUrl);
    return (
        <Modal show={open} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton><Modal.Title>Chi tiết sản phẩm</Modal.Title></Modal.Header>
            <Modal.Body>
                <div className="row g-4 align-items-start">
                    {/* CỘT ẢNH – KHÔNG CÓ ẢNH THÌ VẪN ĐẸP */}
                    <div className="col-md-4">
                        <div className="text-center mt-4">
                            {product.imageUrl ? (
                                <img
                                    src={`http://localhost:5069${product.imageUrl}`}
                                    alt={product.productName}
                                    className="img-fluid rounded shadow-sm border"
                                    style={{ maxHeight: "380px", maxWidth: "100%", objectFit: "contain" }}
                                />
                            ) : (
                                <div className="bg-light border rounded d-flex align-items-center justify-content-center flex-column" style={{ height: "380px" }}>
                                    <i className="bi bi-image fs-1 text-muted"></i>
                                    <p className="text-muted mt-2">Chưa có hình ảnh</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CỘT THÔNG TIN */}
                    <div className="col-md-8">
                        <table className="table table-borderless">
                            <tbody>
                                <tr><th width="35%">Mã SP</th><td>#{product.productId}</td></tr>
                                <tr><th>Tên sản phẩm</th><td className="fw-bold fs-5">{product.productName}</td></tr>
                                <tr><th>Barcode</th><td>{product.barcode || "—"}</td></tr>
                                <tr><th>Loại</th><td>{product.categoryName || "—"}</td></tr>
                                <tr><th>Đơn vị</th><td>{product.unit || "—"}</td></tr>
                                <tr><th>Giá bán</th><td className="text-danger fw-bold fs-4">{toVNPrice(product.price ?? 0)}</td></tr>
                                <tr>
                                    <th>Tồn kho</th>
                                    <td>
                                        {product.isActive ? (
                                            <span className="text-success fw-bold fs-4">
                                                {toVNNumber(product.quantity ?? 0)}
                                            </span>
                                        ) : (
                                            <span className="text-danger fw-bold">Ngừng bán</span>
                                        )}
                                    </td>
                                </tr>
                                <tr><th>Nhà cung cấp</th><td>{product.supplierName || "—"}</td></tr>
                                <tr>
                                    <th>Trạng thái</th>
                                    <td>
                                        <span className={`badge text-bg-${product.isActive ? "success" : "danger"} fs-6`}>
                                            {product.isActive ? "Đang bán" : "Ngừng bán"}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Đóng</Button>
            </Modal.Footer>
        </Modal>
    );
}