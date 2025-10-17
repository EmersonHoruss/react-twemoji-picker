import { useRef, useCallback } from "react";
import useOnclickOutside from "react-cool-onclickoutside";

function App() {
  const containerRef = useRef<HTMLElement | null>(null);

  const handleClickOutside = () => {
    if (containerRef.current) {
      containerRef.current.removeAttribute("data-active");
    }
  };

  const reactCoolRef = useOnclickOutside(handleClickOutside);

  // 👇 memoizamos el ref callback para evitar renders infinitos
  const setRefs = useCallback(
    (el: HTMLElement | null) => {
      console.log("uwu")
      containerRef.current = el;
      reactCoolRef(el);
    },
    [reactCoolRef]
  );

  const handleAddAttribute = () => {
    if (containerRef.current) {
      containerRef.current.setAttribute("data-active", "true");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleAddAttribute}
        className="mb-3 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Activar atributo
      </button>

      <div
        ref={setRefs}
        id="container"
        className="p-4 border rounded transition-colors"
      >
        Contenedor (haz click fuera para remover el atributo)
      </div>
    </div>
  );
}

export default App;
