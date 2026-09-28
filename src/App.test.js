import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the landing page with QR type options", () => {
  render(<App />);
  expect(screen.getByText(/welcome to qrx/i)).toBeInTheDocument();
  expect(screen.getByText(/choose qr code type/i)).toBeInTheDocument();
});
