// src/product/InventoryModal.jsx
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function InventoryModal({ open, product, onClose, onSubmit }) {
    const [quantity, setQuantity] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const qty = Number(quantity);
        if (!qty || qty <= 0) {
            alert("Vui lòng nhập số lượng lớn hơn 0!");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/product/import-inventory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ProductId: product.productId,   // ĐÚNG CHÍNH XÁC tên backend cần
                    Quantity: qty
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Lỗi server");
            }

            // Gọi onSubmit để cập nhật tồn kho realtime
            onSubmit(data.newStock);

            alert(`Nhập kho thành công! Tồn kho mới: ${data.newStock}`);
            setQuantity("");
            onClose();
        } catch (err) {
            console.error("Lỗi nhập kho:", err);
            alert("Nhập kho thất bại: " + (err.message || "Vui lòng thử lại"));
        } finally {
            setSaving(false);
        }
    };

    if (!product) return null;

    return (
        <Modal show={open} onHide={onClose} centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={!saving}>
                    <Modal.Title>Nhập kho - {product.productName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Số lượng nhập kho *</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            disabled={saving}
                            autoFocus
                        />
                    </Form.Group>
                    <div className="text-muted">
                        Tồn kho hiện tại: <strong className="text-success">{product.quantity ?? 0}</strong>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={saving}>
                        Hủy
                    </Button>
                    <Button variant="success" type="submit" disabled={saving}>
                        {saving ? "Đang nhập..." : "Nhập kho"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}