import { Button } from "@packages/ui";

export default function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "";
  const apiLine =
    api.length > 0
      ? `NEXT_PUBLIC_API_URL: ${api}`
      : "NEXT_PUBLIC_API_URL: (unset)";
  return (
    <main className="main">
      <h1>web</h1>
      <p>{apiLine}</p>
      <Button style={{ marginTop: "1rem" }}>UI package button</Button>
    </main>
  );
}
