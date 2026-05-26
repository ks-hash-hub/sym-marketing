import { C } from "../lib/constants.js";

export default function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:C.muted, marginBottom:14, fontFamily:"'DM Mono',monospace" }}>
      {children}
    </div>
  );
}
