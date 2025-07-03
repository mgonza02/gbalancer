import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        print: 'Print',
        download: 'Download',
        upload: 'Upload',
        yes: 'Yes',
        no: 'No',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        recalculating: 'Recalculating',
        rotated: 'Rotated'
      },

      // Navigation
      nav: {
        dashboard: 'Dashboard',
        newPlanning: 'New Planning',
        viewHistoric: 'View Historic',
        help: 'Help',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout'
      },

      // Theme
      theme: {
        switchToLight: 'Switch to light mode',
        switchToDark: 'Switch to dark mode',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode'
      },

      // Dashboard
      dashboard: {
        title: 'Cutting Planner Dashboard',
        subtitle: 'Optimize material usage with intelligent piece cutting and guillotine cut planning',
        totalProjects: 'Total Projects',
        sheetsUsed: 'Sheets Used',
        totalPieces: 'Total Pieces',
        guillotineCuts: 'Guillotine Cuts',
        avgEfficiency: 'Avg Efficiency',
        thisMonth: 'This month',
        totalCalculated: 'Total calculated',
        allProjects: 'All projects',
        totalOperations: 'Total operations',
        materialUsage: 'Material usage',
        quickActions: 'Quick Actions',
        newPlanningTitle: 'New Planning',
        newPlanningDesc: 'Start a new piece cutting optimization project',
        viewHistoryTitle: 'View History',
        viewHistoryDesc: 'Browse your previous piece cutting projects',
        recentProjects: 'Recent Projects',
        noProjects: 'No projects yet',
        createFirstProject: 'Create your first piece cutting project',
        viewAllProjects: 'View All Projects',
        efficiency: 'Efficiency',
        pieces: 'pieces',
        sheets: 'sheets',
        actions: 'Actions',
        supportedMaterials: 'Supported Materials & Cutting Applications',
        glass: 'Glass',
        glassDesc: 'Windows, partitions, displays',
        glassNote: 'Straight guillotine cuts only',
        wood: 'Wood',
        woodDesc: 'Panels, doors, shelving',
        woodNote: 'Optimized for piece yield',
        metal: 'Metal',
        metalDesc: 'Steel, aluminum sheets',
        metalNote: 'Minimizes waste material',
        plastic: 'Plastic',
        plasticDesc: 'Acrylic, polycarbonate',
        plasticNote: 'Clean cut optimization'
      },

      // New Planning
      newPlanning: {
        title: 'New Cutting Project',
        subtitle: 'Create an optimized cutting plan for your pieces',
        projectInfo: 'Project Information',
        projectName: 'Project Name',
        projectNamePlaceholder: 'Enter project name',
        materialType: 'Material Type',
        selectMaterial: 'Select material type',
        sheetDimensions: 'Sheet Dimensions',
        width: 'Width',
        height: 'Height',
        widthPlaceholder: 'Sheet width in mm',
        heightPlaceholder: 'Sheet height in mm',
        pieces: 'Pieces to Cut',
        addPiece: 'Add Piece',
        pieceWidth: 'Piece Width',
        pieceHeight: 'Piece Height',
        quantity: 'Quantity',
        removeThis: 'Remove this piece',
        calculate: 'Calculate Cutting Plan',
        calculating: 'Calculating...',
        results: 'Results',
        noResults: 'No results yet',
        runCalculation: 'Run a calculation to see the optimal cutting plan',
        efficiency: 'Efficiency',
        sheetsNeeded: 'Sheets Needed',
        totalPieces: 'Total Pieces',
        wasteArea: 'Waste Area',
        saveProject: 'Save Project',
        exportPDF: 'Export PDF',
        optimization: 'Optimization',
        layout: 'Layout',
        statistics: 'Statistics',
        validation: {
          projectNameRequired: 'Project name is required',
          materialRequired: 'Please select a material type',
          sheetWidthRequired: 'Sheet width is required',
          sheetHeightRequired: 'Sheet height is required',
          piecesRequired: 'At least one piece is required',
          pieceWidthRequired: 'Piece width is required',
          pieceHeightRequired: 'Piece height is required',
          quantityRequired: 'Quantity is required',
          invalidDimensions: 'Dimensions must be positive numbers'
        }
      },

      // View Historic
      viewHistoric: {
        title: 'Project History',
        subtitle: 'View and manage your previous piece cutting optimization projects',
        recentProjects: 'Recent Projects',
        noProjects: 'No projects found',
        createFirst: 'Create your first piece cutting project to see it here',
        projectName: 'Project Name',
        material: 'Material',
        dateCreated: 'Date Created',
        sheetsUsed: 'Sheets Used',
        totalPieces: 'Total Pieces',
        efficiency: 'Efficiency',
        actions: 'Actions',
        viewDetails: 'View Details',
        recalculate: 'Recalculate',
        clone: 'Clone Project',
        exportPDF: 'Export PDF',
        deleteProject: 'Delete',
        totalProjects: 'Total Projects',
        totalSheetsUsed: 'Total Sheets Used',
        averageEfficiency: 'Average Efficiency',
        projectInfo: 'Project Information',
        pieceRequirements: 'Piece Requirements',
        sheetDimensions: 'Sheet Dimensions',
        sheetsNeeded: 'Sheets Needed',
        confirmDelete: 'Confirm Delete',
        deleteConfirmation: 'Are you sure you want to delete this project?',
        projectDetails: 'Project Details:',
        name: 'Name',
        created: 'Created',
        cannotUndo: 'This action cannot be undone.',
        cloneProject: 'Clone Project',
        cloneDescription: 'Create a copy of this project with a new name',
        originalProject: 'Original Project:',
        newProjectName: 'New Project Name',
        enterCloneName: 'Enter a name for the cloned project',
        loading: 'Loading...',
        notifications: {
          projectDeleted: 'Project deleted successfully',
          projectCloned: 'Project cloned successfully!',
          pdfExported: 'PDF exported successfully!',
          exportFailed: 'Failed to export PDF. Please try again.',
          cloneFailed: 'Error cloning project. Please try again.',
          nameRequired: 'Please enter a project name',
          nameExists: 'A project with this name already exists'
        }
      },

      // Cutting Plan Visualization
      visualization: {
        title: 'Cutting Plan Layout',
        sheetNumber: 'Sheet {{number}}',
        ofSheets: 'of {{total}}',
        pieces: 'pieces',
        cuts: 'cuts',
        waste: 'waste',
        efficiency: 'efficiency',
        usedArea: 'Used Area',
        wasteArea: 'Waste Area',
        guillotineCuts: 'Guillotine Cuts',
        materialEfficiency: 'Material Efficiency',
        exportingPDF: 'Exporting PDF...',
        exportPDF: 'Export PDF',
        legend: 'Legend',
        placedPieces: 'Placed Pieces',
        wasteAreas: 'Waste Areas',
        cutLines: 'Cut Lines',
        dimensions: 'Dimensions',
        noResults: 'No layout data available for visualization',
        noResultsDesc: 'This project may have been created before the visualization feature was added.'
      },

      // PDF Export
      pdf: {
        projectSummary: 'Project Summary',
        sheetLayout: 'Sheet Layout',
        cuttingPlan: 'Cutting Plan',
        pieceRequirements: 'Piece Requirements',
        projectInformation: 'Project Information',
        materialType: 'Material Type',
        sheetDimensions: 'Sheet Dimensions',
        sheetsRequired: 'Sheets Required',
        totalPieces: 'Total Pieces',
        materialEfficiency: 'Material Efficiency',
        totalPieceArea: 'Total Piece Area',
        sheetArea: 'Sheet Area',
        created: 'Created',
        projectOverview: 'Project Overview',
        totalSheets: 'Total Sheets',
        overallEfficiency: 'Overall Efficiency',
        totalMaterialUsed: 'Total Material Used',
        totalMaterialWaste: 'Total Material Waste',
        cuttingComplexity: 'Cutting Complexity',
        cutsPerPiece: 'cuts per piece',
        sheetSummary: 'Sheet Summary:',
        efficient: 'efficient',
        pieceList: 'Piece List for This Sheet:',
        position: 'Position',
        area: 'Area',
        instance: 'Instance',
        summary: 'Summary:',
        cutting: 'Cutting:',
        guillotineCutsRequired: 'guillotine cuts required',
        cutsPerPieceAvg: 'cuts per piece average'
      },

      // Materials
      materials: {
        glass: 'Glass',
        wood: 'Wood',
        metal: 'Metal',
        plastic: 'Plastic',
        other: 'Other'
      },

      // Errors and Messages
      messages: {
        loadingProjects: 'Loading projects...',
        savingProject: 'Saving project...',
        calculatingLayout: 'Calculating optimal layout...',
        exportingPDF: 'Exporting to PDF...',
        projectSaved: 'Project saved successfully!',
        projectSaveFailed: 'Failed to save project. Please try again.',
        calculationFailed: 'Calculation failed. Please check your inputs.',
        pdfExportFailed: 'PDF export failed. Please try again.',
        invalidInput: 'Please check your input values',
        connectionError: 'Connection error. Please try again.',
        unexpectedError: 'An unexpected error occurred'
      }
    }
  },
  es: {
    translation: {
      // Common
      common: {
        loading: 'Cargando...',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        close: 'Cerrar',
        confirm: 'Confirmar',
        back: 'Atrás',
        next: 'Siguiente',
        create: 'Crear',
        update: 'Actualizar',
        search: 'Buscar',
        filter: 'Filtrar',
        export: 'Exportar',
        import: 'Importar',
        print: 'Imprimir',
        download: 'Descargar',
        upload: 'Subir',
        yes: 'Sí',
        no: 'No',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Información',
        recalculating: 'Recalculando',
        rotated: 'Rotado'
      },

      // Navigation
      nav: {
        dashboard: 'Panel de Control',
        newPlanning: 'Nueva Planificación',
        viewHistoric: 'Ver Historial',
        help: 'Ayuda',
        settings: 'Configuración',
        profile: 'Perfil',
        logout: 'Cerrar Sesión'
      },

      // Theme
      theme: {
        switchToLight: 'Cambiar a modo claro',
        switchToDark: 'Cambiar a modo oscuro',
        lightMode: 'Modo Claro',
        darkMode: 'Modo Oscuro'
      },

      // Dashboard
      dashboard: {
        title: 'Panel de Planificación de Cortes',
        subtitle: 'Optimiza el uso de material con planificación inteligente de piezas y cortes guillotina',
        totalProjects: 'Proyectos Totales',
        sheetsUsed: 'Láminas Utilizadas',
        totalPieces: 'Piezas Totales',
        guillotineCuts: 'Cortes Guillotina',
        avgEfficiency: 'Eficiencia Promedio',
        thisMonth: 'Este mes',
        totalCalculated: 'Total calculado',
        allProjects: 'Todos los proyectos',
        totalOperations: 'Operaciones totales',
        materialUsage: 'Uso de material',
        quickActions: 'Acciones Rápidas',
        newPlanningTitle: 'Nueva Planificación',
        newPlanningDesc: 'Iniciar un nuevo proyecto de optimización de corte de piezas',
        viewHistoryTitle: 'Ver Historial',
        viewHistoryDesc: 'Explorar tus proyectos anteriores de corte de piezas',
        recentProjects: 'Proyectos Recientes',
        noProjects: 'Aún no hay proyectos',
        createFirstProject: 'Crea tu primer proyecto de corte de piezas',
        viewAllProjects: 'Ver Todos los Proyectos',
        efficiency: 'Eficiencia',
        pieces: 'piezas',
        sheets: 'láminas',
        actions: 'Acciones',
        supportedMaterials: 'Materiales Soportados y Aplicaciones de Corte',
        glass: 'Vidrio',
        glassDesc: 'Ventanas, divisiones, pantallas',
        glassNote: 'Solo cortes guillotina rectos',
        wood: 'Madera',
        woodDesc: 'Paneles, puertas, estanterías',
        woodNote: 'Optimizado para rendimiento de piezas',
        metal: 'Metal',
        metalDesc: 'Láminas de acero, aluminio',
        metalNote: 'Minimiza desperdicio de material',
        plastic: 'Plástico',
        plasticDesc: 'Acrílico, policarbonato',
        plasticNote: 'Optimización de corte limpio'
      },

      // New Planning
      newPlanning: {
        title: 'Nuevo Proyecto de Corte',
        subtitle: 'Crear un plan de corte optimizado para tus piezas',
        projectInfo: 'Información del Proyecto',
        projectName: 'Nombre del Proyecto',
        projectNamePlaceholder: 'Ingresa el nombre del proyecto',
        materialType: 'Tipo de Material',
        selectMaterial: 'Selecciona el tipo de material',
        sheetDimensions: 'Dimensiones de la Lámina',
        width: 'Ancho',
        height: 'Alto',
        widthPlaceholder: 'Ancho de la lámina en mm',
        heightPlaceholder: 'Alto de la lámina en mm',
        pieces: 'Piezas a Cortar',
        addPiece: 'Agregar Pieza',
        pieceWidth: 'Ancho de la Pieza',
        pieceHeight: 'Alto de la Pieza',
        quantity: 'Cantidad',
        removeThis: 'Eliminar esta pieza',
        calculate: 'Calcular Plan de Corte',
        calculating: 'Calculando...',
        results: 'Resultados',
        noResults: 'Aún no hay resultados',
        runCalculation: 'Ejecuta un cálculo para ver el plan de corte óptimo',
        efficiency: 'Eficiencia',
        sheetsNeeded: 'Láminas Necesarias',
        totalPieces: 'Piezas Totales',
        wasteArea: 'Área de Desperdicio',
        saveProject: 'Guardar Proyecto',
        exportPDF: 'Exportar PDF',
        optimization: 'Optimización',
        layout: 'Distribución',
        statistics: 'Estadísticas',
        validation: {
          projectNameRequired: 'El nombre del proyecto es requerido',
          materialRequired: 'Por favor selecciona un tipo de material',
          sheetWidthRequired: 'El ancho de la lámina es requerido',
          sheetHeightRequired: 'El alto de la lámina es requerido',
          piecesRequired: 'Se requiere al menos una pieza',
          pieceWidthRequired: 'El ancho de la pieza es requerido',
          pieceHeightRequired: 'El alto de la pieza es requerido',
          quantityRequired: 'La cantidad es requerida',
          invalidDimensions: 'Las dimensiones deben ser números positivos'
        }
      },

      // View Historic
      viewHistoric: {
        title: 'Historial de Proyectos',
        subtitle: 'Ver y gestionar tus proyectos anteriores de optimización de corte de piezas',
        recentProjects: 'Proyectos Recientes',
        noProjects: 'No se encontraron proyectos',
        createFirst: 'Crea tu primer proyecto de corte de piezas para verlo aquí',
        projectName: 'Nombre del Proyecto',
        material: 'Material',
        dateCreated: 'Fecha de Creación',
        sheetsUsed: 'Láminas Utilizadas',
        totalPieces: 'Piezas Totales',
        efficiency: 'Eficiencia',
        actions: 'Acciones',
        viewDetails: 'Ver Detalles',
        recalculate: 'Recalcular',
        clone: 'Clonar Proyecto',
        exportPDF: 'Exportar PDF',
        deleteProject: 'Eliminar',
        totalProjects: 'Proyectos Totales',
        totalSheetsUsed: 'Láminas Totales Utilizadas',
        averageEfficiency: 'Eficiencia Promedio',
        projectInfo: 'Información del Proyecto',
        pieceRequirements: 'Requisitos de Piezas',
        sheetDimensions: 'Dimensiones de la Lámina',
        sheetsNeeded: 'Láminas Necesarias',
        confirmDelete: 'Confirmar Eliminación',
        deleteConfirmation: '¿Estás seguro de que quieres eliminar este proyecto?',
        projectDetails: 'Detalles del Proyecto:',
        name: 'Nombre',
        created: 'Creado',
        cannotUndo: 'Esta acción no se puede deshacer.',
        cloneProject: 'Clonar Proyecto',
        cloneDescription: 'Crear una copia de este proyecto con un nuevo nombre',
        originalProject: 'Proyecto Original:',
        newProjectName: 'Nuevo Nombre del Proyecto',
        enterCloneName: 'Ingresa un nombre para el proyecto clonado',
        loading: 'Cargando...',
        notifications: {
          projectDeleted: 'Proyecto eliminado exitosamente',
          projectCloned: '¡Proyecto clonado exitosamente!',
          pdfExported: '¡PDF exportado exitosamente!',
          exportFailed: 'Error al exportar PDF. Por favor intenta de nuevo.',
          cloneFailed: 'Error al clonar el proyecto. Por favor intenta de nuevo.',
          nameRequired: 'Por favor ingresa un nombre de proyecto',
          nameExists: 'Ya existe un proyecto con este nombre'
        }
      },

      // Cutting Plan Visualization
      visualization: {
        title: 'Distribución del Plan de Corte',
        sheetNumber: 'Lámina {{number}}',
        ofSheets: 'de {{total}}',
        pieces: 'piezas',
        cuts: 'cortes',
        waste: 'desperdicio',
        efficiency: 'eficiencia',
        usedArea: 'Área Utilizada',
        wasteArea: 'Área de Desperdicio',
        guillotineCuts: 'Cortes Guillotina',
        materialEfficiency: 'Eficiencia del Material',
        exportingPDF: 'Exportando PDF...',
        exportPDF: 'Exportar PDF',
        legend: 'Leyenda',
        placedPieces: 'Piezas Colocadas',
        wasteAreas: 'Áreas de Desperdicio',
        cutLines: 'Líneas de Corte',
        dimensions: 'Dimensiones',
        noResults: 'No hay datos de distribución disponibles para la visualización',
        noResultsDesc: 'Este proyecto puede haber sido creado antes de que se añadiera la función de visualización.'
      },

      // PDF Export
      pdf: {
        projectSummary: 'Resumen del Proyecto',
        sheetLayout: 'Distribución de la Lámina',
        cuttingPlan: 'Plan de Corte',
        pieceRequirements: 'Requisitos de Piezas',
        projectInformation: 'Información del Proyecto',
        materialType: 'Tipo de Material',
        sheetDimensions: 'Dimensiones de la Lámina',
        sheetsRequired: 'Láminas Requeridas',
        totalPieces: 'Piezas Totales',
        materialEfficiency: 'Eficiencia del Material',
        totalPieceArea: 'Área Total de Piezas',
        sheetArea: 'Área de la Lámina',
        created: 'Creado',
        projectOverview: 'Resumen del Proyecto',
        totalSheets: 'Láminas Totales',
        overallEfficiency: 'Eficiencia General',
        totalMaterialUsed: 'Material Total Utilizado',
        totalMaterialWaste: 'Desperdicio Total de Material',
        cuttingComplexity: 'Complejidad de Corte',
        cutsPerPiece: 'cortes por pieza',
        sheetSummary: 'Resumen de la Lámina:',
        efficient: 'eficiente',
        pieceList: 'Lista de Piezas para Esta Lámina:',
        position: 'Posición',
        area: 'Área',
        instance: 'Instancia',
        summary: 'Resumen:',
        cutting: 'Corte:',
        guillotineCutsRequired: 'cortes guillotina requeridos',
        cutsPerPieceAvg: 'cortes por pieza promedio'
      },

      // Materials
      materials: {
        glass: 'Vidrio',
        wood: 'Madera',
        metal: 'Metal',
        plastic: 'Plástico',
        other: 'Otro'
      },

      // Errors and Messages
      messages: {
        loadingProjects: 'Cargando proyectos...',
        savingProject: 'Guardando proyecto...',
        calculatingLayout: 'Calculando distribución óptima...',
        exportingPDF: 'Exportando a PDF...',
        projectSaved: '¡Proyecto guardado exitosamente!',
        projectSaveFailed: 'Error al guardar el proyecto. Por favor intenta de nuevo.',
        calculationFailed: 'Cálculo fallido. Por favor revisa tus datos de entrada.',
        pdfExportFailed: 'Error al exportar PDF. Por favor intenta de nuevo.',
        invalidInput: 'Por favor revisa tus valores de entrada',
        connectionError: 'Error de conexión. Por favor intenta de nuevo.',
        unexpectedError: 'Ocurrió un error inesperado'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie']
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
