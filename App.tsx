import React, { useState, useEffect, useCallback } from 'react';
import { AppScreen, UserPreferences, Story, StoryType } from './types';
import { generateStory } from './services/geminiService';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from "framer-motion";
import LegalModal from "./components/LegalModal";
const ADMIN_MODE = import.meta.env.VITE_ADMIN_MODE === "true";


  // --- Utility for PDF Download ---
    const downloadStory = (story: Story, childName?: string) => {
    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 25;
    const maxWidth = pageWidth - marginX * 2;

    let cursorY = 0;
    let pageNumber = 1;

    /* =========================
      PORTADA
    ========================= */

    doc.setFillColor(253, 247, 242); // mismo tono que la app
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(45, 49, 66);
    doc.text(story.title, pageWidth / 2, 70, { align: "center", maxWidth });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(107, 112, 92);
    doc.text(
      `Un cuento mágico creado especialmente`,
      pageWidth / 2,
      105,
      { align: "center" }
    );

    if (childName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(124, 58, 237);
      doc.text(`para ${childName}`, pageWidth / 2, 125, { align: "center" });
    }

    doc.addPage();

    /* =========================
      CUENTO (PÁGINAS)
    ========================= */

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);

    const paragraphs = story.pages.flat();
    let skipNext = false;

    cursorY = 35;

    for (let i = 0; i < paragraphs.length; i++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }

      let paragraph = paragraphs[i].trim();

      // 👉 Evitar párrafos huérfanos (una sola línea)
      const testLines = doc.splitTextToSize(paragraph, maxWidth);
      if (testLines.length === 1 && i < paragraphs.length - 1) {
        paragraph = paragraph + " " + paragraphs[i + 1].trim();
        skipNext = true;
      }

      const lines = doc.splitTextToSize(paragraph, maxWidth);

      // Salto de página si no cabe
      if (cursorY + lines.length * 7 > pageHeight - 30) {
        // número de página
        doc.setFontSize(10);
        doc.setTextColor(160);
        doc.text(`${pageNumber}`, pageWidth / 2, pageHeight - 15, {
          align: "center",
        });

        pageNumber++;
        doc.addPage();
        cursorY = 35;
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
      }

      doc.text(lines, marginX, cursorY);
      cursorY += lines.length * 7 + 6;
    }

    // Número de la última página del cuento
    doc.setFontSize(10);
    doc.setTextColor(160);
    doc.text(`${pageNumber}`, pageWidth / 2, pageHeight - 15, {
      align: "center",
    });

    /* =========================
      PÁGINA FINAL EMOCIONAL
    ========================= */

    doc.addPage();

    doc.setFont("helvetica", "italic");
    doc.setFontSize(16);
    doc.setTextColor(90, 90, 90);

    let endY = pageHeight / 2 - 20;

    doc.text(
      "Este cuento fue creado con cariño",
      pageWidth / 2,
      endY,
      { align: "center" }
    );
    endY += 18;

    doc.text(
      "para ser leído una y otra vez.",
      pageWidth / 2,
      endY,
      { align: "center" }
    );
    endY += 30;

    doc.setFont("helvetica", "bold");
    doc.text(
      "Gracias por confiar en",
      pageWidth / 2,
      endY,
      { align: "center" }
    );
    endY += 18;

    doc.text(
      "Mi Cuento Mágico",
      pageWidth / 2,
      endY,
      { align: "center" }
    );

    /* =========================
      GUARDAR
    ========================= */

    const safeTitle = story.title.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
    doc.save(`${safeTitle}.pdf`);
  };


// --- Sub-components ---

