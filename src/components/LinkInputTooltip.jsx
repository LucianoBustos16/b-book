// LinkInputTooltip.jsx
import { useEffect, useRef } from 'react'

export default function LinkInputTooltip({ editor, linkUrl, setLinkUrl, isEditingLink, setIsEditingLink }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditingLink && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditingLink])

  const handleSubmit = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setLinkUrl('')
    setIsEditingLink(false)
  }

  const handleCancel = () => {
    setLinkUrl('')
    setIsEditingLink(false)
  }

  if (!isEditingLink) return null

  return (
    <div className="link-input-tooltip">
      <input
        ref={inputRef}
        type="text"
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        placeholder="Introduce la URL"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') handleCancel()
        }}
        className="link-input"
      />
      <button onClick={handleSubmit} className="link-submit">Aceptar</button>
      <button onClick={handleCancel} className="link-cancel">Cancelar</button>
    </div>
  )
}
