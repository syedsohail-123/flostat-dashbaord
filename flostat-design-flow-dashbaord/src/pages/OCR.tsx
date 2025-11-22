import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFileForOCR, parseOCRResponse } from "@/lib/operations/ocrApis";
import {
  Upload,
  FileText,
  CheckCircle,
  Image as ImageIcon,
  PlayCircle,
  Square,
  Loader2,
  Clipboard,
  Download,
  X,
  Pencil,
} from "lucide-react";

type ExtractedItem = {
  id: string;
  label: string;
  value: string;
  confidence: number;
  editing?: boolean;
};

export default function OCR() {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rawText, setRawText] = useState<string>("");
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pickFile = () => fileInputRef.current?.click();

  const onFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB.");
      return;
    }
    setError(null);
    setFile(f);
    setItems([]);
    setRawText("");
    setProgress(0);
    setIsExtracting(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onFiles(e.dataTransfer.files);
  };

  const startExtraction = async () => {
    if (!file) return;

    setIsExtracting(true);
    setProgress(10);
    setItems([]);
    setRawText("");
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      // Get auth token from localStorage
      const token = localStorage.getItem('token');

      // Call the real OCR API
      const response = await uploadFileForOCR(file, token);

      console.log('OCR API Response:', response);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        // Parse the response
        const { extractedItems, rawText: extractedText } = parseOCRResponse(response);

        console.log('Extracted Items:', extractedItems);
        console.log('Raw Text:', extractedText);

        setItems(extractedItems);
        setRawText(extractedText);

        toast({
          title: "Extraction complete",
          description: `${file.name} processed successfully`
        });
      } else {
        console.error('OCR API returned success=false:', response);
        throw new Error(response.message || response.error || "OCR extraction failed");
      }
    } catch (error: any) {
      console.error("OCR Error:", error);
      setError(error.message || "Failed to extract text from file");
      toast({
        title: "Extraction failed",
        description: error.message || "An error occurred during text extraction",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const stopExtraction = () => {
    setIsExtracting(false);
    setProgress(0);
  };

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied", description: "Value copied to clipboard" });
  };

  const copyAll = () => {
    const text = items.map((it) => `${it.label}: ${it.value}`).join("\n");
    navigator.clipboard.writeText(text || rawText);
    toast({ title: "Copied", description: "All extracted text copied" });
  };

  const clearAll = () => {
    setFile(null);
    setPreviewUrl(null);
    setItems([]);
    setRawText("");
    setProgress(0);
    setIsExtracting(false);
    setError(null);
  };

  const toggleEdit = (id: string, editing: boolean) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, editing } : it)));
  };

  const updateValue = (id: string, value: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, value } : it)));
  };

  const exportCSV = () => {
    if (!items.length) return;

    // Create CSV content
    const headers = ['Label', 'Value', 'Confidence'];
    const rows = items.map(item => [
      item.label,
      item.value,
      `${item.confidence}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `ocr-extraction-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Exported", description: "CSV file downloaded successfully" });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Text Extractor (OCR)</h1>
        <p className="text-muted-foreground mt-1">Extract and digitize data from images and documents</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left: Upload and preview */}
        <Card className="xl:col-span-1 bg-gradient-card shadow-soft-lg border-border/60">
          <CardHeader className="border-b bg-secondary/5">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-[hsl(var(--aqua))]" />
              Upload & Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div
              className={
                `rounded-lg border-2 border-dashed p-8 text-center transition-smooth hover:bg-[hsl(var(--aqua))/0.06] ` +
                `${isDragging ? 'border-[hsl(var(--aqua))] bg-[hsl(var(--aqua))/0.06]' : 'border-border'}`
              }
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              role="button"
              tabIndex={0}
              aria-label="Upload by drag and drop or browse to select a file"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pickFile(); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-1">Drop file here or click to browse</h3>
              <p className="text-sm text-muted-foreground mb-4">JPG, PNG, PDF • Up to 10MB</p>
              <div className="flex items-center justify-center gap-2">
                <Button variant="aqua" onClick={pickFile}>Select File</Button>
                {file && (
                  <Button variant="ghost" onClick={clearAll} className="text-soft-muted">Clear</Button>
                )}
              </div>
            </div>

            {/* Preview */}
            {file && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-soft-muted">Selected</div>
                  <div className="text-sm font-medium">{file.name}</div>
                </div>
                <div className="relative overflow-hidden rounded-md border bg-background">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-64 w-full object-contain" />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mr-2" /> PDF preview not supported
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center gap-2">
                  {!isExtracting ? (
                    <Button onClick={startExtraction} disabled={!file} className="gap-2">
                      <PlayCircle className="h-4 w-4" /> Start Extraction
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopExtraction} className="gap-2">
                      <Square className="h-4 w-4" /> Stop
                    </Button>
                  )}
                  <Button variant="outline" disabled={!file} className="gap-2" onClick={copyAll}>
                    <Clipboard className="h-4 w-4" /> Copy All
                  </Button>
                  <Button variant="outline" disabled={!items.length && !rawText} className="gap-2">
                    <Download className="h-4 w-4" /> Export TXT
                  </Button>
                </div>

                {/* Progress */}
                {isExtracting && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm text-soft-muted mb-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="mt-1 text-xs text-soft-subtle" aria-live="polite">{progress}%</div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-sm text-destructive flex items-center gap-2">
                    <X className="h-4 w-4" /> {error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Results */}
        <Card className="xl:col-span-2 shadow-soft-lg border-border/60">
          <CardHeader className="border-b bg-secondary/5">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[hsl(var(--aqua))]" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="structured">
              <TabsList>
                <TabsTrigger value="structured">Structured</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
              <TabsContent value="structured" className="mt-4">
                {!items.length && !isExtracting ? (
                  <div className="text-sm text-soft-muted">No data yet. Upload a file and start extraction.</div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.confidence}% confidence</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          {item.editing ? (
                            <div className="flex-1 mr-3">
                              <Input
                                value={item.value}
                                onChange={(e) => updateValue(item.id, e.target.value)}
                                className="h-8"
                                aria-label={`Edit ${item.label}`}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <span className="font-mono text-sm font-semibold mr-3 truncate">{item.value}</span>
                          )}
                          <div className="flex gap-2">
                            {!item.editing ? (
                              <Button variant="outline" size="sm" onClick={() => toggleEdit(item.id, true)} className="gap-1">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </Button>
                            ) : (
                              <Button variant="aqua" size="sm" onClick={() => toggleEdit(item.id, false)}>
                                Save
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => copyValue(item.value)}>
                              Copy
                            </Button>
                          </div>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success transition-all" style={{ width: `${item.confidence}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="raw" className="mt-4">
                {!rawText && !isExtracting ? (
                  <div className="text-sm text-soft-muted">No raw text available.</div>
                ) : (
                  <textarea
                    className="w-full min-h-[260px] rounded-md border bg-card p-3 text-sm font-mono"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    aria-label="Raw extracted text"
                  />
                )}
              </TabsContent>
            </Tabs>

            {/* Footer actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="aqua" disabled={!items.length && !rawText} className="flex-1 min-w-[160px]">
                Save to Database
              </Button>
              <Button variant="outline" disabled={!items.length && !rawText} className="flex-1 min-w-[160px]" onClick={exportCSV}>
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