const Landing: React.FC<{ 
      onStart: () => void; 
      onOpenLibrary: () => void; 
      hasStories: boolean;
      onOpenLegal: (type: "legal" | "privacy" | "terms") => void;
    }> = ({ onStart, onOpenLibrary, hasStories, onOpenLegal }) => (

  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#FFF9F2] to-[#F3E8FF]">
    <div className="max-w-md animate-float drop-shadow-2xl">
        <div className="text-8xl mb-6">✨🌙✨</div>
    </div>
    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#2D3142] drop-shadow-sm">
      Crea un cuento único para tu hijo
    </h1>
    <p className="text-xl text-[#6B705C] mb-10 max-w-sm mx-auto">
      Dales el regalo de una historia mágica, personalizada y lista en segundos.
    </p>
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <button 
        onClick={onStart}
        className="bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] hover:from-[#FFBF69] hover:to-[#FF9F1C] text-white text-xl font-bold py-5 px-10 rounded-2xl shadow-xl transition-all transform active:scale-95"
      >
        Empezar ahora
      </button>
      {hasStories && (
        <button 
          onClick={onOpenLibrary}
          className="text-[#6B705C] font-semibold py-3 hover:text-[#9F5FAD] transition-colors flex items-center justify-center gap-2 bg-white/50 rounded-xl backdrop-blur-sm"
        >
          <span>📚</span> Mi biblioteca
        </button>
      )}
    </div>
        <div className="mt-12 text-xs text-gray-400 flex gap-4 justify-center">
      <button 
        onClick={() => onOpenLegal("legal")} 
        className="underline"
      >
        Aviso legal
      </button>

      <button 
        onClick={() => onOpenLegal("privacy")} 
        className="underline"
      >
        Privacidad
      </button>

      <button 
        onClick={() => onOpenLegal("terms")} 
        className="underline"
      >
        Términos
      </button>
    </div>

  </div>
);

