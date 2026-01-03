import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../api';

// 選考ステータスの選択肢
const STATUS_OPTIONS = ['応募中', '書類選考中', '面接予定', '内定', '不採用', '辞退'];

// 志望度の選択肢
const LEVEL_OPTIONS = ['A', 'B', 'C'];

function MainPage() {
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    company_name: '',
    via: '',
    status: '',
    level: '',
    goodpoint: '',
    badpoint: '',
    memo: '',
  });

  // 企業一覧を取得
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError('企業一覧の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // モーダルを開く（新規追加）
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingCompany(null);
    setFormData({
      company_name: '',
      via: '',
      status: '',
      level: '',
      goodpoint: '',
      badpoint: '',
      memo: '',
    });
    setIsModalOpen(true);
  };

  // モーダルを開く（編集）
  const openEditModal = (company) => {
    setIsEditMode(true);
    setEditingCompany(company);
    setFormData({
      company_name: company.company_name,
      via: company.via || '',
      status: company.status || '',
      level: company.level || '',
      goodpoint: company.goodpoint || '',
      badpoint: company.badpoint || '',
      memo: company.memo || '',
    });
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  // フォーム入力の処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // フォーム送信（追加・更新）
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company_name.trim()) {
      alert('企業名を入力してください');
      return;
    }

    try {
      if (isEditMode && editingCompany) {
        await updateCompany(editingCompany.company_id, formData);
      } else {
        await createCompany(formData);
      }
      closeModal();
      fetchCompanies();
    } catch (err) {
      alert(isEditMode ? '更新に失敗しました' : '追加に失敗しました');
      console.error(err);
    }
  };

  // 企業削除
  const handleDelete = async (companyId, companyName) => {
    if (!confirm(`「${companyName}」を削除しますか？`)) {
      return;
    }

    try {
      await deleteCompany(companyId);
      fetchCompanies();
    } catch (err) {
      alert('削除に失敗しました');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      {/* エラー表示 */}
      {error && (
        <div className="card" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* 企業一覧セクション */}
      <div className="card">
        <div className="section-header">
          <h2>応募企業一覧</h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            + 企業を追加
          </button>
        </div>

        {companies.length === 0 ? (
          <p>まだ企業が登録されていません。</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>企業名</th>
                  <th>経由</th>
                  <th>ステータス</th>
                  <th>志望度</th>
                  <th>良い点</th>
                  <th>懸念点</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.company_id}>
                    <td>{company.company_name}</td>
                    <td>{company.via || '-'}</td>
                    <td>
                      {company.status ? (
                        <span className={`status-badge ${company.status}`}>
                          {company.status}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {company.level ? (
                        <span className={`level-badge ${company.level}`}>
                          {company.level}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{company.goodpoint || '-'}</td>
                    <td>{company.badpoint || '-'}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-secondary"
                          onClick={() => openEditModal(company)}
                        >
                          編集
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(company.company_id, company.company_name)}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 追加・編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditMode ? '企業情報を編集' : '企業を追加'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="company_name">企業名 *</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="via">経由</label>
            <input
              type="text"
              id="via"
              name="via"
              value={formData.via}
              onChange={handleInputChange}
              placeholder="例: マイナビ、リクナビ、直接応募"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">選考ステータス</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="">選択してください</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="level">志望度</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
            >
              <option value="">選択してください</option>
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goodpoint">良いと思う点</label>
            <textarea
              id="goodpoint"
              name="goodpoint"
              value={formData.goodpoint}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="badpoint">懸念点</label>
            <textarea
              id="badpoint"
              name="badpoint"
              value={formData.badpoint}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="memo">メモ</label>
            <textarea
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
            />
          </div>

          <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MainPage;