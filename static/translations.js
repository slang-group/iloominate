var allTranslations = {
  "en": {
    "Add Page": "Add Page",
    "Book": "Book",
    "Cancel": "Cancel",
    "Email": "Email",
    "en": "en", // language for page (html lang="en")
    "Enable JavaScript!": "Enable JavaScript!",
    "Drop in an Image": "Drop in an Image",
    "Type first page": "Type first page",
    "Log In": "Log In",
    "Log Out": "Log Out",
    "ltr": "ltr", // left-to-right or right-to-left?
    "Make into PDF": "Make into PDF",
    "Make into Book": "Make into Book",
    "Name": "Name",
    "(Optional)": "(Optional)",
    "Original": "Original",
    "Page 1": "Page 1",
    "page_num": "Page %{page}", // like Page 1, Page 2
    "Password": "Password",
    "Save": "Save",
    "Save Word List": "Save Word List",
    "Sign Up": "Sign Up",
    "Team": "Team",
    "Upload": "Upload",
    "What is the story?": "What is the story?",
    "Word List": "Word List"
  },
  "es": {
    "Add Page": "Añadir Página",
    "Book": "Libro",
    "Cancel": "Cancelar",
    "Email": "Email",
    "en": "es",
    "Enable JavaScript!": "¡Active JavaScript!",
    "Drop in an Image": "Coloca una Imagen",
    "Type first page": "Escriba la primera página",
    "Log In": "Log In",
    "Log Out": "Log Out",
    "ltr": "ltr",
    "Make into PDF": "Crear PDF",
    "Make into Book": "Crear Libro",
    "Name": "Nombre",
    "(Optional)": "(Opcional)",
    "Original": "Original",
    "Page 1": "Página 1",
    "page_num": "Página %{page}", // like Page 1, Page 2
    "Password": "Contraseña",
    "Save": "Guardar",
    "Save Word List": "Guardar Lista de Palabras",
    "Sign Up": "Sign Up",
    "Team": "Equipo",
    "Upload": "Subir",
    "What is the story?": "¿Qué es su historia?",
    "Word List": "Lista de Palabras"
  },
  "ht": {
    "Add Page": "Ajoute Paj",
    "Book": "Liv",
    "Cancel": "Cancel",
    "en": "ht",
    "Email": "Email",
    "Enable JavaScript!": "Aktive JavaScript!",
    "Drop in an Image": "Mete yon imaj",
    "Type first page": "Tipe premye paj la",
    "Log In": "Log In",
    "Log Out": "Log Out",
    "ltr": "ltr",
    "Make into PDF": "Fè PDF",
    "Make into Book": "Fè Liv",
    "Name": "Name",
    "(Optional)": "(Optional)",
    "Original": "Original",
    "Page 1": "Paj 1",
    "page_num": "Paj %{page}", // like Page 1, Page 2
    "Password": "Password",
    "Save": "Save",
    "Save Word List": "Save Word List",
    "Sign Up": "Sign Up",
    "Team": "Team",
    "Upload": "Upload",
    "What is the story?": "Kisa istwa a ye?",
    "Word List": "Word List"
  },
  /* not actual translations below - still proof of concept */
  "ar": {
    "en": "ar",
    "Enable JavaScript!": "تفعيل جافا سكريبت",
    "Drop in an Image": "الصفحة_الرئيسية",
    "Type first page": "الصفحة_الرئيسية",
    "Make into PDF": "الصفحة_الرئيسية",
    "ltr": "rtl"
  },
  "ne": {
    "en": "ne",
    "ltr": "ltr"
  }
};

// helper function to return standard or requested translations from server
var getTranslations = function (req) {

  // detect language on server side, return translations
  var preferredLocale;
  if (typeof req === "string") {
    preferredLocale = req;
  } else {
    preferredLocale = req.query.language || (req.headers['accept-language'] || "").split(",")[0];
  }

  if (!allTranslations[preferredLocale]) {
    // check if there is a match for the root locale (es_uy -> es)
    preferredLocale = preferredLocale.split("_")[0];
    if (!allTranslations[preferredLocale]) {
      // default (en)
      preferredLocale = "en";
    }
  }
  return JSON.stringify(allTranslations[preferredLocale]);
};


try {
  // use exports if this is used as a Node.js module
  exports.getTranslations = getTranslations;
} catch (e) {

}
