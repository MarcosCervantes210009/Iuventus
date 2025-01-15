import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const images = [
  "/placeholder.svg?height=400&width=800&text=Imagen+1",
  "/placeholder.svg?height=400&width=800&text=Imagen+2",
  "/placeholder.svg?height=400&width=800&text=Imagen+3",
  "/placeholder.svg?height=400&width=800&text=Imagen+4",
];

const Pagina = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLogin = () => {
    // Redirige al login
    console.log("Redirigiendo al login...");
    navigate("/login", { replace: true });
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegación */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="text-xl font-bold">
              Mi Sitio
            </a>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="/" className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  Inicio
                </a>
                <a href="/about" className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  Acerca de
                </a>
                <a href="/contact" className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  Contacto
                </a>
              </div>
            </div>
            <button
              className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100"
              onClick={handleLogin}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Bienvenido a Nuestra Página
        </h1>

        {/* Carrusel de imágenes */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-lg shadow-lg">
            <img
              src={images[currentIndex] || "/placeholder.svg"}
              //alt={Slide ${currentIndex + 1}}
              className="w-full h-auto"
            />
          </div>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r-md hover:bg-opacity-75"
          >
            &#10094;
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l-md hover:bg-opacity-75"
          >
            &#10095;
          </button>
        </div>
      </main>
    </div>
  );
};

export default Pagina;