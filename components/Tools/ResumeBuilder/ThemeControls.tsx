// components/ResumeBuilder/ThemeControls.tsx
export interface Theme {
  color: string
  font: string
  fontSize: number
  docSize: string
}

interface ThemeControlsProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}
export function ThemeControls({ theme, setTheme }: ThemeControlsProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow flex flex-col gap-4">
      <div>
        <label className="font-semibold">Theme Color</label>
        <div className="flex gap-2 mt-2">
          {["#2563EB","#38bdf8","#4ade80","#fbbf24","#f87171","#a78bfa","#f472b6"].map((color) => (
            <button
              key={color}
              style={{ background: color, width: 32, height: 32, borderRadius: 6, border: theme.color === color ? '2px solid #222' : 'none' }}
              onClick={() => setTheme({ ...theme, color })}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="font-semibold">Font Family</label>
        <select value={theme.font} onChange={e => setTheme({ ...theme, font: e.target.value })} className="mt-1">
          <option value="Inter">Inter</option>
          <option value="Merriweather">Merriweather</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
        </select>
      </div>
      <div>
        <label className="font-semibold">Font Size</label>
        <input type="range" min={10} max={18} value={theme.fontSize} onChange={e => setTheme({ ...theme, fontSize: Number(e.target.value) })} />
        <span className="ml-2">{theme.fontSize}px</span>
      </div>
    </div>
  )
}
