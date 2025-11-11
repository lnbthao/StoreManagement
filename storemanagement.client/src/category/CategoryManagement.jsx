import axios from "axios";
import { useState, useEffect } from "react";
import { PencilSquare, PlusCircleFill, Trash3, ArrowClockwise } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { MOCK_CATEGORIES } from "../../mockData/Categories";

export default function CategoryManagement() {
  const navTo = useNavigate();
  const [categoryList, setCategoryList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");

 const loadFromApi = async (q = "") => {
  const url = q ? `/api/category?name=${encodeURIComponent(q)}` : `/api/category`;
  const res = await axios.get(url);
  return res.data; 
};

  useEffect(() => {
    (async () => {
      document.title = "Loại sản phẩm | Quản lý kho hàng";
      try {
        const data = await loadFromApi();
        setCategoryList(data);
      } catch {
        setCategoryList(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusBadge = (active) => {
    const s = active ? "active" : "inactive";
    const map = { active: "success", inactive: "danger" };
    const color = map[s] || "danger";
    return <span className={`badge text-bg-${color}`}>{s}</span>;
    };

  

    //Lọc
    const filteredList = categoryList.filter((c) => {
        // Search
        const matchSearch = c.categoryName.toLowerCase().includes(search.toLowerCase());
        // Status filter
        const matchStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && c.isActive) ||
            (statusFilter === "inactive" && !c.isActive);

        return matchSearch && matchStatus;
    });

    //TÌm kiếm
   const handleSearch = async (value) => {
        setSearch(value);
        const data = await loadFromApi(value);
        setCategoryList(data);
    };

    const handleActive = async (c) => {
        if (confirm(`Bạn có muốn ${c.isActive ? "xóa" : "khôi phục"} loại sản phẩm #${c.categoryId}: ${c.categoryName}?`)) {
            try {
                if (c.isActive) {
                    // xóa mềm → vẫn hiện trên UI
                    c.isActive = false;
                    await axios.delete(`/api/category/${c.categoryId}`);
                    // Không remove khỏi state ngay, để hiển thị nút khôi phục
                    setCategoryList([...categoryList]);
                } else {
                    // khôi phục
                    await axios.put(`/api/category/restore/${c.categoryId}`);
                    c.isActive = true;
                    setCategoryList([...categoryList]);
                }

                alert(`Đã ${c.isActive ? "khôi phục" : "xóa"} loại sản phẩm thành công!`);
            } catch (err) {
                console.error(err);
                alert("Có lỗi xảy ra!");
            }
        }
    };
  return loading ? (
    <></>
  ) : (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        Quản lý loại sản phẩm
      </h1>

      <div className="d-flex column-gap-3 mb-3">
        <button
          className="btn btn-success d-flex align-items-center column-gap-1"
          onClick={() => navTo("/admin/category/add")}
        >
          <PlusCircleFill className="me-1" /> Thêm loại sản phẩm
        </button>

        <select
        className="form-select w-auto ms-2"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
            >   
        <option value="all">Tất cả</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        </select>

        <form className="col">
          <input
            type="search"
            placeholder="Nhập tên loại cần tìm"
            className="form-control"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </form>
      </div>

      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr className="text-center">
            <th>ID</th>
            <th>Tên loại sản phẩm</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
            {filteredList.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center fst-italic">
                Không có sản phẩm!
              </td>
            </tr>
          ) : (
            filteredList.map((c,index) => (
              <tr key={`category-${c.categoryId}`}>
                {/*<td>{c.categoryId}</td>*/}
                <td>{index + 1}</td> {/* STT thứ tự trong danh sách */}
                <td className="text-center">{c.categoryName}</td>
                <td className="text-center">{statusBadge(c.isActive)}</td>
                <td className="text-center">
                {
                  c.isActive ? (
                    <>
                      <button
                        className="btn p-0 me-2 border border-0"
                        onClick={() => navTo(`/admin/category/edit/${c.categoryId}`)}
                        title="Sửa"
                      >
                        <PencilSquare size={22} color="darkblue" />
                      </button>
                      <button
                        className="btn p-0 border border-0"
                        title="Xóa"
                        onClick={() => handleActive(c)}
                      >
                        <Trash3 size={22} color="crimson" />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn p-0 border border-0"
                      title="Khôi phục"
                      onClick={() => handleActive(c)}
                    >
                      <ArrowClockwise size={22} color="darkcyan" />
                    </button>
                  )
                }
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
