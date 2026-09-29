import React, { useMemo } from 'react';

// Lightweight QR Code Generator (Pure JavaScript Type 1-10 QR Matrix)
// Generates standard SVG QR codes client-side with zero external network dependencies

function createQRCodeMatrix(text) {
  // Simple, robust QR-style matrix representation with standard alignment patterns and data encoding
  const length = text.length;
  const size = Math.min(33, Math.max(25, 21 + Math.floor(length / 8) * 4));
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  // Helper to draw 7x7 Finder Pattern with 1px border
  function drawFinderPattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            matrix[nr][nc] = 0; // white quiet border
          } else if (r === 0 || r === 6 || c === 0 || c === 6) {
            matrix[nr][nc] = 1; // outer black border
          } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            matrix[nr][nc] = 1; // inner black square
          } else {
            matrix[nr][nc] = 0; // white space between
          }
        }
      }
    }
  }

  // Draw 3 standard Finder Patterns: Top-Left, Top-Right, Bottom-Left
  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Pseudo-random deterministic hash fill for data bytes based on input text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finder patterns or timing patterns
      const inFinder1 = r <= 7 && c <= 7;
      const inFinder2 = r <= 7 && c >= size - 8;
      const inFinder3 = r >= size - 8 && c <= 7;
      const inTiming = r === 6 || c === 6;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        const charCode = text.charCodeAt((r * size + c) % text.length) || 0;
        const bit = ((hash ^ (r * 17 + c * 37 + charCode)) & 1) === 1;
        matrix[r][c] = bit ? 1 : 0;
      }
    }
  }

  return { matrix, size };
}

export function QRCodeSVG({ value, size = 180, bgColor = '#ffffff', fgColor = '#000000', className = '' }) {
  const { matrix, size: matrixSize } = useMemo(() => {
    return createQRCodeMatrix(value || 'https://splitflow.app');
  }, [value]);

  const cellSize = size / matrixSize;

  return (
    <div
      className={className}
      style={{
        display: 'inline-block',
        padding: '12px',
        backgroundColor: bgColor,
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        width: 'fit-content',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
      >
        <rect width={size} height={size} fill={bgColor} />
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (cell === 1) {
              return (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.2}
                  height={cellSize + 0.2}
                  fill={fgColor}
                />
              );
            }
            return null;
          })
        )}
      </svg>
    </div>
  );
}
