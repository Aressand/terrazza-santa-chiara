import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-display text-4xl text-foreground mb-4">
        Terrazza Santa Chiara
      </h1>
      <Button className="btn-terracotta">Test Button</Button>
      <div className="mt-4 p-4 card-elegant">
        <p className="text-body">Card test</p>
      </div>
    </main>
  );
}
