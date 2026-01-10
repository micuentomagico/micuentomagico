import React from "react";

type LegalType = "legal" | "privacy" | "terms";

interface Props {
  type: LegalType;
  onClose: () => void;
}

export default function LegalModal({ type, onClose }: Props) {
  const content = {
    legal: {
      title: "Aviso legal",
      text: `
Titular del sitio web:
Mi Cuento Mágico

Correo electrónico:
contacto@micuentomagico.es

Dominio:
https://micuentomagico.es

Objeto del sitio web:
Servicio de generación de cuentos infantiles personalizados mediante inteligencia artificial.

Naturaleza del contenido:
El contenido generado tiene carácter lúdico, creativo y de entretenimiento.
No sustituye asesoramiento profesional educativo, psicológico o médico.

Responsabilidad:
El titular no se hace responsable del uso que los usuarios hagan del contenido generado.

Propiedad intelectual:
Los cuentos generados son para uso personal y familiar.
Queda prohibida su distribución o uso comercial sin autorización.

Legislación aplicable:
Legislación española y normativa europea vigente.
      `,
    },

    privacy: {
      title: "Política de privacidad",
      text: `
Datos recogidos:
Nombre del niño y preferencias narrativas introducidas voluntariamente por el usuario.

Finalidad:
Generar el cuento infantil solicitado.

Conservación de datos:
Los datos no se almacenan en servidores del titular.
Las historias se guardan únicamente en el navegador del usuario.

Menores de edad:
No se almacenan datos personales de menores en ningún sistema del titular.
El servicio está dirigido exclusivamente a padres o tutores legales.

Pagos:
Los pagos se procesan mediante Stripe.
El titular no almacena ni tiene acceso a datos bancarios.

Cookies:
Este sitio no utiliza cookies propias ni de terceros.
      `,
    },

    terms: {
      title: "Términos y condiciones",
      text: `
Servicio:
Creación de cuentos infantiles personalizados mediante inteligencia artificial.

Precio:
Pago único por cuento.
No existen suscripciones ni pagos recurrentes.

Acceso al contenido:
El acceso al cuento se mantiene mientras el usuario conserve el dispositivo o navegador donde se haya generado.

Entrega:
El contenido se genera y entrega de forma inmediata tras el pago.

Devoluciones:
No se admiten devoluciones al tratarse de contenido digital personalizado.

Uso permitido:
Uso personal y familiar exclusivamente.

Disponibilidad:
El servicio puede experimentar mejoras, cambios o interrupciones técnicas sin previo aviso.
      `,
    },
  };

  const { title, text } = content[type];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl overflow-y-auto max-h-[80vh]">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>

        <pre className="whitespace-pre-wrap text-sm text-gray-600 leading-relaxed">
          {text}
        </pre>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
