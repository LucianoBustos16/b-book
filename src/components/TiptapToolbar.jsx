// TiptapToolbar.jsx
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Code,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link as LinkIcon, Unlink,
    Table as TableIcon, TableProperties, Merge, Split
} from 'lucide-react'

export default function TiptapToolbar({
    editor,
    setLink,
    unsetLink
}) {
    if (!editor) return null

    return (
        <div className="toolbar">
            {/* Selector de encabezados */}
            <select
                value={
                    editor.isActive('paragraph') ? 'paragraph' :
                        editor.isActive('heading', { level: 1 }) ? 'h1' :
                            editor.isActive('heading', { level: 2 }) ? 'h2' :
                                editor.isActive('heading', { level: 3 }) ? 'h3' :
                                    editor.isActive('heading', { level: 4 }) ? 'h4' :
                                        editor.isActive('heading', { level: 5 }) ? 'h5' :
                                            editor.isActive('heading', { level: 6 }) ? 'h6' :
                                                'paragraph'
                }
                onChange={(e) => {
                    const value = e.target.value
                    const chain = editor.chain().focus()
                    if (value === 'paragraph') chain.setParagraph().run()
                    else chain.toggleHeading({ level: parseInt(value[1]) }).run()
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

            {/* Formato básico */}
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`} title="Negrita"><Bold size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`} title="Itálica"><Italic size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`} title="Subrayado"><UnderlineIcon size={18} /></button>

            <div className="toolbar-separator" />

            {/* Listas */}
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`} title="Lista con viñetas"><List size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`} title="Lista numerada"><ListOrdered size={18} /></button>

            <div className="toolbar-separator" />

            {/* Bloques */}
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`} title="Cita"><Quote size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`toolbar-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`} title="Bloque de código"><Code size={18} /></button>

            <div className="toolbar-separator" />

            {/* Enlaces */}
            <button onClick={setLink} className={`toolbar-button ${editor.isActive('link') ? 'is-active' : ''}`} title="Añadir/Editar enlace"><LinkIcon size={18} /></button>
            <button onClick={unsetLink} disabled={!editor.isActive('link')} className="toolbar-button" title="Quitar enlace"><Unlink size={18} /></button>

            <div className="toolbar-separator" />

            {/* Alineación */}
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`} title="Alinear a la izquierda"><AlignLeft size={18} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`} title="Alinear al centro"><AlignCenter size={18} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`} title="Alinear a la derecha"><AlignRight size={18} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`} title="Justificar"><AlignJustify size={18} /></button>

            <div className="toolbar-separator" />

            {/* Tabla */}
            <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="toolbar-button" title="Insertar Tabla"><TableIcon size={18} /></button>
            <button onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()} className="toolbar-button" title="Añadir Columna Antes"><TableProperties size={18} /></button>
            <button onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()} className="toolbar-button" title="Añadir Columna Después"><TableProperties size={18} style={{ transform: 'scaleX(-1)' }} /></button>
            <button onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()} className="toolbar-button" title="Eliminar Columna">🗑️ Col</button>
            <button onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()} className="toolbar-button" title="Añadir Fila Antes"><TableProperties size={18} style={{ transform: 'rotate(90deg)' }} /></button>
            <button onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()} className="toolbar-button" title="Añadir Fila Después"><TableProperties size={18} style={{ transform: 'rotate(-90deg)' }} /></button>
            <button onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()} className="toolbar-button" title="Eliminar Fila">🗑️ Fil</button>
            <button onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()} className="toolbar-button" title="Eliminar Tabla"><TableIcon size={18} style={{ color: 'red' }} /></button>
            <button onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()} className="toolbar-button" title="Fusionar Celdas"><Merge size={18} /></button>
            <button onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()} className="toolbar-button" title="Dividir Celda"><Split size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleHeaderColumn().run()} disabled={!editor.can().toggleHeaderColumn()} className={`toolbar-button ${editor.isActive('tableHeader', { col: true }) ? 'is-active' : ''}`} title="Alternar Columna de Encabezado">H Col</button>
            <button onClick={() => editor.chain().focus().toggleHeaderRow().run()} disabled={!editor.can().toggleHeaderRow()} className={`toolbar-button ${editor.isActive('tableHeader', { row: true }) ? 'is-active' : ''}`} title="Alternar Fila de Encabezado">H Fil</button>
            <button onClick={() => editor.chain().focus().toggleHeaderCell().run()} disabled={!editor.can().toggleHeaderCell()} className={`toolbar-button ${editor.isActive('tableHeader', { cell: true }) ? 'is-active' : ''}`} title="Alternar Celda de Encabezado">H Cel</button>
        </div>
    )
}
