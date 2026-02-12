import { useState, useRef } from 'react'
import { api } from '../api'
import './UploadZone.css'

export function UploadZone({ onSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const inputRef = useRef(null)

  const doUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('이미지 파일만 업로드할 수 있습니다.')
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      await api.upload(file)
      onSuccess?.()
    } catch (e) {
      setUploadError(e.message || '업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) doUpload(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => {
    setDragging(false)
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) doUpload(file)
    e.target.value = ''
  }

  const clickInput = () => {
    if (!uploading) inputRef.current?.click()
  }

  return (
    <section className="upload-zone">
      <div
        className={`drop-area ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={clickInput}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="file-input"
          disabled={uploading}
        />
        {uploading ? (
          <span className="drop-text">업로드 중…</span>
        ) : (
          <span className="drop-text">사진을 여기에 놓거나 클릭하여 선택</span>
        )}
      </div>
      {uploadError && (
        <p className="upload-error" role="alert">
          {uploadError}
        </p>
      )}
    </section>
  )
}
