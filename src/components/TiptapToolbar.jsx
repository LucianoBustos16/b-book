// TiptapToolbar.jsx
import { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Code,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link as LinkIcon, Unlink,
    Table as TableIcon, TableProperties, Merge, Split,
    ChevronDown, // Icono para el botón del dropdown
    Pilcrow, // Icono genérico para párrafo
    Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 // Iconos para los encabezados
} from 'lucide-react';

import TableGridSelector from './TableGridSelector';

export default function TiptapToolbar({
    editor,
    setLink,
    unsetLink
}) {

    const [showHeadingsDropdown, setShowHeadingsDropdown] = useState(false);
    const [showTableGrid, setShowTableGrid] = useState(false); // Nuevo estado para la cuadrícula de tabla
    const dropdownRef = useRef(null);
    const tableButtonRef = useRef(null); // Ref para el botón de la tabla

    if (!editor) return null;

    // Lógica para cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowHeadingsDropdown(false);
            }
            if (tableButtonRef.current && !tableButtonRef.current.contains(event.target) &&
                !event.target.closest('.table-grid-selector')) { // <-- **Esta es la línea importante para el grid selector**
                setShowTableGrid(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Definimos las opciones de encabezado junto con sus iconos
    const headingOptions = [
        { value: 'paragraph', label: 'Párrafo', icon: <Pilcrow size={16} /> },
        { value: 'h1', label: 'Título 1', icon: <Heading1 size={16} /> },
        { value: 'h2', label: 'Título 2', icon: <Heading2 size={16} /> },
        { value: 'h3', label: 'Título 3', icon: <Heading3 size={16} /> },
        { value: 'h4', label: 'Título 4', icon: <Heading4 size={16} /> },
        { value: 'h5', label: 'Título 5', icon: <Heading5 size={16} /> },
        { value: 'h6', label: 'Título 6', icon: <Heading6 size={16} /> },
    ];

    // Función para obtener el icono del estilo de texto activo
    const getActiveHeadingIcon = () => {
        // Busca en las opciones de encabezado cuál coincide con el estilo activo del editor
        const activeOption = headingOptions.find(option => {
            if (option.value === 'paragraph') {
                return editor.isActive('paragraph');
            } else {
                return editor.isActive('heading', { level: parseInt(option.value[1]) });
            }
        });
        // Si encuentra una opción activa, devuelve su icono, de lo contrario, devuelve el icono de párrafo por defecto
        return activeOption ? activeOption.icon : <Pilcrow size={16} />;
    };

    const applyHeadingStyle = (value) => {
        const chain = editor.chain().focus();
        if (value === 'paragraph') chain.setParagraph().run();
        else chain.toggleHeading({ level: parseInt(value[1]) }).run();
        setShowHeadingsDropdown(false); // Cierra el dropdown después de seleccionar
    };

    // Función para manejar la selección de la tabla desde la cuadrícula
    const handleTableSelect = (rows, cols) => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        setShowTableGrid(false); // Cierra la cuadrícula después de insertar
    };

    return (
        <div className="toolbar">
            {/* Dropdown de estilos de texto */}
            <div className="dropdown-container" ref={dropdownRef}>
                <button
                    onClick={() => setShowHeadingsDropdown(!showHeadingsDropdown)}
                    className="toolbar-button dropdown-toggle"
                    title="Estilos de texto"
                >
                    {getActiveHeadingIcon()} <ChevronDown size={14} /> {/* Aquí solo mostramos el icono */}
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

            {/* Resto de la barra de herramientas (sin cambios) */}
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`} title="Negrita"><Bold size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`} title="Itálica"><Italic size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`} title="Subrayado"><UnderlineIcon size={16} /></button>

            <div className="toolbar-separator" />

            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`} title="Lista con viñetas"><List size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`} title="Lista numerada"><ListOrdered size={16} /></button>

            <div className="toolbar-separator" />

            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`} title="Cita"><Quote size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`toolbar-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`} title="Bloque de código"><Code size={16} /></button>

            <div className="toolbar-separator" />

            <button onClick={setLink} className={`toolbar-button ${editor.isActive('link') ? 'is-active' : ''}`} title="Añadir/Editar enlace"><LinkIcon size={16} /></button>
            <button onClick={unsetLink} disabled={!editor.isActive('link')} className="toolbar-button" title="Quitar enlace"><Unlink size={16} /></button>

            <div className="toolbar-separator" />

            
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`} title="Alinear a la izquierda"><AlignLeft size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`} title="Alinear al centro"><AlignCenter size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`} title="Alinear a la derecha"><AlignRight size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`} title="Justificar"><AlignJustify size={16} /></button>

            <div className="toolbar-separator" />

            {/* Botón para insertar tabla con la cuadrícula */}
            <div className="dropdown-container" ref={tableButtonRef}> {/* Usa un nuevo ref para el botón de tabla */}
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

            
        </div>
    );
}