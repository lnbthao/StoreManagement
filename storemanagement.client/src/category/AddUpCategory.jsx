import axios from "axios";
import { useEffect, useState } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUpCategory() {
    const navTo = useNavigate();
    const { id } = useParams();
    const isUpdateMode = Boolean(id);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [category, setCategory] = useState({
        categoryId: 0,
        categoryName: "",
        isActive: true, // mặc định true khi thêm mới
    });

    const [errors, setErrors] = useState({ categoryName: "" });

    useEffect(() => {
        document.title = `${isUpdateMode ? "Cập nhật" : "Thêm"} loại sản phẩm | Quản lý kho hàng`;

        const fetchData = async () => {
            if (isUpdateMode) {
                try {
                    const { data } = await axios.get(`/api/category/${id}`);
                    setCategory({
                        categoryId: data.categoryId,
                        categoryName: data.categoryName,
                        isActive: data.isActive,
                    });
                } catch (err) {
                    console.error(err);
                    alert("Không tải được dữ liệu loại sản phẩm.");
                }
            }
            setLoading(false);
        };

        fetchData();
    }, [id, isUpdateMode]);

    const validateField = (val) => {
        let msg = "";
        if (!val.trim()) msg = "Vui lòng nhập tên loại sản phẩm.";
        else if (val.trim().length < 2) msg = "Tên tối thiểu 2 ký tự.";
        setErrors({ categoryName: msg });
        return !msg;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateField(category.categoryName)) return;

        try {
            setSubmitting(true);
            let res;

            if (isUpdateMode) {
                // CẬP NHẬT
                res = await axios.put(
                    `/api/category/${category.categoryId}`,
                    {
                        categoryId: category.categoryId,   // cần gửi ID
                        categoryName: category.categoryName.trim(),
                        isActive: category.isActive         // giữ trạng thái hiện tại
                    },
                    { headers: { "Content-Type": "application/json" } }
                );
            } else {
                // THÊM MỚI
                res = await axios.post(
                    `/api/category`,
                    {
                        categoryName: category.categoryName.trim(),
                        isActive: true,
                    },
                    { headers: { "Content-Type": "application/json" } }
                );
            }

            if (res.status === 200 || res.status === 201) {
                alert(`${isUpdateMode ? "Cập nhật" : "Thêm"} thành công!`);
                navTo("/admin/category", { replace: true });
            } else {
                alert(`${isUpdateMode ? "Cập nhật" : "Thêm"} thất bại!`);
                console.error(res);
            }
        } catch (err) {
            console.error(err);
            alert(`${isUpdateMode ? "Cập nhật" : "Thêm"} thất bại!`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <>
            <h1 className="text-center text-uppercase mb-3 fs-2">
                {isUpdateMode ? "Cập nhật" : "Thêm"} loại sản phẩm
            </h1>

            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="category-name" className="d-block mb-1">
                        Tên loại sản phẩm:
                    </label>
                    <input
                        id="category-name"
                        className={`form-control ${errors.categoryName ? "is-invalid" : ""} mb-1`}
                        placeholder="Nhập tên loại sản phẩm"
                        type="text"
                        value={category.categoryName}
                        onChange={(e) => setCategory({ ...category, categoryName: e.target.value })}
                        onBlur={(e) => validateField(e.target.value)}
                    />
                    {errors.categoryName && <small className="text-danger">{errors.categoryName}</small>}
                </div>

                <div className="d-flex justify-content-center column-gap-2 mt-4">
                    <button type="submit" className="btn btn-success" disabled={submitting}>
                        <FloppyFill size={20} className="me-1" />
                        {submitting ? "Đang lưu..." : isUpdateMode ? "Cập nhật" : "Thêm"}
                    </button>

                    <button type="button" onClick={() => navTo("/admin/category", { replace: true })} className="btn btn-secondary">
                        <XLg size={20} className="me-1" /> Hủy bỏ
                    </button>
                </div>
            </form>
        </>
    );
}
