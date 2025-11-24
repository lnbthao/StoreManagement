import axios from "axios";
import { useEffect, useState } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";
import { backendUrl } from "../util";

export default function AddUpProduct({ status = false }) {
    const navTo = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [product, setProduct] = useState({
        productId: 0,
        productName: "",
        categoryId: -1,
        supplierId: -1,
        barcode: "",
        price: "",
        unit: "",
        imageUrl: ""
    });

    const [categoryList, setCategoryList] = useState([]);
    const [supplierList, setSupplierList] = useState([]);

    const [errors, setErrors] = useState({
        productName: "",
        categoryId: "",
        supplierId: "",
        barcode: "",
        price: "",
        unit: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // Load dropdown + product
    useEffect(() => {
        const loadAll = async () => {
            try {
                const cat = await axios.get("/api/category");
                setCategoryList(cat.data);
            } catch { }

            try {
                const sup = await axios.get("/api/supplier");
                setSupplierList(sup.data);
            } catch { }

            if (status && id) {
                await fetchProduct(id);
            } else {
                setLoading(false);
            }
        };

        loadAll();
    }, [status, id]);

    const fetchProduct = async (productId) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/product/${productId}`);

            setProduct({
                productId: data.productId ?? Number(productId),
                productName: data.productName ?? "",
                categoryId: data.categoryId ?? -1,
                supplierId: data.supplierId ?? -1,
                barcode: data.barcode ?? "",
                price: data.price?.toString() ?? "",
                unit: data.unit ?? "",
                imageUrl: `${backendUrl}${data.imageUrl}` ?? ""
            });

            setImageUrl(`${backendUrl}${data.imageUrl}` ?? "");
        } catch (err) {
            alert("Không tải được dữ liệu sản phẩm.");
            navTo("/admin/product");
        } finally {
            setLoading(false);
        }
    };

    const setField = (key) => (e) => {
        let val = e.target.value;

        if (key === "categoryId" || key === "supplierId") val = Number(val);
        if (key === "price") val = val.replace(/\D/g, "");

        setProduct((p) => ({ ...p, [key]: val }));

        if (errors[key]) {
            setErrors((err) => ({ ...err, [key]: "" }));
        }
    };

    const validateField = (key, val) => {
        let msg = "";

        switch (key) {
            case "productName":
                if (!val.trim()) msg = "Vui lòng nhập tên sản phẩm.";
                else if (val.trim().length < 2) msg = "Tên tối thiểu 2 ký tự.";
                break;

            case "categoryId":
                if (Number(val) < 0) msg = "Vui lòng chọn loại sản phẩm.";
                break;

            case "supplierId":
                if (Number(val) < 0) msg = "Vui lòng chọn nhà cung cấp.";
                break;

            case "barcode":
                if (!val.trim()) msg = "Vui lòng nhập barcode.";
                else if (!/^[0-9]{6,20}$/.test(val.trim()))
                    msg = "Barcode chỉ chứa số (6–20 ký tự).";
                break;

            case "price":
                if (!val) msg = "Vui lòng nhập giá.";
                else if (Number(val) <= 0) msg = "Giá phải lớn hơn 0.";
                break;

            case "unit":
                if (!val.trim()) msg = "Vui lòng nhập đơn vị tính.";
                break;
        }

        setErrors((e) => ({ ...e, [key]: msg }));
        return msg;
    };

    const handleBlur = (key) => (e) => {
        validateField(key, e.target.value);
    };

    const validateAll = () => {
        const fields = [
            ["productName", product.productName],
            ["categoryId", product.categoryId],
            ["supplierId", product.supplierId],
            ["barcode", product.barcode],
            ["price", product.price],
            ["unit", product.unit],
        ];

        let ok = true;
        fields.forEach(([key, val]) => {
            if (validateField(key, val)) ok = false;
        });
        return ok;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setSubmitting(true);

        try {
            let finalImage = imageUrl;

            if (imageFile) {
                const fd = new FormData();
                fd.append("file", imageFile);
                const up = await axios.post("/api/product/upload-image", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                finalImage = up.data.url;
            }

            const payload = {
                productName: product.productName.trim(),
                categoryId: product.categoryId,
                supplierId: product.supplierId,
                barcode: product.barcode.trim(),
                price: Number(product.price),
                unit: product.unit.trim(),
                ...(finalImage && { imageUrl: finalImage })
            };

            let res;
            if (status) res = await axios.put(`/api/product/${id}`, payload);
            else res = await axios.post("/api/product", payload);

            alert(`${status ? "Cập nhật" : "Thêm"} sản phẩm thành công!`);
            navTo("/admin/product", { replace: true });
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi lưu sản phẩm.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-center text-uppercase mb-4 fs-2">
                {status ? "Cập nhật" : "Thêm"} sản phẩm
            </h1>

            <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: "600px" }}>
                {/* NAME */}
                <div className="mb-3">
                    <label className="form-label">Tên sản phẩm *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.productName ? "is-invalid" : ""}`}
                        value={product.productName}
                        onChange={setField("productName")}
                        onBlur={handleBlur("productName")}
                    />
                    {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                </div>

                {/* CATEGORY */}
                <div className="mb-3">
                    <label className="form-label">Loại sản phẩm *</label>
                    <select
                        className={`form-select ${errors.categoryId ? "is-invalid" : ""}`}
                        value={product.categoryId}
                        onChange={setField("categoryId")}
                        onBlur={handleBlur("categoryId")}
                    >
                        <option value={-1}>Chọn loại sản phẩm</option>
                        {categoryList.map((c) => (
                            <option key={c.categoryId} value={c.categoryId}>
                                {c.categoryName}
                            </option>
                        ))}
                    </select>
                    {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                </div>

                {/* SUPPLIER */}
                <div className="mb-3">
                    <label className="form-label">Nhà cung cấp *</label>
                    <select
                        className={`form-select ${errors.supplierId ? "is-invalid" : ""}`}
                        value={product.supplierId}
                        onChange={setField("supplierId")}
                        onBlur={handleBlur("supplierId")}
                    >
                        <option value={-1}>Chọn nhà cung cấp</option>
                        {supplierList.map((s) => (
                            <option key={s.supplierId} value={s.supplierId}>
                                {s.supplierName}
                            </option>
                        ))}
                    </select>
                    {errors.supplierId && <div className="invalid-feedback">{errors.supplierId}</div>}
                </div>

                {/* BARCODE */}
                <div className="mb-3">
                    <label className="form-label">Barcode *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.barcode ? "is-invalid" : ""}`}
                        value={product.barcode}
                        onChange={setField("barcode")}
                        onBlur={handleBlur("barcode")}
                    />
                    {errors.barcode && <div className="invalid-feedback">{errors.barcode}</div>}
                </div>

                {/* PRICE */}
                <div className="mb-3">
                    <label className="form-label">Giá bán *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.price ? "is-invalid" : ""}`}
                        value={product.price}
                        onChange={setField("price")}
                        onBlur={handleBlur("price")}
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>

                {/* UNIT */}
                <div className="mb-3">
                    <label className="form-label">Đơn vị tính *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.unit ? "is-invalid" : ""}`}
                        value={product.unit}
                        onChange={setField("unit")}
                        onBlur={handleBlur("unit")}
                        placeholder='VD: "chai", "lon", "hộp", "pcs"'
                    />
                    {errors.unit && <div className="invalid-feedback">{errors.unit}</div>}
                </div>

                {/* IMAGE */}
                <div className="mb-3">
                    <label className="form-label">Ảnh sản phẩm</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => {
                            const f = e.target.files[0];
                            if (f) {
                                setImageFile(f);
                                setImagePreview(URL.createObjectURL(f));
                            }
                        }}
                    />

                    {(imagePreview || imageUrl) && (
                        <img
                            src={imagePreview || imageUrl}
                            alt="preview"
                            style={{
                                maxWidth: 200,
                                marginTop: 10,
                                borderRadius: 8,
                                border: "1px solid #ddd",
                            }}
                        />
                    )}
                </div>

                {/* BUTTONS */}
                <div className="d-flex justify-content-center gap-3">
                    <button type="submit" className="btn btn-success" disabled={submitting}>
                        <FloppyFill className="me-1" />
                        {submitting ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navTo("/admin/product", { replace: true })}
                    >
                        <XLg className="me-1" /> Hủy
                    </button>
                </div>
            </form>
        </>
    );
}
