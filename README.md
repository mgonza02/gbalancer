# Modern Dashboard Template

A clean and modern React dashboard template built with Material-UI, featuring dark/light mode switching and multilanguage support.

## Features

- ✨ **Modern Design**: Built with Material-UI components and modern React patterns
- 🌙 **Dark/Light Mode**: Toggle between dark and light themes with persistent settings
- 🌍 **Multilanguage Support**: English and Spanish language support with i18next
- 📱 **Responsive Layout**: Mobile-first responsive design
- 🎨 **Customizable Themes**: Easy theme customization with Material-UI theming
- 🔧 **Ready to Use**: Clean project structure ready for development

## Tech Stack

- **React 19** - Modern React with hooks
- **Material-UI (MUI)** - React UI framework
- **React Router** - Client-side routing
- **i18next** - Internationalization framework
- **Vite** - Fast build tool
- **ESLint & Prettier** - Code linting and formatting

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd modern-dashboard-template
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run prettier` - Format code with Prettier
- `npm run format` - Run both Prettier and ESLint fixes

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Theme, etc.)
├── hooks/             # Custom React hooks
├── i18n/              # Internationalization setup
├── layout/            # Layout components
├── menu-items/        # Navigation menu configuration
├── pages/             # Page components
├── routes/            # Routing configuration
├── themes/            # Theme configuration
├── utils/             # Utility functions
└── App.jsx            # Main App component
```

## Features Guide

### Dark/Light Mode

The template includes a built-in theme switcher that allows users to toggle between dark and light modes. The preference is automatically saved to localStorage and persists across sessions.

### Multilanguage Support

Currently supports English and Spanish. Languages can be switched using the language switcher component. Add new languages by extending the translation files in `src/i18n/`.

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/routes/MainRoutes.jsx`
3. Add menu item in `src/menu-items/`
4. Add translations in `src/i18n/index.js`

### Customizing Themes

Theme customization can be done in `src/themes/`. The template uses Material-UI's theming system, allowing you to customize colors, typography, spacing, and component styles.

## Building for Production

```bash
npm run build
```

The build folder will contain the optimized production build.

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For questions and support, please open an issue on the GitHub repository.
