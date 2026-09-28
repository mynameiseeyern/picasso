import * as React from "react";
import { createRoot } from "react-dom/client";
import "./verify.css";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert/alert";
import { Button } from "@/components/button/button";

const TONES = ["info", "destructive", "warning", "success"] as const;

const Matrix = () => (
  <div className="flex flex-col gap-3" style={{ width: 634 }}>
    {TONES.map((v) => (
      <Alert key={v} variant={v}>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>This is an alert description.</AlertDescription>
      </Alert>
    ))}
    <Alert variant="info" onDismiss={() => {}} dismissLabel="Dismiss">
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>This is an alert description.</AlertDescription>
    </Alert>
    <Alert variant="info" action={<Button variant="outline" size="xs">Go to alert</Button>}>
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>This is an alert description.</AlertDescription>
    </Alert>
    <Alert variant="success">
      <AlertTitle>Title only</AlertTitle>
    </Alert>
    <Alert variant="warning" icon={false}>
      <AlertDescription>Description only, no icon.</AlertDescription>
    </Alert>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <>
    <div id="light" className="p-6 bg-surface-app"><Matrix /></div>
    <div id="dark" className="dark p-6 bg-surface-app"><Matrix /></div>
  </>,
);
