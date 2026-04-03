import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExtractStatusBadge } from "@/components/StatusBadges";
import type { ExtractStatus } from "@/lib/mock-data";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function PublicUploadPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [extractStatus, setExtractStatus] = useState<ExtractStatus>("PENDING");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast({ title: "Invalid file type", description: "Only PDF, .doc, and .docx files are allowed.", variant: "destructive" });
      return;
    }
    if (f.size > MAX_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10 MB.", variant: "destructive" });
      return;
    }
    setFile(f);
    setError(null);
  }, [toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim() || !email.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all fields and select a CV file.", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    setExtractStatus("PENDING");

    // Simulate extract flow
    setTimeout(() => setExtractStatus("SCANNING"), 1500);
    setTimeout(() => {
      setExtractStatus("COMPLETE");
      toast({ title: "CV Processed", description: "Your CV has been successfully extracted." });
    }, 5000);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            {extractStatus === "COMPLETE" ? (
              <CheckCircle className="mx-auto h-12 w-12 text-success" />
            ) : extractStatus === "FAILED" ? (
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            ) : (
              <FileText className="mx-auto h-12 w-12 text-primary animate-pulse" />
            )}
            <CardTitle className="mt-4">CV Received</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Thank you, <strong>{name}</strong>. Your CV is being processed.</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <ExtractStatusBadge status={extractStatus} />
            </div>
            {extractStatus === "FAILED" && (
              <p className="text-sm text-destructive">There was an error processing your CV. Our team has been notified and will reach out if needed.</p>
            )}
            {(extractStatus === "PENDING" || extractStatus === "SCANNING") && (
              <p className="text-xs text-muted-foreground">This page updates automatically...</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader className="text-center">
          <Upload className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="mt-2">Submit Your CV</CardTitle>
          <p className="text-sm text-muted-foreground">Upload your resume to apply for open positions</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
            <div>
              <Label htmlFor="cv">CV File</Label>
              <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
              <p className="mt-1 text-xs text-muted-foreground">PDF, .doc, .docx — Max 10 MB</p>
            </div>
            {file && (
              <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="truncate">{file.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              <Upload className="mr-2 h-4 w-4" />Submit CV
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
