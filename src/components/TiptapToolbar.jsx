// TiptapToolbar.jsx
import { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Code,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link as LinkIcon, Unlink,
    Table as TableIcon, 
    ChevronDown,
    Pilcrow, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
    Plus,
    Trash, Trash2,
    Settings2,     
} from 'lucide-react';

import TableGridSelector from './TableGridSelector';

export default function TiptapToolbar({
    editor,
    setLink,
    unsetLink
}) {
    const [showHeadingsDropdown, setShowHeadingsDropdown] = useState(false);
    const [showTableGrid, setShowTableGrid] = useState(false);
    const [showTableEditDropdown, setShowTableEditDropdown] = useState(false); // **NUEVO ESTADO**
    const dropdownRef = useRef(null); // Ref para dropdown de estilos de texto
    const tableInsertButtonRef = useRef(null); // Ref para el botón de insertar tabla
    const tableEditDropdownRef = useRef(null); // **NUEVO REF para el dropdown de edición de tabla**


    if (!editor) return null;

    // Lógica para cerrar dropdowns al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Cierra el dropdown de encabezados
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowHeadingsDropdown(false);
            }

            // Cierra la cuadrícula de tabla de inserción
            if (tableInsertButtonRef.current && !tableInsertButtonRef.current.contains(event.target) &&
                !event.target.closest('.table-grid-selector')) {
                setShowTableGrid(false);
            }

            // **Cierra el dropdown de edición de tabla**
            if (tableEditDropdownRef.current && !tableEditDropdownRef.current.contains(event.target)) {
                setShowTableEditDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const headingOptions = [
        { value: 'paragraph', label: 'Párrafo', icon: <Pilcrow  size={16} /> },
        { value: 'h1', label: 'Título 1', icon: <Heading1 size={16} /> },
        { value: 'h2', label: 'Título 2', icon: <Heading2 size={16} /> },
        { value: 'h3', label: 'Título 3', icon: <Heading3 size={16} /> },
        { value: 'h4', label: 'Título 4', icon: <Heading4 size={16} /> },
        { value: 'h5', label: 'Título 5', icon: <Heading5 size={16} /> },
        { value: 'h6', label: 'Título 6', icon: <Heading6 size={16} /> },
    ];

    const getActiveHeadingIcon = () => {
        const activeOption = headingOptions.find(option => {
            if (option.value === 'paragraph') {
                return editor.isActive('paragraph');
            } else {
                return editor.isActive('heading', { level: parseInt(option.value[1]) });
            }
        });
        return activeOption ? activeOption.icon : <Pilcrow  size={16} />;
    };

    const applyHeadingStyle = (value) => {
        const chain = editor.chain().focus();
        if (value === 'paragraph') chain.setParagraph().run();
        else chain.toggleHeading({ level: parseInt(value[1]) }).run();
        setShowHeadingsDropdown(false);
    };

    const handleTableSelect = (rows, cols) => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        setShowTableGrid(false); // Cierra la cuadrícula después de insertar
    };

    const isTableActive = editor.isActive('table');

    return (
        <div className="toolbar">
            {/* Dropdown de estilos de texto */}
            <div className="dropdown-container" ref={dropdownRef}>
                <button
                    onClick={() => setShowHeadingsDropdown(!showHeadingsDropdown)}
                    className="toolbar-button dropdown-toggle"
                    title="Estilos de texto"
                >
                    {getActiveHeadingIcon()} <ChevronDown size={14} />
                </button>
                {showHeadingsDropdown && (
                    <div className="dropdown-menu">
                        {headingOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => applyHeadingStyle(option.value)}
                                className={`dropdown-item ${editor.isActive(option.value === 'paragraph' ? 'paragraph' : 'heading', option.value !== 'paragraph' ? { level: parseInt(option.value[1]) } : {}) ? 'is-active' : ''}`}
                            >
                                {option.icon} {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Formato básico */}
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`} title="Negrita"><Bold size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`} title="Itálica"><Italic size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`} title="Subrayado"><UnderlineIcon size={16} /></button>

            <div className="toolbar-separator" />

            {/* Listas */}
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`} title="Lista con viñetas"><List size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`} title="Lista numerada"><ListOrdered size={16} /></button>

            <div className="toolbar-separator" />

            {/* Bloques */}
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`} title="Cita"><Quote size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`toolbar-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`} title="Bloque de código"><Code size={16} /></button>

            <div className="toolbar-separator" />

            {/* Enlaces */}
            <button onClick={setLink} className={`toolbar-button ${editor.isActive('link') ? 'is-active' : ''}`} title="Añadir/Editar enlace"><LinkIcon size={16} /></button>
            <button onClick={unsetLink} disabled={!editor.isActive('link')} className="toolbar-button" title="Quitar enlace"><Unlink size={16} /></button>

            <div className="toolbar-separator" />

            {/* Alineación */}
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`} title="Alinear a la izquierda"><AlignLeft size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`} title="Alinear al centro"><AlignCenter size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`} title="Alinear a la derecha"><AlignRight size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`} title="Justificar"><AlignJustify size={16} /></button>

            <div className="toolbar-separator" />

            {/* Botón para insertar tabla con la cuadrícula */}
            <div className="dropdown-container" ref={tableInsertButtonRef}>
                <button
                    onClick={() => setShowTableGrid(!showTableGrid)}
                    className="toolbar-button"
                    title="Insertar Tabla"
                >
                    <TableIcon size={16} />
                </button>
                {showTableGrid && (
                    <TableGridSelector onSelectTable={handleTableSelect} />
                )}
            </div>

            {/* Dropdown de opciones de edición de tabla (solo visible si una tabla está activa) */}
            {isTableActive && (
                <div className="dropdown-container" ref={tableEditDropdownRef}>
                    <button
                        onClick={() => setShowTableEditDropdown(!showTableEditDropdown)}
                        className="toolbar-button dropdown-toggle" // Puedes usar dropdown-toggle si quieres la flecha
                        title="Opciones de Tabla"
                    >
                        <Settings2 size={16} /> {/* O EllipsisVertical si prefieres un icono de "más" */}
                        <ChevronDown size={14} /> {/* Opcional: para indicar que es un dropdown */}
                    </button>
                    {showTableEditDropdown && (
                        <div className="dropdown-menu table-edit-dropdown">
                            <button
                                onClick={() => { editor.chain().focus().addColumnBefore().run(); setShowTableEditDropdown(false); }}
                                disabled={!editor.can().addColumnBefore()}
                                className="dropdown-item"
                                title="Añadir columna a la izquierda">
                                <Plus size={16} />
                                Añadir columna a la izquierda                           
                            </button>

                            <button
                                onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableEditDropdown(false); }}
                                disabled={!editor.can().addColumnAfter()}
                                className="dropdown-item"
                                title="Añadir columna a la derecha">
                                <Plus size={16} />
                                Añadir columna a la derecha
                            </button>

                            <button
                                onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableEditDropdown(false); }}
                                disabled={!editor.can().deleteColumn()}
                                className="dropdown-item"
                                title="Eliminar Columna">
                                <Trash size={16} />
                                Eliminar Columna
                            </button>

                            <div className="dropdown-separator" /> {/* Separador opcional */}

                            <button
                                onClick={() => { editor.chain().focus().addRowBefore().run(); setShowTableEditDropdown(false); }}
                                disabled={!editor.can().addRowBefore()}
                                className="dropdown-item"
                                title="Añadir fila encima">
                                <Plus size={16}/>
                                Añadir fila encima
                            </button>

                            <button
                                onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableEditDropdown(false); }}
                                disabled={!editor.can().addRowAfter()}
                                className="dropdown-item"
                                title="Añadir fila debajo">
                                <Plus size={16} />
                                Añadir fila debajo
                            </button>

                            <button
                                onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableEditDropdown(false); }}
                                disabled={!editor.can().deleteRow()}
                                className="dropdown-item"
                                title="Eliminar fila">
                                <Trash size={16} />
                                Eliminar fila
                            </button>

                            <div className="dropdown-separator" />

                            <button
                                onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableEditDropdown(false); }}
                                disabled={!editor.can().deleteTable()}
                                className="dropdown-item"
                                title="Eliminar Tabla">
                                <Trash2 size={16} style={{ color: 'red' }} />
                                Eliminar Tabla
                            </button>
                            {/* <div className="dropdown-separator" />
                            <button onClick={() => { editor.chain().focus().mergeCells().run(); setShowTableEditDropdown(false); }} disabled={!editor.can().mergeCells()} className={`dropdown-item ${editor.isActive('mergeCells') ? 'is-active' : ''}`} title="Fusionar Celdas"><Merge size={16} /> Fusionar Celdas</button>
                            <button onClick={() => { editor.chain().focus().splitCell().run(); setShowTableEditDropdown(false); }} disabled={!editor.can().splitCell()} className={`dropdown-item ${editor.isActive('splitCell') ? 'is-active' : ''}`} title="Dividir Celda"><Split size={16} /> Dividir Celda</button> */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}