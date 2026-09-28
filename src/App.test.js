import { render, screen } from "@testing-library/react";
import App from "./App";

const renderAt = (path) => {
  window.history.pushState({}, "", path);
  return render(<App />);
};

test("renders the landing page with links to every generator", () => {
  renderAt("/");
  expect(screen.getByText(/welcome to qrx/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /wifi/i })).toHaveAttribute(
    "href",
    "/wifi-qr-code-generator"
  );
  expect(screen.getByRole("link", { name: /upi payment/i })).toHaveAttribute(
    "href",
    "/upi-qr-code-generator"
  );
});

test("renders a type page with its own H1, title and copy", () => {
  renderAt("/wifi-qr-code-generator");
  expect(
    screen.getByRole("heading", { level: 1, name: /wifi qr code generator/i })
  ).toBeInTheDocument();
  expect(document.title).toMatch(/wifi qr code generator/i);
  // The canonical tag lives in <head>, out of reach of Testing Library queries.
  // eslint-disable-next-line testing-library/no-node-access
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://qrx.samita.in/wifi-qr-code-generator"
  );
  expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
});

test("redirects legacy /form?type= links to the new route", () => {
  renderAt("/form?type=upi");
  expect(
    screen.getByRole("heading", { level: 1, name: /upi qr code generator/i })
  ).toBeInTheDocument();
  expect(window.location.pathname).toBe("/upi-qr-code-generator");
});

test("falls back to the landing page for unknown routes", () => {
  renderAt("/does-not-exist");
  expect(screen.getByText(/welcome to qrx/i)).toBeInTheDocument();
});
