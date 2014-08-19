var allTranslations = {
  "en": {
    "About the team": "About the team",
    "Add Icon": "Add Icon",
    "Add Page": "Add Page",
    "Ask to Join": "Ask to Join",
    "Book": "Book",
    "Cancel": "Cancel",
    "Create": "Create",
    "Download": "Download",
    "Drop in an Image": "Drop in an Image",
    "Edit": "Edit",
    "Email": "Email",
    "en": "en", // language for page (html lang="en")
    "Enable JavaScript!": "Enable JavaScript!",
    "first_page_message": "This is your first page!\nStart writing and add new pages.",
    "Guide": "Guide",
    "Join team": "Join team",
    "Language": "Language",
    "Lead new team": "Lead new team",
    "leader": "leader",
    "Log In": "Log In",
    "Log Out": "Log Out",
    "ltr": "ltr", // left-to-right or right-to-left?
    "Make into PDF": "Make into PDF",
    "My Books": "My Books",
    "Name": "Name",
    "New Book": "New Book",
    "New Icon": "New Icon",
    "new_page_message": "You made a new page. Write this page, and keep this story going!",
    "Next": "Next",
    "Online": "Online",
    "(Optional)": "(Optional)",
    "Original": "Original",
    "Page 1": "Page 1",
    "page_num": "Page %{page}", // like Page 1, Page 2
    "Password": "Password",
    "Save": "Save",
    "Save Word List": "Save Word List",
    "Sign Up": "Sign Up",
    "Team": "Team",
    "Team name": "Team name",
    "Type first page": "Type first page",
    "Upload": "Upload",
    "View": "View",
    "Welcome to iLoominate": "Welcome to iLoominate",
    "What is the story?": "What is the story?",
    "Word List": "Word List",
    "You are signed in.": "You are signed in."
  },
  "es": {
    "About the team": "El equipo",
    "Add Icon": "Añadir Imagen",
    "Add Page": "Añadir Página",
    "Ask to Join": "Ask to Join",
    "Book": "Libro",
    "Cancel": "Cancelar",
    "Create": "Create",
    "Download": "Download",
    "Drop in an Image": "Coloca una Imagen",
    "Edit": "Editar",
    "Email": "Email",
    "en": "es",
    "Enable JavaScript!": "¡Active JavaScript!",
    "first_page_message": "¡Su primera página!\nEmpieza a escribir y añadir páginas nuevas.",
    "Guide": "Guía",
    "Join team": "Join team",
    "Language": "Lengua",
    "Lead new team": "Lead new team",
    "leader": "leader",
    "Log In": "Log In",
    "Log Out": "Log Out",
    "ltr": "ltr",
    "Make into PDF": "Crear PDF",
    "My Books": "Mis Libros",
    "Name": "Nombre",
    "New Book": "Libro Nuevo",
    "New Icon": "Imagen Nuevo",
    "new_page_message": "Creas una página nueva.\n¡Escribe y continua su historia!",
    "Next": "Siguiente",
    "Online": "Online",
    "(Optional)": "(Opcional)",
    "Original": "Original",
    "Page 1": "Página 1",
    "page_num": "Página %{page}", // like Page 1, Page 2
    "Password": "Contraseña",
    "Save": "Guardar",
    "Save Word List": "Guardar Lista de Palabras",
    "Sign Up": "Sign Up",
    "Team": "Equipo",
    "Team name": "Nombre del equipo",
    "Type first page": "Escriba la primera página",
    "Upload": "Subir",
    "View": "Ver",
    "Welcome to iLoominate": "Bienvenidos a iLoominate",
    "What is the story?": "¿Qué es su historia?",
    "Word List": "Lista de Palabras",
    "You are signed in.": "You are signed in."
  },
  "ht": {
    "About the team": "About the team",
    "Add Icon": "Ajoute Icon",
    "Add Page": "Ajoute Paj",
    "Ask to Join": "Ask to Join",
    "Book": "Liv",
    "Cancel": "Cancel",
    "Create": "Create",
    "Download": "Download",
    "Drop in an Image": "Mete yon imaj",
    "Edit": "Edit",
    "en": "ht",
    "Email": "Email",
    "Enable JavaScript!": "Aktive JavaScript!",
    "first_page_message": "This is your first page!\nStart writing and add new pages.",
    "Guide": "Guide",
    "Join team": "Join team",
    "Language": "Language",
    "Lead new team": "Lead new team",
    "leader": "leader",
    "Log In": "Log In",
    "Log Out": "Log Out",
    "ltr": "ltr",
    "Make into PDF": "Fè PDF",
    "My Books": "Mon Liv",
    "Name": "Name",
    "New Book": "New Book",
    "New Icon": "New Icon",
    "new_page_message": "You made a new page. Write this page, and keep this story going!",
    "Next": "Next",
    "Online": "Online",
    "(Optional)": "(Optional)",
    "Original": "Original",
    "Page 1": "Paj 1",
    "page_num": "Paj %{page}", // like Page 1, Page 2
    "Password": "Password",
    "Save": "Save",
    "Save Word List": "Save Word List",
    "Sign Up": "Sign Up",
    "Team": "Team",
    "Team name": "Team name",
    "Type first page": "Tipe premye paj la",
    "Upload": "Upload",
    "View": "View",
    "Welcome to iLoominate": "Welcome to iLoominate",
    "What is the story?": "Kisa istwa a ye?",
    "Word List": "Word List",
    "You are signed in.": "You are signed in."
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
var getTranslations = function (req, res) {

  // detect language on server side, return translations
  var preferredLocale;
  if (typeof req === "string") {
    preferredLocale = req;
  } else {
    preferredLocale = req.query.language || req.cookies.language || (req.headers['accept-language'] || "").split(",")[0];
    res.cookie('language', preferredLocale);
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
