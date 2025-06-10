import React, { useState } from 'react';

const MAX_ROWS = 10; // Puedes ajustar esto
const MAX_COLS = 10; // Puedes ajustar esto

export default function TableGridSelector({ onSelectTable }) {
    const [hoveredRows, setHoveredRows] = useState(0);
    const [hoveredCols, setHoveredCols] = useState(0);

    const handleMouseEnter = (row, col) => {
        setHoveredRows(row);
        setHoveredCols(col);
    };

    const handleMouseLeave = () => {
        setHoveredRows(0);
        setHoveredCols(0);
    };

    const handleClick = () => {
        if (hoveredRows > 0 && hoveredCols > 0) {
            onSelectTable(hoveredRows, hoveredCols);
        }
    };

    return (
        <div className="table-grid-selector" onMouseLeave={handleMouseLeave}>
            <div className="grid-cells">
                {[...Array(MAX_ROWS)].map((_, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {[...Array(MAX_COLS)].map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className={`grid-cell ${
                                    rowIndex < hoveredRows && colIndex < hoveredCols ? 'hovered' : ''
                                }`}
                                onMouseEnter={() => handleMouseEnter(rowIndex + 1, colIndex + 1)}
                                onClick={handleClick}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="grid-dimensions">
                {hoveredCols > 0 && hoveredRows > 0 ? `${hoveredCols} x ${hoveredRows}` : 'Selecciona una tabla'}
            </div>
        </div>
    );
}
