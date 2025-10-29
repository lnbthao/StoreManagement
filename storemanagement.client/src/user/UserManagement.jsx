import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Eye, Funnel, PencilSquare, PlusCircleFill, Trash3 } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { MOCK_USERS } from "../../mockData/Users";
import UserViewModal from "./UserViewModal";
import UserFilterModal from "./UserFilterModal";

export default function UserManagement() {
  const navTo = useNavigate();
  const [userList, setUserList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openView, setOpenView] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);

  const displayRole = role => (role === "admin") ? "Quản trị viên" : "Nhân viên";

  const loadFromApi = async (q = "") => {
    const url = `/api/user`;
    const res = await axios.get(url);
    return res.data;
  };

  const handleSearch = (value) => {
    setSearch(value);
    // TODO: gọi hàm loadFromApi để tiến hành tìm kiếm
  };

  useEffect(() => {
    (async () => {
      document.title = "Người dùng | Quản lý kho hàng";
      try {
        const data = await loadFromApi();
        setUserList(data);
        setMockMode(false);
      } catch {
        setUserList(MOCK_USERS);
        setMockMode(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openUserModal = (user) => {
    setSelectedUser(user || null);
    setOpenView(true);
  };

  const closeUserModal = () => {
    setOpenView(false);
    setSelectedUser(null);
  };

  const handleDelete = async (u) => {
    if (
      !window.confirm(
        `Xóa người dùng #${u.userId}: ${u.fullName || u.username || ""}?`
      )
    ) {
      alert("Đã xoá (demo)!");
      // TODO: gọi API xoá rồi cập nhật state:
    }
  };

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        Quản lý người dùng{" "}
      </h1>

      <div className="d-flex column-gap-3 mb-3">
        <button className="btn btn-success d-flex align-items-center column-gap-1" onClick={() => navTo("/admin/user/add")}>
          <PlusCircleFill className="me-1" /> Thêm người dùng
        </button>

        <form className="col" onSubmit={e => e.preventDefault()}>
          <input
            type="search"
            placeholder="Nhập dữ liệu tìm kiếm"
            className="form-control"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </form>
        <button
          className="btn btn-outline-secondary"
          title="Lọc"
          aria-label="Lọc"
          onClick={() => setOpenFilter(true)}
        >
          <Funnel size={22} />
          Bộ lọc
        </button>
      </div>

      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr className="text-center">
            <th>ID</th>
            <th>Username</th>
            <th>Họ tên</th>
            <th>Vai trò</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {userList.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center fst-italic">
                Không có người dùng!
              </td>
            </tr>
          ) : (
            userList.map((u) => (
              <tr key={`user-${u.userId}`}>
                <td>{u.userId}</td>
                <td className="text-center">{u.username}</td>
                <td className="text-center">{u.fullName}</td>
                <td className="text-center">{displayRole(u.role)}</td>
                <td className="text-center">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString("vi-VN")
                    : ""}
                </td>
                <td className="text-center">
                  <button
                    className="btn p-0 me-2 border border-0"
                    title="Xem chi tiết"
                    onClick={() => openUserModal(u)}
                  >
                    <Eye size={22} color="darkcyan" />
                  </button>
                  <button
                    className="btn p-0 me-2 border border-0"
                    onClick={() => navTo(`/admin/user/edit/${u.userId}`)}
                    title="Sửa"
                  >
                    <PencilSquare size={22} color="darkblue" />
                  </button>
                  <button
                    className="btn p-0 border border-0"
                    title="Xoá"
                    onClick={() => handleDelete(u)}
                  >
                    <Trash3 size={22} color="crimson" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <UserFilterModal open={openFilter} onClose={() => setOpenFilter(false)} />
      <UserViewModal
        open={openView}
        user={selectedUser}
        onClose={closeUserModal}
      />
    </>
  );
}
