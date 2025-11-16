import axios from "axios";
import { useEffect, useState } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUpProduct({ status = false }) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> parent of 903e92c (Revert "update loi dropdown")
    const navTo = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
<<<<<<< HEAD
    const [product, setProduct] = useState({
        productId: 0,
        productName: "",
        categoryId: -1,
        supplierId: -1,
        barcode: "",
        price: "",
        unit: "",
        imageUrl: "" // Thêm để lưu ảnh cũ
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

    // === THÊM CHO ẢNH ===
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [imageUrl, setImageUrl] = useState(""); // Ảnh hiện tại (khi sửa)

    // Fetch categories & suppliers
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const catRes = await axios.get("/api/category");
                setCategoryList(catRes.data);
            } catch (err) {
                console.error("Lỗi tải category:", err);
            }
            try {
                const supRes = await axios.get("/api/supplier");
                setSupplierList(supRes.data);
            } catch (err) {
                console.error("Lỗi tải supplier:", err);
            }
        };
        fetchDropdowns();
        if (status && id) {
            fetchProduct(id);
        } else {
            setLoading(false);
        }
    }, [status, id]);

    // Fetch product khi sửa
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
                imageUrl: data.imageUrl ?? ""
            });
            setImageUrl(data.imageUrl ?? ""); // Hiển thị ảnh cũ
        } catch (e) {
            console.error(e);
            alert("Không tải được dữ liệu sản phẩm.");
            navTo("/admin/product");
        } finally {
            setLoading(false);
        }
    };

    const setField = (key) => (e) => {
        let val = e.target.value;
        if (key === "categoryId" || key === "supplierId") {
            val = Number(val);
        } else if (key === "price") {
            val = val.replace(/\D/g, "");
        }
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
                const priceNum = Number(val);
                if (!val) msg = "Vui lòng nhập giá.";
                else if (priceNum <= 0) msg = "Giá phải lớn hơn 0.";
                break;
            case "unit":
                if (!val.trim()) msg = "Vui lòng nhập đơn vị tính.";
                break;
            default:
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
        let isValid = true;
        fields.forEach(([key, val]) => {
            const error = validateField(key, val);
            if (error) isValid = false;
        });
        return isValid;
    };

    // === XỬ LÝ SUBMIT + UPLOAD ẢNH ===
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setSubmitting(true);
        try {
            let finalImageUrl = imageUrl || product.imageUrl || "";

            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                const uploadRes = await axios.post("/api/product/upload-image", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                finalImageUrl = uploadRes.data.url;
            }

            const payload = {
                productName: product.productName.trim(),
                categoryId: product.categoryId > 0 ? product.categoryId : null,
                supplierId: product.supplierId > 0 ? product.supplierId : null,
                barcode: product.barcode.trim(),
                price: Number(product.price),
                unit: product.unit.trim() || "pcs",
                ...(finalImageUrl && { imageUrl: finalImageUrl }) // ← CHỈ GỬI KHI CÓ ẢNH
            };

            let res;
            if (status) {
                res = await axios.put(`/api/product/${id}`, payload);
            } else {
                res = await axios.post(`/api/product`, payload);
            }

            if (res.status === 200 || res.status === 201) {
                alert(`${status ? "Cập nhật" : "Thêm"} sản phẩm thành công!`);
                navTo("/admin/product", { replace: true });
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || `${status ? "Cập nhật" : "Thêm"} thất bại!`;
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-center text-uppercase mb-4 fs-2">
                {status ? "Cập nhật" : "Thêm"} sản phẩm
            </h1>
            <form onSubmit={handleSubmit} noValidate className="mx-auto" style={{ maxWidth: "600px" }}>
                {/* Product Name */}
                <div className="mb-3">
                    <label htmlFor="product-name" className="form-label">
                        Tên sản phẩm <span className="text-danger">*</span>
                    </label>
                    <input
                        id="product-name"
                        className={`form-control ${errors.productName ? "is-invalid" : ""}`}
                        placeholder="Nhập tên sản phẩm"
                        type="text"
                        value={product.productName}
                        onChange={setField("productName")}
                        onBlur={handleBlur("productName")}
                    />
                    {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                </div>

                {/* Category */}
                <div className="mb-3">
                    <label htmlFor="product-category" className="form-label">
                        Loại sản phẩm <span className="text-danger">*</span>
                    </label>
                    <select
                        id="product-category"
                        className={`form-select ${errors.categoryId ? "is-invalid" : ""}`}
                        value={product.categoryId}
                        onChange={setField("categoryId")}
                        onBlur={handleBlur("categoryId")}
                        disabled={categoryList.length === 0}
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
=======
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

  useEffect(() => {
    document.title = `${
      status ? "Cập nhật" : "Thêm"
    } sản phẩm | Quản lý kho hàng`;
    if (status && id) {
      fetchData(id);
    } else {
      setLoading(false);
    }
  }, [status, id]);

  async function fetchData(id) {
    try {
      //   const { data } = await axios.get(`/api/product/${id}`);
      //   setProduct({
      //     productId: data.productId ?? Number(id),
      //     productName: data.productName ?? "",
      //     categoryId: data.categoryId ?? -1,
      //     supplierId: data.supplierId ?? -1,
      //     barcode: data.barcode ?? "",
      //     price: data.price ?? "",
      //     unit: data.unit ?? "",
      //   });
      const data = {
        productId: Number(id),
        productName: "Coca Cola lon 330ml",
        categoryId: 1,
        supplierId: 2,
        barcode: "8931234567890",
        price: 12000,
        unit: "lon",
      };
      setProduct({
        productId: data.productId ?? Number(id),
        productName: data.productName ?? "",
        categoryId: data.categoryId ?? -1,
        supplierId: data.supplierId ?? -1,
        barcode: data.barcode ?? "",
        price: data.price ?? "",
        unit: data.unit ?? "",
      });
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu khách hàng.");
    } finally {
      setLoading(false);
    }
  }

  const setField = (key) => (e) => {
    let val = e.target.value;
    if (key === "categoryId" || key === "supplierId") val = Number(val);
    setProduct((p) => ({ ...p, [key]: val }));
  };

  const validateField = (key, val) => {
    let msg = "";

    if (key === "productName") {
      if (!val.trim()) msg = "Vui lòng nhập tên sản phẩm.";
      else if (val.trim().length < 2) msg = "Tên tối thiểu 2 ký tự.";
    }

    if (key === "categoryId") {
      if (Number(val) < 0) msg = "Vui lòng chọn loại sản phẩm.";
    }

    if (key === "supplierId") {
      if (Number(val) < 0) msg = "Vui lòng chọn nhà cung cấp.";
    }

    if (key === "barcode") {
      if (!val.trim()) msg = "Vui lòng nhập barcode.";
      else if (!/^[0-9]{6,20}$/.test(val.trim()))
        msg = "Barcode chỉ chứa số (6–20 ký tự).";
    }
>>>>>>> parent of adb0137 (Merge branch 'main' into hoang-dev)

    if (key === "price") {
      const n = Number(String(val).replaceAll(",", ""));
      if (!Number.isFinite(n) || n <= 0) msg = "Giá phải là số > 0.";
    }

    if (key === "unit") {
      if (!val.trim()) msg = "Vui lòng nhập đơn vị tính.";
    }

    setErrors((e) => ({ ...e, [key]: msg }));
    return msg;
  };

<<<<<<< HEAD
                {/* Unit */}
                <div className="mb-3">
                    <label htmlFor="product-unit" className="form-label">
                        Đơn vị tính <span className="text-danger">*</span>
                    </label>
                    <input
                        id="product-unit"
                        className={`form-control ${errors.unit ? "is-invalid" : ""}`}
                        placeholder='VD: "lon", "hộp", "chai", "pcs"'
                        type="text"
                        value={product.unit}
                        onChange={setField("unit")}
                        onBlur={handleBlur("unit")}
                    />
                    {errors.unit && <div className="invalid-feedback">{errors.unit}</div>}
                </div>

                {/* === ẢNH SẢN PHẨM === */}
                <div className="mb-3">
                    <label className="form-label">Ảnh sản phẩm</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }}
                    />
                    {(imagePreview || imageUrl) && (
                        <div className="mt-2">
                            <img
                                src={imagePreview || imageUrl}
                                alt="Preview"
                                style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover", border: "1px solid #ddd", borderRadius: "8px" }}
                            />
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-center gap-3">
                    <button type="submit" className="btn btn-success" disabled={submitting}>
                        <FloppyFill size={20} className="me-1" />
                        {submitting ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navTo("/admin/product", { replace: true })}
                        className="btn btn-secondary"
                    >
                        <XLg size={20} className="me-1" /> Hủy
                    </button>
                </div>
            </form>
        </>
=======
  const handleBlur = (key) => (e) => {
    validateField(key, e.target.value);
  };

=======
  const navTo = useNavigate();
  const { id } = useParams();
=======
>>>>>>> parent of 903e92c (Revert "update loi dropdown")

    const [product, setProduct] = useState({
        productId: 0,
        productName: "",
        categoryId: -1,
        supplierId: -1,
        barcode: "",
        price: "", // Keep as string for controlled input + formatting
        unit: "",
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

    // Fetch categories & suppliers on mount
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const catRes = await axios.get("/api/category");
                setCategoryList(catRes.data);
            } catch (err) {
                console.error("Lỗi tải category:", err);
                // vẫn để categoryList = [] → không làm hỏng supplier
            }

            try {
                const supRes = await axios.get("/api/supplier");
                setSupplierList(supRes.data);
            } catch (err) {
                console.error("Lỗi tải supplier:", err);
                // vẫn để supplierList = [] → không làm hỏng category
            }
        };

        fetchDropdowns();

        if (status && id) {
            fetchProduct(id);
        } else {
            setLoading(false);
        }
    }, [status, id]);

<<<<<<< HEAD
  const setField = (key) => (e) => {
    let val = e.target.value;
    if (key === "categoryId" || key === "supplierId") val = Number(val);
    setProduct((p) => ({ ...p, [key]: val }));
  };

  const validateField = (key, val) => {
    let msg = "";

    if (key === "productName") {
      if (!val.trim()) msg = "Vui lòng nhập tên sản phẩm.";
      else if (val.trim().length < 2) msg = "Tên tối thiểu 2 ký tự.";
    }

    if (key === "categoryId") {
      if (Number(val) < 0) msg = "Vui lòng chọn loại sản phẩm.";
    }

    if (key === "supplierId") {
      if (Number(val) < 0) msg = "Vui lòng chọn nhà cung cấp.";
    }

    if (key === "barcode") {
      if (!val.trim()) msg = "Vui lòng nhập barcode.";
      else if (!/^[0-9]{6,20}$/.test(val.trim()))
        msg = "Barcode chỉ chứa số (6–20 ký tự).";
    }

    if (key === "price") {
      const n = Number(String(val).replaceAll(",", ""));
      if (!Number.isFinite(n) || n <= 0) msg = "Giá phải là số > 0.";
    }

    if (key === "unit") {
      if (!val.trim()) msg = "Vui lòng nhập đơn vị tính.";
    }

    setErrors((e) => ({ ...e, [key]: msg }));
    return msg;
  };

  const handleBlur = (key) => (e) => {
    validateField(key, e.target.value);
  };

>>>>>>> parent of adb0137 (Merge branch 'main' into hoang-dev)
  const validateAll = () => {
    const m = {
      productName: validateField("productName", product.productName),
      categoryId: validateField("categoryId", product.categoryId),
      supplierId: validateField("supplierId", product.supplierId),
      barcode: validateField("barcode", product.barcode),
      price: validateField("price", product.price),
      unit: validateField("unit", product.unit),
=======
    // Fetch single product when updating
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
                price: data.price?.toString() ?? "", // Ensure string
                unit: data.unit ?? "",
            });
        } catch (e) {
            console.error(e);
            alert("Không tải được dữ liệu sản phẩm.");
            navTo("/admin/product");
        } finally {
            setLoading(false);
        }
