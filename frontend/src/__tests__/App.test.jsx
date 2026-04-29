import { render, screen } from "@testing-library/react";
import App from "../App.jsx";

test("renders active persona header", () => {
  render(<App />);
  expect(screen.getAllByText("Kshitij Mishra").length).toBeGreaterThan(0);
  expect(screen.getByText("Active Persona")).toBeInTheDocument();
});

test("renders suggestion chips", () => {
  render(<App />);
  expect(screen.getByText("How should I start a parking lot design?")).toBeInTheDocument();
  expect(screen.getByText("What trade-offs matter in cache design?")).toBeInTheDocument();
  expect(screen.getByText("How do I pick a design pattern?")).toBeInTheDocument();
});
