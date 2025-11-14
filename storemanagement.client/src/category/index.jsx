import axios from 'axios';
import { useState, useEffect } from 'react';
import { Eye, PencilSquare, PlusCircleFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

export default function CategoryManagement() {
  const navTo = useNavigate();
  const [categoryList, setCategoryList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const handleSearch = value => {
    setSearch(value);
    axios.get(`/api/category?name=${value}`).then(response => setCategoryList(response.data));
  }

  useEffect(() => {
    if (loading) {
      document.title = "Loại sản phẩm | Quản lý kho hàng";
      axios.get("/api/category").then(response => {
        setCategoryList(response.data);
        setLoading(false);
      })
    }
  }, []);

  return loading ? <></> : (
    <>
      <h1 className='text-center text-uppercase mb-3 fs-2'>Quản lý loại sản phẩm</h1>

      <div className='d-flex column-gap-3 mb-3'>
        <button className='btn btn-success' onClick={() => navTo('/category/add')}>
          <PlusCircleFill className="me-1" /> Thêm loại mới
        </button>

        <form className='col'>
          <input
            type="search" placeholder="Nhập tên loại cần tìm"
            className='form-control'
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </form>
      </div>

      <table className='table table-striped table-hover table-bordered'>
        <thead>
          <tr className='text-center'>
            <th>ID</th>
            <th>Tên loại sản phẩm</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
        {
          (categoryList.length === 0) ? (
            <tr>
              <td colSpan={3} className='text-center fst-italic'>Không có sản phẩm!</td>
            </tr>
          ) : categoryList.map(c =>
            <tr key={`category-${c.categoryId}`}>
              <td>{c.categoryId}</td>
              <td className='text-center'>{c.categoryName}</td>
              <td className='text-center'>
                <button className='btn p-0 me-1' onClick={() => navTo(`/category/edit/${c.categoryId}`)}>
                  <PencilSquare size={24} />
                </button>
                <button className='btn p-0'>
                  <Eye size={24} />
                </button>
              </td>
            </tr>
          )
        }
        </tbody>
      </table>
    </>
  )
}