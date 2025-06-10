// TiptapToolbar.jsx
import { useState, useRef, useEffect, useCallback } from 'react'; // Importa useCallback
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
    // Asegúrate de importar estas si las vas a usar para las opciones de tabla comentadas
    // Merge, // Descomentar si usas Merge
    // Split, // Descomentar si usas Split
    // TableProperties // Descomentar si usas TableProperties
} from 'lucide-react';

import TableGridSelector from './TableGridSelector';

export default function TiptapToolbar({
    editor,
    setLink,
    unsetLink
}) {
    const [showHeadingsDropdown, setShowHeadingsDropdown] = useState(false);
    const [showTableGrid, setShowTableGrid] = useState(false);
    const [showTableEditDropdown, setShowTableEditDropdown] = useState(false);

    // Refs para los CONTENEDORES de los dropdowns (para el handleClickOutside)
    // El 'dropdownRef' original debe ser más específico, lo renombramos a headingsDropdownRef
    const headingsDropdownRef = useRef(null);
    const tableInsertButtonRef = useRef(null);
    const tableEditDropdownRef = useRef(null);

    // Refs para los MENÚS de los dropdowns (para medir su ancho con offsetWidth)
    const headingsMenuRef = useRef(null);
    const tableEditMenuRef = useRef(null);

    // Estados para la dirección de apertura de los dropdowns
    const [headingsDropdownDirection, setHeadingsDropdownDirection] = useState('left');
    const [tableEditDropdownDirection, setTableEditDropdownDirection] = useState('left');


    if (!editor) return null;

    // Función para calcular la dirección de un dropdown
    const calculateDropdownDirection = useCallback((buttonRef, menuRef, setDirection) => {
        if (buttonRef.current && menuRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuWidth = menuRef.current.offsetWidth;
            const viewportWidth = window.innerWidth;

            // Calcula si hay suficiente espacio a la derecha
            const spaceRight = viewportWidth - buttonRect.right;
            // Calcula si hay suficiente espacio a la izquierda (desde el inicio del botón)
            // Se calcula desde la posición izquierda del botón
            const spaceLeft = buttonRect.left;

            // Define un margen mínimo (ej. 10px) para no pegar el dropdown al borde
            const margin = 10;

            // Lógica: Si no hay suficiente espacio a la derecha PARA EL MENÚ (menuWidth + margin)
            // Y hay suficiente espacio a la izquierda (spaceLeft >= menuWidth + margin)
            // Entonces, abrimos a la derecha. De lo contrario, por defecto a la izquierda.
            if (spaceRight < (menuWidth + margin) && spaceLeft >= (menuWidth + margin)) {
                setDirection('right'); // Abrir a la derecha (alineado al borde derecho del botón)
            } else {
                setDirection('left'); // Por defecto o si hay espacio a la izquierda, abrir a la izquierda
            }
        }
    }, []); // Dependencias vacías porque no depende de props o estados internos


    // Lógica para cerrar dropdowns al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Cierra el dropdown de encabezados
            if (headingsDropdownRef.current && !headingsDropdownRef.current.contains(event.target)) {
                setShowHeadingsDropdown(false);
            }

            // Cierra la cuadrícula de tabla de inserción
            if (tableInsertButtonRef.current && !tableInsertButtonRef.current.contains(event.target) &&
                // Asegúrate de que el clic no fue dentro del TableGridSelector
                !event.target.closest('.table-grid-selector')) {
                setShowTableGrid(false);
            }

            // Cierra el dropdown de edición de tabla
            if (tableEditDropdownRef.current && !tableEditDropdownRef.current.contains(event.target)) {
                setShowTableEditDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    // Manejadores para alternar la visibilidad y calcular la dirección
    const toggleHeadingsDropdown = () => {
        const newState = !showHeadingsDropdown;
        setShowHeadingsDropdown(newState);
        if (newState) {
            // Un pequeño retraso para que el menú se renderice antes de medirlo
            setTimeout(() => {
                calculateDropdownDirection(headingsDropdownRef, headingsMenuRef, setHeadingsDropdownDirection);
            }, 0);
        }
    };

    const toggleTableEditDropdown = () => {
        const newState = !showTableEditDropdown;
        setShowTableEditDropdown(newState);
        if (newState) {
            // Un pequeño retraso para que el menú se renderice antes de medirlo
            setTimeout(() => {
                calculateDropdownDirection(tableEditDropdownRef, tableEditMenuRef, setTableEditDropdownDirection);
            }, 0);
        }
    };

    const headingOptions = [
        { value: 'paragraph', label: 'Párrafo', icon: <Pilcrow size={16} /> },
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
        return activeOption ? activeOption.icon : <Pilcrow size={16} />;
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
            {/* Se usa headingsDropdownRef para el contenedor y headingsMenuRef para el menú */}
            <div className="dropdown-container" ref={headingsDropdownRef}>
                <button
                    onClick={toggleHeadingsDropdown}
                    className="toolbar-button dropdown-toggle"
                    title="Estilos de texto"
                >
                    {getActiveHeadingIcon()} <ChevronDown size={14} />
                </button>
                {showHeadingsDropdown && (
                    <div
                        className={`dropdown-menu ${headingsDropdownDirection === 'right' ? 'align-right' : ''}`}
                        ref={headingsMenuRef} // Ref para el MENÚ
                    >
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
                        onClick={toggleTableEditDropdown} // Usa el nuevo manejador para calcular la dirección
                        className="toolbar-button dropdown-toggle"
                        title="Opciones de Tabla"
                    >
                        <Settings2 size={16} />
                        <ChevronDown size={14} />
                    </button>
                    {showTableEditDropdown && (
                        <div
                            className={`dropdown-menu table-edit-dropdown ${tableEditDropdownDirection === 'right' ? 'align-right' : ''}`}
                            ref={tableEditMenuRef} // Ref para el MENÚ de edición de tabla
                        >
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

                            <div className="dropdown-separator" />

                            <button
                                onClick={() => { editor.chain().focus().addRowBefore().run(); setShowTableEditDropdown(false); }}
                                disabled={!editor.can().addRowBefore()}
                                className="dropdown-item"
                                title="Añadir fila encima">
                                <Plus size={16} />
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
                            {/* Opciones comentadas... DESCOMENTA Y AÑADE LAS IMPORTACIONES DE LUCIDE-REACT SI LAS USAS */}
                            {/*
                            <div className="dropdown-separator" />
                            <button onClick={() => { editor.chain().focus().mergeCells().run(); setShowTableEditDropdown(false); }} disabled={!editor.can().mergeCells()} className={`dropdown-item ${editor.isActive('mergeCells') ? 'is-active' : ''}`} title="Fusionar Celdas"><Merge size={16} /> Fusionar Celdas</button>
                            <button onClick={() => { editor.chain().focus().splitCell().run(); setShowTableEditDropdown(false); }} disabled={!editor.can().splitCell()} className={`dropdown-item ${editor.isActive('splitCell') ? 'is-active' : ''}`} title="Dividir Celda"><Split size={16} /> Dividir Celda</button>
                            <div className="dropdown-separator" />
                            <button onClick={() => { editor.chain().focus().toggleHeaderColumn().run(); setShowTableEditDropdown(false); }} disabled={!editor.can().toggleHeaderColumn()} className={`dropdown-item ${editor.isActive('tableHeader', { col: true }) ? 'is-active' : ''}`} title="Alternar Columna de Encabezado"><TableProperties size={16} /> H Col</button>
                            <button onClick={() => { editor.chain().focus().toggleHeaderRow().run(); setShowTableEditDropdown(false); }} disabled={!editor.can().toggleHeaderRow()} className={`dropdown-item ${editor.isActive('tableHeader', { row: true }) ? 'is-active' : ''}`} title="Alternar Fila de Encabezado"><TableProperties size={16} /> H Fil</button>
                            <button onClick={() => { editor.chain().focus().toggleHeaderCell().run(); setShowTableEditDropdown(false); }} disabled={!editor.can().toggleHeaderCell()} className={`dropdown-item ${editor.isActive('tableHeader', { cell: true }) ? 'is-active' : ''}`} title="Alternar Celda de Encabezado"><TableProperties size={16} /> H Cel</button>
                            */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}