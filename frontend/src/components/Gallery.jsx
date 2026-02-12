import { useState } from 'react'
import { api } from '../api'
import './Gallery.css'

export function Gallery({ photos, onDeleteSuccess }) {
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  const handleDelete = async (e, photo) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`"${photo.originalFilename}"을(를) 삭제할까요?`)) return
    setDeleteError(null)
    setDeletingId(photo.id)
    try {
      await api.delete(photo.id)
      onDeleteSuccess?.()
    } catch (err) {
      setDeleteError(err.message || '삭제에 실패했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!photos.length) {
    return (
      <div className="gallery-empty">
        업로드된 사진이 없습니다.
      </div>
    )
  }

  return (
    <section className="gallery" aria-label="사진 갤러리">
      {deleteError && (
        <div className="gallery-delete-error" role="alert">
          {deleteError}
        </div>
      )}
      <ul className="gallery-grid">
        {photos.map((photo) => (
          <li key={photo.id} className="gallery-item">
            <a
              href={api.fileUrl(photo.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="gallery-link"
            >
              <img
                src={api.fileUrl(photo.id)}
                alt={photo.originalFilename}
                loading="lazy"
                className="gallery-img"
              />
              <span className="gallery-caption">{photo.originalFilename}</span>
            </a>
            <button
              type="button"
              className="gallery-delete-btn"
              onClick={(e) => handleDelete(e, photo)}
              disabled={deletingId === photo.id}
              title="삭제"
              aria-label="사진 삭제"
            >
              {deletingId === photo.id ? '삭제 중…' : '삭제'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
