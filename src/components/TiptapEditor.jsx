import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useRef, useEffect } from 'react'
import Turndown from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import TextAlign from '@tiptap/extension-text-align'
import LinkExtension from '@tiptap/extension-link'

// Importar la extensión Underline de Tiptap con un alias
import UnderlineExtension from '@tiptap/extension-underline' 

// Icons de Lucide (Pilcrow y Type se mantienen porque se usan en otras partes si se añaden de nuevo, pero no en el select)
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon, 
  Unlink,
  Type, // Se mantiene para otros usos si fuera necesario
  Pilcrow // Se mantiene para otros usos si fuera necesario
} from 'lucide-react'

export default function TiptapEditor() {
    const [htmlOutput, setHtmlOutput] = useState('')
    const [markdownOutput, setMarkdownOutput] = useState('')
    const [outputView, setOutputView] = useState('editor')
    const [notification, setNotification] = useState({ show: false, message: '' })

    const [showLinkInput, setShowLinkInput] = useState(false)
    const [currentLinkUrl, setCurrentLinkUrl] = useState('')
    const linkInputRef = useRef(null) 

  const turndownService = new Turndown({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
  })
  turndownService.use(gfm)

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Escribe tu contenido aquí...',
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-node-empty',
    }),
    UnderlineExtension,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    LinkExtension.configure({
      openInNewTab: true,
    }),
  ],
  content: '<p></p>',
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    setHtmlOutput(html)
    setMarkdownOutput(turndownService.turndown(html))
      if (!editor.isActive('link')) {
        setShowLinkInput(false)
      }
  },
})

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (linkInputRef.current && !linkInputRef.current.contains(event.target) && !event.target.closest('.toolbar-button[title*="enlace"]')) {
        setShowLinkInput(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const showNotification = (message) => {
    setNotification({ show: true, message })
    setTimeout(() => setNotification({ show: false, message: '' }), 3000)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showNotification('¡Copiado al portapapeles!')
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    setCurrentLinkUrl(previousUrl || '')
    setShowLinkInput(true)

    setTimeout(() => {
      if (linkInputRef.current) {
        linkInputRef.current.focus()
      }
    }, 0);
  }

  const applyLink = () => {
    if (currentLinkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: currentLinkUrl }).run()
    }
    setShowLinkInput(false)
  }

  const unsetLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setShowLinkInput(false)
  }

  const showEditor = () => setOutputView('editor')
  const showHtml = () => setOutputView('html')
  const showMarkdown = () => setOutputView('markdown')

  if (!editor) {
    return null
  }

  return (
    <div className="editor-container">
      {notification.show && (
        <div className="notification">
          {notification.message}
        </div>
      )}
      
      {outputView === 'editor' && (
        <>
          <div className="toolbar">
            {/* Selector de párrafos y encabezados (SIN ÍCONOS) */}
            <select
              value={editor.isActive('paragraph') ? 'paragraph' : 
                    editor.isActive('heading', { level: 1 }) ? 'h1' :
                    editor.isActive('heading', { level: 2 }) ? 'h2' :
                    editor.isActive('heading', { level: 3 }) ? 'h3' :
                    editor.isActive('heading', { level: 4 }) ? 'h4' : 
                    editor.isActive('heading', { level: 5 }) ? 'h5' : 
                    editor.isActive('heading', { level: 6 }) ? 'h6' : 
                    'paragraph'}
              onChange={(e) => {
                const value = e.target.value
                if (value === 'paragraph') {
                  editor.chain().focus().setParagraph().run()
                } else if (value === 'h1') {
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                } else if (value === 'h2') {
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                } else if (value === 'h3') {
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                } else if (value === 'h4') { 
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                } else if (value === 'h5') { 
                  editor.chain().focus().toggleHeading({ level: 5 }).run()
                } else if (value === 'h6') { 
                  editor.chain().focus().toggleHeading({ level: 6 }).run()
                }
              }}
              className="toolbar-select"
            >
              <option value="paragraph">Párrafo</option>
              <option value="h1">Título 1</option>
              <option value="h2">Título 2</option>
              <option value="h3">Título 3</option>
              <option value="h4">Título 4</option> 
              <option value="h5">Título 5</option> 
              <option value="h6">Título 6</option> 
            </select>

            {/* Botones de formato básico */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
              title="Negrita"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
              title="Itálica"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`}
              title="Subrayado"
            >
              <UnderlineIcon size={18} />
            </button>

            <div className="toolbar-separator"></div>

            {/* Botones de listas */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
              title="Lista con viñetas"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
              title="Lista numerada"
            >
              <ListOrdered size={18} />
            </button>

            <div className="toolbar-separator"></div>

            {/* Botones de bloques */}
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`}
              title="Cita"
            >
              <Quote size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`toolbar-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
              title="Bloque de código"
            >
              <Code size={18} />
            </button>

            <div className="toolbar-separator"></div>

            {/* Botones de enlace */}
            <button
              onClick={setLink}
              className={`toolbar-button ${editor.isActive('link') ? 'is-active' : ''}`}
              title="Añadir/Editar enlace"
            >
              <LinkIcon size={18} />
            </button>
            <button
              onClick={unsetLink}
              disabled={!editor.isActive('link')} 
              className="toolbar-button"
              title="Quitar enlace"
            >
              <Unlink size={18} />
            </button>

            <div className="toolbar-separator"></div> 

            {/* Botones de alineación de texto */}
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
              title="Alinear a la izquierda"
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
              title="Alinear al centro"
            >
              <AlignCenter size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
              title="Alinear a la derecha"
            >
              <AlignRight size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
              title="Justificar"
            >
              <AlignJustify size={18} />
            </button>
          </div> {/* Fin del div.toolbar */}

          {/* El input del link como un tooltip */}
          {showLinkInput && (
            <div className="link-input-tooltip" ref={linkInputRef}>
              <input
                type="url"
                placeholder="https://ejemplo.com"
                value={currentLinkUrl}
                onChange={(e) => setCurrentLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyLink()
                  }
                  if (e.key === 'Escape') {
                    setShowLinkInput(false)
                  }
                }}
              />
              <button onClick={applyLink}>Aplicar</button>
            </div>
          )}

          <EditorContent editor={editor} className="tiptap-editor" />
        </>
      )}
      
      {/* Resto del código permanece igual */}
      {outputView === 'html' && (
        <div className="output-view">
          <div className="output-header">
            <h3>HTML Output</h3>
            <button 
              onClick={() => copyToClipboard(htmlOutput)}
              className="copy-button"
            >
              Copiar
            </button>
          </div>
          <pre>{htmlOutput}</pre>
        </div>
      )}
      
      {outputView === 'markdown' && (
        <div className="output-view">
          <div className="output-header">
            <h3>Markdown Output</h3>
            <button 
              onClick={() => copyToClipboard(markdownOutput)}
              className="copy-button"
            >
              Copiar
            </button>
          </div>
          <pre>{markdownOutput}</pre>
        </div>
      )}
      
      <div className="button-group">
        <button 
          onClick={showEditor} 
          className={`toggle-button ${outputView === 'editor' ? 'active' : ''}`}
        >
          Editor
        </button>
        <button 
          onClick={showHtml} 
          className={`toggle-button ${outputView === 'html' ? 'active' : ''}`}
        >
          Ver HTML
        </button>
        <button 
          onClick={showMarkdown} 
          className={`toggle-button ${outputView === 'markdown' ? 'active' : ''}`}
        >
          Ver Markdown
        </button>
      </div>
    </div>
  )
}