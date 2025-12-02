// src/product/ProductFilterModal.jsx
import { Modal, Button, Form } from "react-bootstrap";

export default function ProductFilterModal({
    open,
    onClose,
    onApply,
    currentFilters = { category: "", status: "all" },
    categories = [],           
    hasInactive = false        
}) {
    const handleApply = () => {
        const category = document.getElementById("filterCategory").value || "";
        const status = document.getElementById("filterStatus").value;
        onApply({ category, status });
    };

    const handleReset = () => {
        onApply({ category: "", status: "all" });
    };

    return (
        <Modal show={open} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Lọc sản phẩm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Loại sản phẩm</Form.Label>
                    <Form.Select id="filterCategory" defaultValue={currentFilters.category || ""}>
                        <option value="">Tất cả loại</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select id="filterStatus" defaultValue={currentFilters.status || "all"}>
                        <option value="all">Tất cả</option>
                        <option value="active">Đang bán</option>
                        {hasInactive && <option value="inactive">Ngừng bán</option>}
                    </Form.Select>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleReset}>Reset</Button>
                <Button variant="primary" onClick={handleApply}>Áp dụng</Button>
            </Modal.Footer>
        </Modal>
    );
}