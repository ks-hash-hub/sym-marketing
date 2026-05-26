export default function Pill({ label, color }) {
  return (
    <span style={{ background:`${color}1a`, color, border:`1px solid ${color}44`, borderRadius:99, padding:"2px 9px", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}
