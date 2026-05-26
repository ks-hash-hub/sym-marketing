import { C } from "../lib/constants.js";

export default function Card({ children, style={} }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:22, ...style }}>
      {children}
    </div>
  );
}
