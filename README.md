# QR Code Generator

A modern, user-friendly web application for generating customizable QR codes. Built with React and Ant Design, this application allows users to create QR codes with various customization options.

## Features

- Generate QR codes from website URLs
- Customize QR code appearance:
  - Multiple image formats (PNG, JPEG, WebP)
  - Adjustable margin size
  - Quality settings
  - Custom QR code color
  - Custom background color
  - Mask pattern selection
  - Adjustable width
- Download generated QR codes
- URL validation for secure (https) links
- Modern, responsive UI using Ant Design
- Real-time QR code preview

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Docker and Docker Compose (for containerized deployment)

## Installation

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/yourusername/qrcode-react.git
cd qrcode-react
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

### Docker Deployment

#### Development Mode

```bash
docker-compose up app-dev
```

#### Production Mode

```bash
docker-compose up app-prod
```

The production application will be available at [http://localhost](http://localhost).

## Usage

1. Enter a valid HTTPS URL in the input field
2. Customize the QR code using the available options:
   - Select image type (PNG, JPEG, WebP)
   - Adjust margin using the slider
   - Set quality using the slider
   - Choose QR code color using the color picker
   - Choose background color using the color picker
   - Set mask pattern (0-7)
   - Adjust width (200-1200px)
3. Click the generate button to create the QR code
4. Download the generated QR code using the download button

## Technologies Used

- React 17.0.2
- Ant Design (antd) 5.9.2
- QRCode library 1.5.0
- Create React App

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Samita Mondal
