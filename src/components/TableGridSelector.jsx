import React, { useState, useEffect } from 'react';

const MAX_ROWS = 10;
const MAX_COLS = 10;

export default function TableGridSelector({ onSelectTable }) {
    const [tempRows, setTempRows] = useState(0);
    const [tempCols, setTempCols] = useState(0);
    const [confirmedSelection, setConfirmedSelection] = useState({ rows: 0, cols: 0 });
    const [isMobile, setIsMobile] = useState(false); // **NUEVO ESTADO**

    useEffect(() => {
        // Detecta si el navegador soporta eventos táctiles.
        // Esto es una buena heurística para diferenciar entre desktop y mobile/tablet.
        const checkIsMobile = () => {
            if (typeof window !== 'undefined') { // Asegura que se ejecute solo en el cliente
                return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
            }
            return false;
        };
        setIsMobile(checkIsMobile());

        // Opcional: Re-verificar si el tamaño de la ventana cambia (ej. tablet gira)
        // Esto es un poco overkill para este caso simple, pero útil para experiencias más complejas.
        // const handleResize = () => setIsMobile(checkIsMobile());
        // window.addEventListener('resize', handleResize);
        // return () => window.removeEventListener('resize', handleResize);
    }, []); // Se ejecuta solo una vez al montar

    // Comportamiento para desktop: hover dinámico
    const handleMouseEnter = (row, col) => {
        if (!isMobile) { // Solo si NO es mobile
            setTempRows(row);
            setTempCols(col);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) { // Solo si NO es mobile
            setTempRows(0);
            setTempCols(0);
        }
    };

    // Comportamiento de clic:
    // En desktop: un clic inicial, luego la inserción directa (sin botón "Insertar")
    // En mobile: el primer tap fija la selección, el segundo tap NO hace nada si ya hay un botón "Insertar"
    const handleClick = (row, col) => {
        if (isMobile) {
            // En mobile, el primer tap fija la selección y muestra el botón "Insertar"
            setConfirmedSelection({ rows: row, cols: col });
            setTempRows(row); // También actualiza temp para visualización
            setTempCols(col); // También actualiza temp para visualización
        } else {
            // En desktop, el clic inserta directamente la tabla
            onSelectTable(row, col);
            // Opcional: resetear tempRows/Cols después de la inserción en desktop
            setTempRows(0);
            setTempCols(0);
        }
    };

    const handleInsertButtonClick = () => {
        if (isMobile && confirmedSelection.rows > 0 && confirmedSelection.cols > 0) {
            onSelectTable(confirmedSelection.rows, confirmedSelection.cols);
            // Resetear la selección confirmada después de insertar en mobile
            setConfirmedSelection({ rows: 0, cols: 0 });
            setTempRows(0);
            setTempCols(0);
        }
    };

    // Determina qué dimensiones mostrar/resaltar
    const displayRows = isMobile ? confirmedSelection.rows : tempRows;
    const displayCols = isMobile ? confirmedSelection.cols : tempCols;

    return (
        <div className="table-grid-selector" onMouseLeave={handleMouseLeave}>
            <div className="grid-cells">
                {[...Array(MAX_ROWS)].map((_, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {[...Array(MAX_COLS)].map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className={`grid-cell ${
                                    rowIndex < displayRows && colIndex < displayCols ? 'hovered' : ''
                                }`}
                                onMouseEnter={() => handleMouseEnter(rowIndex + 1, colIndex + 1)}
                                onClick={() => handleClick(rowIndex + 1, colIndex + 1)}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="grid-dimensions">
                {displayCols > 0 && displayRows > 0 ? `${displayCols} x ${displayRows}` : 'Selecciona una tabla'}
            </div>
            {isMobile && confirmedSelection.rows > 0 && ( // Muestra el botón solo en mobile y si hay una selección fijada
                <button
                    className="insert-table-button"
                    onClick={handleInsertButtonClick}
                    title={`Insertar tabla de ${confirmedSelection.cols}x${confirmedSelection.rows}`}
                >
                    Insertar {confirmedSelection.cols}x{confirmedSelection.rows}
                </button>
            )}
        </div>
    );
}