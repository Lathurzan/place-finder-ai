import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "Welcome": "Welcome",
      "Settings": "Settings",
      "Search": "Search",
      "Save changes": "Save changes",
      // ...add more keys as needed
    }
  },
  fr: {
    translation: {
      "Welcome": "Bienvenue",
      "Settings": "Paramètres",
      "Search": "Chercher",
      "Save changes": "Enregistrer les modifications",
      // ...add more keys as needed
    }
  },
  es: {
    translation: {
      "Welcome": "Bienvenido",
      "Settings": "Configuración",
      "Search": "Buscar",
      "Save changes": "Guardar cambios",
      // ...add more keys as needed
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