const Library: React.FC<{ 
  stories: Story[]; 
  onSelect: (story: Story) => void; 
  onBack: () => void;
  onDelete: (id: string) => void;
}> = ({ stories, onSelect, onBack, onDelete }) => (
  <div className="min-h-screen p-6 max-w-4xl mx-auto bg-[#FDFCFB]">
    <div className="flex justify-between items-center mb-10">
      <h2 className="text-3xl font-bold text-[#2D3142]">Mis historias</h2>
      <button onClick={onBack} className="text-[#6B705C] font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 transition-all hover:bg-gray-50">Cerrar</button>
    </div>

    {stories.length === 0 ? (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-purple-100">
        <div className="text-7xl mb-4 opacity-50">📖</div>
        <p className="text-xl text-gray-400">Aún no has guardado cuentos.</p>
        <button 
          onClick={onBack}
          className="mt-6 text-[#FF9F1C] font-bold underline"
        >
          ¡Crea tu primera historia!
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.sort((a, b) => b.createdAt - a.createdAt).map(story => (
          <div key={story.id} className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-shadow border border-purple-50 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-3xl">📘</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(story.id);
                  }}
                  className="text-gray-200 hover:text-red-400 p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-xl font-bold text-[#2D3142] mb-1 font-serif leading-tight">{story.title}</h3>
              <p className="text-[10px] text-gray-400 mb-6 uppercase tracking-widest font-black">
                {new Date(story.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onSelect(story)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-sm"
              >
                Leer ahora
              </button>
              </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const CustomizationForm: React.FC<{ 
  onGenerate: (prefs: UserPreferences) => void;
  onBack: () => void;
}> = ({ onGenerate, onBack }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(4);
  const [gender, setGender] = useState<'niño' | 'niña'>('niño');
  const [interestsInput, setInterestsInput] = useState('');
  const [storyType, setStoryType] = useState<StoryType>('mágica');
  const [language, setLanguage] = useState('Español');

  const storyTypes: {id: StoryType, emoji: string, label: string}[] = [
    { id: 'aventura', emoji: '⚔️', label: 'Aventura' },
    { id: 'mágica', emoji: '✨', label: 'Magia' },
    { id: 'animales', emoji: '🦁', label: 'Animales' },
    { id: 'espacial', emoji: '🚀', label: 'Espacio' },
    { id: 'misterio', emoji: '🕵️', label: 'Misterio' },
    { id: 'tranquila', emoji: '🛌', label: 'Dormir' },
  ];

  const ages = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !interestsInput) return;
    const interests = interestsInput.split(',').map(i => i.trim()).filter(i => i.length > 0);
    onGenerate({ name, age, gender, interests, storyType, language });
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto flex flex-col justify-center bg-gradient-to-b from-indigo-50 via-purple-50 to-white">
      <div className="mb-8">
         <button onClick={onBack} className="text-indigo-400 font-bold mb-4 text-sm flex items-center gap-1 hover:text-indigo-600 transition-colors">
            ← Volver
         </button>
         <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[#2D3142] font-serif text-center md:text-left">
            Configuremos la magia
          </h2>
          <p className="text-[#6B705C] text-lg text-center md:text-left">
            Cuéntanos para quién es este cuento especial.
          </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
        
        {/* Sección 1: Datos básicos */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-purple-100/50 border border-purple-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">Nombre del protagonista</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-indigo-50/30 border-2 border-indigo-50 focus:border-purple-400 focus:bg-white outline-none transition-all text-xl font-bold text-indigo-900 placeholder-indigo-200"
                        placeholder="Ej: Leo"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">Le gusta...</label>
                    <input 
                        type="text" 
                        value={interestsInput}
                        onChange={(e) => setInterestsInput(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-indigo-50/30 border-2 border-indigo-50 focus:border-purple-400 focus:bg-white outline-none transition-all text-xl font-bold text-indigo-900 placeholder-indigo-200"
                        placeholder="Ej: Coches, pajaritos..."
                        required
                    />
                </div>
            </div>
        </div>

        {/* Sección 2: Edad (Selector de Chips) */}
        <div>
            <label className="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-4 ml-2">¿Cuántos años tiene?</label>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {ages.map((a) => (
                    <button
                        key={a}
                        type="button"
                        onClick={() => setAge(a)}
                        className={`flex-shrink-0 w-14 h-14 rounded-2xl font-bold text-lg transition-all transform active:scale-95 border-2 ${
                            age === a 
                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-300' 
                            : 'bg-white text-gray-400 border-transparent hover:border-purple-100'
                        }`}
                    >
                        {a}
                    </button>
                ))}
            </div>
        </div>

        {/* Sección 2.5: Género */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-4 ml-2">
            Género del protagonista
          </label>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setGender('niño')}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${
                gender === 'niño'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                  : 'bg-white text-gray-400 border-transparent hover:border-indigo-100'
              }`}
            >
              👦 Niño
            </button>

            <button
              type="button"
              onClick={() => setGender('niña')}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${
                gender === 'niña'
                  ? 'bg-pink-500 text-white border-pink-500 shadow-lg'
                  : 'bg-white text-gray-400 border-transparent hover:border-pink-100'
              }`}
            >
              👧 Niña
            </button>
          </div>
        </div>


        {/* Sección 3: Tipo de Historia (Grid de Tarjetas) */}
        <div>
            <label className="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-4 ml-2">¿Qué ambiente prefieres?</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {storyTypes.map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => setStoryType(type.id)}
                        className={`p-4 rounded-3xl text-left transition-all border-2 relative overflow-hidden group ${
                            storyType === type.id 
                            ? 'bg-white border-purple-500 shadow-xl shadow-purple-100 ring-2 ring-purple-100' 
                            : 'bg-white border-transparent hover:border-purple-100 hover:shadow-md'
                        }`}
                    >
                        <span className="text-3xl mb-2 block transform group-hover:scale-110 transition-transform duration-300">{type.emoji}</span>
                        <span className={`font-bold ${storyType === type.id ? 'text-purple-700' : 'text-gray-500'}`}>{type.label}</span>
                        {storyType === type.id && (
                            <div className="absolute top-4 right-4 text-purple-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Sección 4: Idioma y Botón */}
        <div className="flex flex-col md:flex-row gap-4 items-center pt-4">
             <div className="w-full md:w-1/3">
                <label className="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-2">Idioma</label>
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white border-2 border-indigo-50 font-bold text-gray-600 appearance-none"
                >
                    <option value="Español">Español</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Catalán">Catalán</option>
                    <option value="Gallego">Gallego</option>
                    <option value="Euskera">Euskera</option>
                </select>
            </div>
            <button 
                type="submit"
                className="w-full md:w-2/3 bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] hover:from-[#FFBF69] hover:to-[#FF9F1C] text-white text-xl font-bold py-5 rounded-2xl shadow-xl shadow-orange-200 transition-all transform active:scale-95 mt-6 md:mt-0 flex justify-center items-center gap-2"
            >
                <span>✨</span> Crear Historia Mágica
            </button>
        </div>
      </form>
    </div>
  );
};

const GeneratingStory: React.FC = () => {
  const messages = [
    "Mezclando ingredientes mágicos...",
    "Reuniendo a los personajes...",
    "Dibujando paisajes lejanos...",
    "Añadiendo pizcas de estrellas...",
    "Escribiendo el final feliz..."
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#F3E8FF] via-white to-[#E0F2FE]">
      <div className="relative mb-12">
        <div className="text-9xl animate-pulse drop-shadow-xl">📖</div>
        <div className="absolute -top-4 -right-4 text-5xl animate-bounce">✨</div>
      </div>
      <p className="text-2xl font-bold text-[#2D3142] animate-pulse text-center max-w-xs">
        {messages[index]}
      </p>
    </div>
  );
};

const StoryCover: React.FC<{ story: Story; name?: string; onStartReading: () => void }> = ({ story, name, onStartReading }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-rose-50">
    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full text-center border-b-8 border-indigo-100 transform -rotate-1">
      <div className="text-6xl mb-8">🎈</div>
      <h1 className="text-4xl font-bold mb-4 text-[#2D3142] font-serif leading-tight">
        {story.title}
      </h1>
      {name && <p className="text-xl font-medium text-purple-400 mb-2">Un cuento para {name}</p>}
      <p className="text-xs text-gray-300 mb-12 uppercase tracking-widest font-bold">Edición especial para hoy</p>
      
      <button 
        onClick={onStartReading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-5 rounded-2xl shadow-xl transition-all transform hover:rotate-1 active:scale-95"
      >
        Abrir libro
      </button>
    </div>
  </div>
);

const Paywall: React.FC<{ onPurchase: () => void; onCancel: () => void; childName?: string;}> = ({ onPurchase, onCancel, childName }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto">
    <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom duration-500 border-t-8 border-yellow-400">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">⭐</div>
        <h3 className="text-2xl font-bold mb-3 text-indigo-900">
          {childName 
            ? `¿Continuamos con la historia de ${childName}?` 
            : "¿Continuamos la historia?"}
        </h3>

        <p className="text-gray-500 leading-relaxed">
          Estás leyendo un cuento único, creado solo para tu hijo.
          Desbloquea el final y guárdalo para volver a leerlo siempre que quieras.
        </p>
      </div>
      
      <div className="bg-indigo-50/50 p-6 rounded-3xl mb-8 space-y-4">
        <div className="flex items-center gap-4 text-sm font-semibold text-indigo-800">
          <div className="bg-green-400 text-white p-1 rounded-full text-[10px]">✓</div> Historia completa
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold text-indigo-800">
          <div className="bg-green-400 text-white p-1 rounded-full text-[10px]">✓</div> Guardado en biblioteca
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold text-indigo-800">
          <div className="bg-green-400 text-white p-1 rounded-full text-[10px]">✓</div> Acceso para siempre
        </div>
      </div>

      <button 
        onClick={onPurchase}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold py-5 rounded-2xl shadow-lg transition-all mb-4"
      >
        Desbloquear final – 2,99 €
      </button>
      <p>Pago único · Sin suscripciones</p>
      <p>Acceso inmediato</p>
      <button 
        onClick={onCancel}
        className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors"
      >
        Quizás luego
      </button>
    </div>
  </div>
);

const StoryReader: React.FC<{ 
  story: Story; 
  onFinished: () => void;
  isPaid: boolean;
  onShowPaywall: (page: number) => void;
  onBackToLibrary: () => void;
  initialPage?: number;
}> = ({ story, onFinished, isPaid, onShowPaywall, onBackToLibrary, initialPage = 0 }) => {

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [nightMode, setNightMode] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const totalPages = story.pages.length;

  // Cargar la página desde localStorage cuando el componente se monta
  useEffect(() => {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage)); // Cargamos la página desde localStorage
    }
  }, []);

  const handleNext = () => {
    if (currentPage === 3 && !isPaid) {
      onShowPaywall(currentPage);
      return;
    }
    if (currentPage < totalPages - 1) {
      setDirection(1); // 👉 avanzamos
      setCurrentPage(prev => {
        const newPage = prev + 1;
        localStorage.setItem('currentPage', newPage.toString()); // Guardamos la página actual
        return newPage;
      });
    } else {
      onFinished();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setDirection(-1); // 👈 retrocedemos
      setCurrentPage(prev => {
        const newPage = prev - 1;
        localStorage.setItem('currentPage', newPage.toString()); // Guardamos la página actual
        return newPage;
      });
    }
  };

  const renderParagraph = (text: string, index: number) => {
    return (
      <p key={index} className="text-xl md:text-2xl leading-loose text-left font-medium opacity-90 text-pretty">
        {text}
      </p>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 overflow-hidden ${nightMode ? 'bg-[#121212] text-[#E5E5E5]' : 'bg-[#FBF7F2] text-[#2D3142]'}`}>
      <div className="max-w-[680px] mx-auto px-8 py-12 min-h-screen flex flex-col">
        
        <div className="flex justify-between items-center h-14 mb-8">
           <button 
            onClick={() => setNightMode(!nightMode)}
            className={`p-3 rounded-2xl transition-all ${nightMode ? 'bg-white/10 text-yellow-300' : 'bg-white text-gray-300 shadow-sm'}`}
          >
            {nightMode ? '☀️' : '🌙'}
          </button>
          <div className="text-[11px] font-black tracking-[0.4em] opacity-40 uppercase">
            Pág. {currentPage + 1} / {totalPages}
          </div>
          <button onClick={onBackToLibrary} className="p-3 bg-white/5 rounded-2xl opacity-60 hover:opacity-100 transition-opacity">📚</button>
        </div>

        <div className="flex-1 flex flex-col justify-center py-2">
          <div className="bg-white/50 rounded-[2.5rem] px-6 py-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                initial={(dir) => ({
                  x: dir === 1 ? 60 : -60,
                  opacity: 0
                })}
                animate={{ x: 0, opacity: 1 }}
                exit={(dir) => ({
                  x: dir === 1 ? -60 : 60,
                  opacity: 0
                })}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full font-serif space-y-6"
              >
                {story.pages[currentPage].map((p, idx) => renderParagraph(p, idx))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8 pb-4 mt-8">
          <div className="h-[3px] bg-gray-200/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-700 ease-out" 
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center gap-5">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={`flex-1 py-4 rounded-2xl font-black transition-all border-2 ${currentPage === 0 ? 'opacity-0 pointer-events-none' : nightMode ? 'bg-white/5 border-white/10' : 'bg-white border-purple-50 shadow-sm'}`}
            >
              ←
            </button>
            <button 
              onClick={handleNext}
              className={`flex-[4] py-5 rounded-2xl font-black shadow-2xl transition-all text-white transform active:scale-95 ${nightMode ? 'bg-indigo-900/40 text-indigo-100' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {currentPage === totalPages - 1 ? '¡Fin de la magia! ✨' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


  // --- Pantalla de Pago ---
  const PaymentScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const handleStripeCheckout = async () => {
      try {
        const response = await fetch(
          "https://micuentomagico-backend.onrender.com/create-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Respuesta backend:", data);
          throw new Error("Backend error");
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error("No vino URL de Stripe:", data);
          alert("Error: Stripe no devolvió la URL");
        }
      } catch (err) {
        console.error("❌ Error iniciando pago:", err);
        alert("Hubo un error iniciando el pago. Inténtalo de nuevo.");
      }
    };

    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-indigo-100">
          <h2 className="text-3xl font-bold mb-4 text-center text-[#2D3142]">
            Tu cuento mágico está casi listo ✨
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            ¡Estás a solo un paso! El pago es seguro y el cuento será tuyo para siempre.
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center p-6 bg-indigo-50/50 rounded-3xl border-2 border-indigo-200">
              <span className="font-bold text-indigo-900">
                Cuento personalizado
              </span>
              <span className="text-2xl font-black text-indigo-600">
                2,99 €
              </span>
            </div>
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Pago único por historia · Acceso vitalicio
            </p>
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Sin suscripciones
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleStripeCheckout}
              className="w-full bg-black text-white flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-lg"
            >
              <span className="text-lg"></span> Pagar ahora – 2,99 €
            </button>

            <button 
              onClick={handleStripeCheckout}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 flex items-center justify-center gap-3 py-5 rounded-2xl font-bold"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/2560px-Google_Pay_Logo_%282020%29.svg.png" 
                alt="GPay" 
                className="h-5" 
              />
            </button>

            <div className="py-4 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-gray-100"></div>
              <span className="text-[10px] text-gray-300 uppercase font-black tracking-widest">
                Tarjeta bancaria
              </span>
              <div className="flex-1 h-[1px] bg-gray-100"></div>
            </div>

            <button 
              onClick={handleStripeCheckout}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-lg shadow-indigo-200"
            >
              Pagar con tarjeta
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Pantalla de Éxito ---
  const SuccessScreen: React.FC<{
    onFinish: () => void;
    story: Story | null;
  }> = ({ onFinish, story }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-8xl mb-8 animate-bounce drop-shadow-xl">🌟</div>

      <p className="text-gray-500 text-center mb-10 max-w-sm font-medium leading-relaxed">
        ¡Felicidades! Tu cuento está listo. 💜  
        Lo puedes leer siempre que quieras y ahora lo tienes guardado en tu biblioteca. También puedes descargarlo en PDF para no perderlo nunca.
      </p>

      <div className="w-full max-w-xs space-y-4">
        {story && (
          <button
            onClick={() => downloadStory(story)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold py-5 rounded-2xl shadow-xl transition-all"
          >
            ¡Descargar mi cuento ahora! ⬇️
          </button>
        )}

        <button
          onClick={onFinish}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-5 rounded-2xl shadow-xl transition-all"
        >
          Continuar leyendo
        </button>
      </div>
    </div>
  );


// --- Main App Logic ---

const STORAGE_KEY = 'cuentos_magicos_v2_library';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [story, setStory] = useState<Story | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [currentReadingPage, setCurrentReadingPage] = useState(0);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [legalOpen, setLegalOpen] = useState<null | "legal" | "privacy" | "terms">(null);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      const pending = localStorage.getItem("pending_story");

      if (pending) {
        const parsedStory = JSON.parse(pending);
        setStory(parsedStory);
        setIsPaid(true);
        saveStoryToLibrary(parsedStory);
        localStorage.removeItem("pending_story");
        setCurrentReadingPage(0);
        setShowPaymentSuccess(true);
        setScreen(AppScreen.SUCCESS);
      }

      window.history.replaceState({}, "", "/");
    }

    if (paymentStatus === "cancel") {
      window.history.replaceState({}, "", "/");
      setScreen(AppScreen.READER);
    }
  }, []);


useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsedStories = JSON.parse(stored);
      setSavedStories(parsedStories);
    } catch (e) {
      console.error("Error cargando la biblioteca:", e);
    }
  }
}, []);


  const saveStoryToLibrary = (storyToSave: Story) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentStories: Story[] = stored ? JSON.parse(stored) : [];

    const alreadyExists = currentStories.find(s => s.id === storyToSave.id);
    if (alreadyExists) return;

    const newList = [...currentStories, storyToSave];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    setSavedStories(newList);
  };

  const deleteStory = (id: string) => {
    if (window.confirm("¿Seguro que quieres borrar este cuento?")) {
      setSavedStories(prev => {
        const newList = prev.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
        return newList;
      });
    }
  };

  const handleGenerateStory = async (userPrefs: UserPreferences) => {
    setPrefs(userPrefs);
    setScreen(AppScreen.GENERATING);
    setCurrentReadingPage(0);
    
    try {
      const storyData = await generateStory(userPrefs);
      if (ADMIN_MODE) {
        setIsPaid(true);
      }

      setTimeout(() => {
        setStory(storyData);
        setScreen(AppScreen.COVER);
      }, 5000); 
    } catch (error) {
      alert("Hubo un error al crear la magia. Por favor, inténtalo de nuevo.");
      setScreen(AppScreen.CUSTOMIZATION);
    }
  };

  const handleFinishReading = () => {
    if (isPaid && story) {
      saveStoryToLibrary(story);
      setScreen(AppScreen.LIBRARY);
    } else {
      setScreen(AppScreen.SUCCESS);
    }
  };


  const handleOpenLibrary = () => {
    setScreen(AppScreen.LIBRARY);
  };

  const handleSelectStoryFromLibrary = (selectedStory: Story) => {
    setStory(selectedStory);
    setIsPaid(true);
    setCurrentReadingPage(0);
    setScreen(AppScreen.READER);
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] selection:bg-purple-100">
      {screen === AppScreen.LANDING && (
        <Landing 
          onStart={() => {
            setStory(null);
            setIsPaid(false);
            setScreen(AppScreen.CUSTOMIZATION);
          }}
          onOpenLibrary={handleOpenLibrary}
          hasStories={savedStories.length > 0}
          onOpenLegal={setLegalOpen}
        />
      )}



      {screen === AppScreen.LIBRARY && (
        <Library 
          stories={savedStories}
          onSelect={handleSelectStoryFromLibrary}
          onBack={() => setScreen(AppScreen.LANDING)}
          onDelete={deleteStory}
        />
      )}

      {screen === AppScreen.CUSTOMIZATION && (
        <CustomizationForm 
            onGenerate={handleGenerateStory} 
            onBack={() => setScreen(AppScreen.LANDING)}
        />
      )}

      {screen === AppScreen.GENERATING && (
        <GeneratingStory />
      )}

      {screen === AppScreen.COVER && story && (
        <StoryCover 
          story={story} 
          name={prefs?.name} 
          onStartReading={() => setScreen(AppScreen.READER)} 
        />
      )}

      {screen === AppScreen.READER && story && (
        <>
          <StoryReader 
            story={story} 
            isPaid={isPaid}
            initialPage={currentReadingPage}
            onShowPaywall={(page) => {
              setCurrentReadingPage(page);
              setShowPaywall(true);
            }}
            onFinished={handleFinishReading}
            onBackToLibrary={handleOpenLibrary}
          />
          {showPaywall && (
            <Paywall 
              childName={prefs?.name}
              onPurchase={() => {
                if (story) {
                  localStorage.setItem("pending_story", JSON.stringify(story));
                }
                setShowPaywall(false);
                setScreen(AppScreen.PAYMENT);
              }}
              onCancel={() => setShowPaywall(false)}
            />
          )}
        </>
      )}

      {screen === AppScreen.PAYMENT && (
        <PaymentScreen
          onComplete={() => {
            if (!story) return;

            setIsPaid(true);

            // 1. Guardar en biblioteca
            saveStoryToLibrary(story);

            // 2. Descargar PDF automáticamente
            setTimeout(() => {
              downloadStory(story);
            }, 500);

            // 3. Ir a pantalla de éxito
            setScreen(AppScreen.SUCCESS);
          }}
        />
      )}


      {screen === AppScreen.SUCCESS && showPaymentSuccess && story && (
        <SuccessScreen
          story={story}
          onDownload={() => {
            downloadStory(story, prefs?.name);
          }}
          onFinish={() => {
            setShowPaymentSuccess(false);
            setScreen(AppScreen.READER);
          }}
        />
      )}

      {legalOpen && (
        <LegalModal
          type={legalOpen}
          onClose={() => setLegalOpen(null)}
        />
      )}
    </main>
  );
}