>>>>>>> parent of 903e92c (Revert "update loi dropdown")
    };

    const setField = (key) => (e) => {
        let val = e.target.value;
        if (key === "categoryId" || key === "supplierId") {
            val = Number(val);
        } else if (key === "price") {
            // Allow only numbers, remove non-digits
            val = val.replace(/\D/g, "");
        }
        setProduct((p) => ({ ...p, [key]: val }));
        // Clear error on change
        if (errors[key]) {
            setErrors((err) => ({ ...err, [key]: "" }));
        }
    };

<<<<<<< HEAD
    alert(
      (status ? "Cập nhật -----" + id : "Thêm -----") +
        JSON.stringify(product, null, 2)
<<<<<<< HEAD
>>>>>>> parent of adb0137 (Merge branch 'main' into hoang-dev)
=======
>>>>>>> parent of adb0137 (Merge branch 'main' into hoang-dev)
=======
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
                const priceNum = Number(val);
                if (!val) msg = "Vui lòng nhập giá.";
                else if (priceNum <= 0) msg = "Giá phải lớn hơn 0.";
                break;

            case "unit":
                if (!val.trim()) msg = "Vui lòng nhập đơn vị tính.";
                break;

            default:
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

        let isValid = true;
        fields.forEach(([key, val]) => {
            const error = validateField(key, val);
            if (error) isValid = false;
        });
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setSubmitting(true);
        try {
            const payload = {
                productName: product.productName.trim(),
                categoryId: Number(product.categoryId),
                supplierId: Number(product.supplierId),
                barcode: product.barcode.trim(),
                price: Number(product.price),
                unit: product.unit.trim() || "pcs",
            };

            let res;
            if (status) {
                res = await axios.put(`/api/product/${id}`, payload);
            } else {
                res = await axios.post(`/api/product`, payload);
            }

            if (res.status === 200 || res.status === 201) {
                alert(`${status ? "Cập nhật" : "Thêm"} sản phẩm thành công!`);
                navTo("/admin/product", { replace: true });
            } else {
                throw new Error("Server error");
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || `${status ? "Cập nhật" : "Thêm"} thất bại!`;
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Format price with thousand separators
    const formatPrice = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-center text-uppercase mb-4 fs-2">
                {status ? "Cập nhật" : "Thêm"} sản phẩm
            </h1>

            <form onSubmit={handleSubmit} noValidate className="mx-auto" style={{ maxWidth: "600px" }}>
                {/* Product Name */}
                <div className="mb-3">
                    <label htmlFor="product-name" className="form-label">
                        Tên sản phẩm <span className="text-danger">*</span>
                    </label>
                    <input
                        id="product-name"
                        className={`form-control ${errors.productName ? "is-invalid" : ""}`}
                        placeholder="Nhập tên sản phẩm"
                        type="text"
                        value={product.productName}
                        onChange={setField("productName")}
                        onBlur={handleBlur("productName")}
                    />
                    {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                </div>

                {/* Category */}
                <div className="mb-3">
                    <label htmlFor="product-category" className="form-label">
                        Loại sản phẩm <span className="text-danger">*</span>
                    </label>
                    <select
                        id="product-category"
                        className={`form-select ${errors.categoryId ? "is-invalid" : ""}`}
                        value={product.categoryId}
                        onChange={setField("categoryId")}
                        onBlur={handleBlur("categoryId")}
                        disabled={categoryList.length === 0}
                    >
                        <option value={-1}>Chọn loại sản phẩm</option>
                        {categoryList.map((c) => (
                            <option key={c.categoryId} value={c.categoryId}>
                                {c.categoryName}
                            </option>
                        ))}
                    </select>
                    {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                    {categoryList.length === 0 && !loading && (
                        <small className="text-muted">Không có loại sản phẩm nào.</small>
                    )}
                </div>

                {/* Supplier */}
                <div className="mb-3">
                    <label htmlFor="product-supplier" className="form-label">
                        Nhà cung cấp <span className="text-danger">*</span>
                    </label>
                    <select
                        id="product-supplier"
                        className={`form-select ${errors.supplierId ? "is-invalid" : ""}`}
                        value={product.supplierId}
                        onChange={setField("supplierId")}
                        onBlur={handleBlur("supplierId")}
                        disabled={supplierList.length === 0}
                    >
                        <option value={-1}>Chọn nhà cung cấp</option>
                        {supplierList.map((s) => (
                            <option key={s.supplierId} value={s.supplierId}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    {errors.supplierId && <div className="invalid-feedback">{errors.supplierId}</div>}
                </div>

                {/* Barcode */}
                <div className="mb-3">
                    <label htmlFor="product-barcode" className="form-label">
                        Barcode <span className="text-danger">*</span>
                    </label>
                    <input
                        id="product-barcode"
                        className={`form-control ${errors.barcode ? "is-invalid" : ""}`}
                        placeholder="Chỉ nhập số, 6–20 ký tự"
                        type="text"
                        inputMode="numeric"
                        value={product.barcode}
                        onChange={setField("barcode")}
                        onBlur={handleBlur("barcode")}
                    />
                    {errors.barcode && <div className="invalid-feedback">{errors.barcode}</div>}
                </div>

                {/* Price */}
                <div className="mb-3">
                    <label htmlFor="product-price" className="form-label">
                        Giá sản phẩm (VND) <span className="text-danger">*</span>
                    </label>
                    <input
                        id="product-price"
                        className={`form-control ${errors.price ? "is-invalid" : ""}`}
                        placeholder="0"
                        type="text"
                        inputMode="numeric"
                        value={formatPrice(product.price)}
                        onChange={setField("price")}
                        onBlur={handleBlur("price")}
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                    {product.price && !errors.price && (
                        <small className="text-muted">{Number(product.price).toLocaleString("vi-VN")} ₫</small>
                    )}
                </div>

                {/* Unit */}
                <div className="mb-4">
                    <label htmlFor="product-unit" className="form-label">
                        Đơn vị tính <span className="text-danger">*</span>
                    </label>
                    <input
                        id="product-unit"
                        className={`form-control ${errors.unit ? "is-invalid" : ""}`}
                        placeholder='VD: "lon", "hộp", "chai", "pcs"'
                        type="text"
                        value={product.unit}
                        onChange={setField("unit")}
                        onBlur={handleBlur("unit")}
                    />
                    {errors.unit && <div className="invalid-feedback">{errors.unit}</div>}
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-center gap-3">
                    <button type="submit" className="btn btn-success" disabled={submitting}>
                        <FloppyFill size={20} className="me-1" />
                        {submitting ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navTo("/admin/product", { replace: true })}
                        className="btn btn-secondary"
                    >
                        <XLg size={20} className="me-1" /> Hủy
                    </button>
                </div>
            </form>
        </>
>>>>>>> parent of 903e92c (Revert "update loi dropdown")
    );
}