import { useState, useEffect, useCallback } from 'react'
import { UploadZone } from './UploadZone'
import { Gallery } from './Gallery'
import { api } from '../api'
import { clearAuth } from '../auth'

export function GalleryPage({ onLogout }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPhotos = useCallback(async () => {
    try {
      setError(null)
      const list = await api.list()
      setPhotos(list)
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('로그인이 필요')) {
        clearAuth()
        onLogout?.()
      } else {
        setError(e.message || '사진 목록을 불러오지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [onLogout])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  return (
    <div className="gallery-page">
      <h2 className="page-title">Gallery</h2>
      <p className="page-desc">사진을 업로드하면 외장 SSD에 저장됩니다.</p>
      <UploadZone onSuccess={fetchPhotos} />
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="loading">불러오는 중…</div>
      ) : (
        <Gallery photos={photos} onDeleteSuccess={fetchPhotos} />
      )}
    </div>
  )
}
